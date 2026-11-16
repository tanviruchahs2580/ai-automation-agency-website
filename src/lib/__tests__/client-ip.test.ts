import { describe, expect, it } from "vitest";
import {
  canonicalizeClientAddress,
  rateLimitKey,
  resolveClientAddress,
  UNKNOWN_CLIENT,
} from "@/lib/client-ip";

/**
 * Client-address resolution for rate limiting.
 *
 * The endpoint used to read `request.headers.get("x-forwarded-for").split(",")[0]`
 * — the left-most entry, which is the one a caller can write themselves. Any
 * script could therefore rotate that header and get a fresh rate-limit bucket
 * per request, defeating the limiter entirely while still appearing to have one.
 * These cases pin the resolution order and the fail-closed behaviour.
 *
 * The `canonicalizeClientAddress` block below pins a second bypass of the same
 * control: validation without canonicalisation. An IPv6 address has many legal
 * spellings, and every spelling used to become its own bucket key — so a client
 * did not need to forge a header at all, just re-print its own address
 * differently on each request.
 */

const headers = (map: Record<string, string>) => ({
  get: (name: string) => map[name.toLowerCase()] ?? null,
});

describe("resolveClientAddress", () => {
  it("prefers a platform-set single-value header over x-forwarded-for", () => {
    expect(
      resolveClientAddress(
        headers({
          "x-vercel-forwarded-for": "203.0.113.9",
          "x-forwarded-for": "1.2.3.4, 203.0.113.9",
        }),
      ),
    ).toBe("203.0.113.9");
  });

  it("ignores a spoofed left-most x-forwarded-for entry", () => {
    /*
      The attack this closes: the client sends its own value, the proxy appends
      the address it actually saw. Reading the left-most entry hands the
      attacker a new bucket for every request.
    */
    expect(
      resolveClientAddress(
        headers({ "x-forwarded-for": "9.9.9.9, 9.9.9.10, 198.51.100.7" }),
      ),
    ).toBe("198.51.100.7");
  });

  it("honours cloudflare and x-real-ip when that platform is the deploy target", () => {
    expect(
      resolveClientAddress(headers({ "cf-connecting-ip": "198.51.100.4" }), {
        platform: "cloudflare",
      }),
    ).toBe("198.51.100.4");
    expect(
      resolveClientAddress(headers({ "x-real-ip": "198.51.100.5" }), {
        platform: "nginx",
      }),
    ).toBe("198.51.100.5");
  });

  it("ignores those headers when the deploy target does not set them", () => {
    /*
      The bypass this closes is not header *forging* by the client — it is the
      server believing a header nobody vouched for. `x-real-ip` and
      `true-client-ip` are written by nginx and Akamai respectively; on a host
      that has neither, they are ordinary request headers a caller can set to a
      new value on every request.

      Production does not currently expose this (Vercel sets
      `x-vercel-forwarded-for`, which wins first), but correct-by-accident is not
      the same as correct. The trust decision is now explicit.
    */
    expect(
      resolveClientAddress(
        headers({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "198.51.100.9" }),
        { platform: "vercel" },
      ),
    ).toBe("198.51.100.9");

    expect(
      resolveClientAddress(headers({ "true-client-ip": "9.9.9.9" }), {
        platform: "node",
      }),
    ).toBe(UNKNOWN_CLIENT);
  });

  it("still prefers the platform header on the platform that sets it", () => {
    expect(
      resolveClientAddress(
        headers({
          "x-vercel-forwarded-for": "203.0.113.9",
          "x-forwarded-for": "1.2.3.4, 203.0.113.9",
        }),
        { platform: "vercel" },
      ),
    ).toBe("203.0.113.9");
  });

  it("fails closed when nothing trustworthy is present", () => {
    expect(resolveClientAddress(headers({}))).toBe(UNKNOWN_CLIENT);
    expect(resolveClientAddress(headers({ "x-forwarded-for": "not-an-ip" }))).toBe(
      UNKNOWN_CLIENT,
    );
  });

  it("rejects values that are not IP literals rather than using them as keys", () => {
    // Arbitrary strings as bucket keys would let a caller grow the limiter map.
    expect(resolveClientAddress(headers({ "x-forwarded-for": "a".repeat(200) }))).toBe(
      UNKNOWN_CLIENT,
    );
    expect(
      resolveClientAddress(headers({ "x-forwarded-for": "evil.example.com" })),
    ).toBe(UNKNOWN_CLIENT);
  });

  it("normalises ports and IPv6 brackets", () => {
    expect(resolveClientAddress(headers({ "x-forwarded-for": "203.0.113.5:443" }))).toBe(
      "203.0.113.5",
    );
    expect(resolveClientAddress(headers({ "x-forwarded-for": "[2001:db8::1]" }))).toBe(
      "2001:db8::1",
    );
  });

  it("reads only the right-most x-forwarded-for entry, and only if it parses", () => {
    /*
      The right-most entry is the one our own hop appended, naming the peer that
      connected to us. Every entry to its left was supplied by some downstream
      client. Therefore a malformed left entry does not invalidate a valid
      right-most address, while a malformed right-most value must fail closed
      rather than promote a client-controlled left entry to trusted.
    */
    expect(
      resolveClientAddress(headers({ "x-forwarded-for": "unknown, 198.51.100.8" })),
    ).toBe("198.51.100.8");
    expect(
      resolveClientAddress(headers({ "x-forwarded-for": "1.2.3.4, not-an-ip" })),
      "must not fall back to the client-written entry",
    ).toBe(UNKNOWN_CLIENT);
  });

  it("accepts the transport wrappings real proxies emit in the trusted position", () => {
    /*
      Each of these failed to parse before the fix, which — through the
      leftward walk — handed control to the client. They are legal and observed
      in the wild: a bracketed IPv6 with a port, a quoted address, and a zone id.
    */
    const cases: Array<[string, string]> = [
      ["[2001:db8::1]:443", "2001:db8::1"],
      ['"203.0.113.9"', "203.0.113.9"],
      ['"203.0.113.9:8443"', "203.0.113.9"],
      ["203.0.113.9:443", "203.0.113.9"],
      ["[::1]:8080", "::1"],
    ];
    for (const [raw, expected] of cases) {
      expect(resolveClientAddress(headers({ "x-forwarded-for": raw })), raw).toBe(expected);
    }
  });
});

describe("canonicalizeClientAddress", () => {
  it("collapses every legal spelling of one IPv6 address to a single key", () => {
    /*
      Measured before the fix: these four spellings produced four distinct
      rate-limit buckets, so a client could rotate windows by re-printing its own
      address — no header forgery required.
    */
    const spellings = [
      "2001:db8::1",
      "2001:DB8::1",
      "2001:0db8:0:0:0:0:0:1",
      "2001:db8:0:0:0:0:0:1",
      "2001:0DB8:0000:0000:0000:0000:0000:0001",
    ];
    const keys = spellings.map((value) => canonicalizeClientAddress(value));
    expect(new Set(keys).size, JSON.stringify(keys)).toBe(1);
    expect(keys[0]).toBe("2001:db8::1");
  });

  it("canonicalises the loopback and unspecified forms", () => {
    expect(canonicalizeClientAddress("::1")).toBe("::1");
    expect(canonicalizeClientAddress("0:0:0:0:0:0:0:1")).toBe("::1");
    expect(canonicalizeClientAddress("::")).toBe("::");
  });

  it("keeps a full eight-group address expanded", () => {
    expect(canonicalizeClientAddress("2001:db8:1:2:3:4:5:6")).toBe(
      "2001:db8:1:2:3:4:5:6",
    );
  });

  it("compresses the longest zero run, and the leftmost on a tie", () => {
    // Two runs of two; the first must win, matching RFC 5952 §4.2.2.
    expect(canonicalizeClientAddress("2001:0:0:1:0:0:1:1")).toBe("2001::1:0:0:1:1");
    // A single zero group is never compressed.
    expect(canonicalizeClientAddress("2001:db8:0:1:2:3:4:5")).toBe("2001:db8:0:1:2:3:4:5");
  });

  it("reduces IPv4-mapped IPv6 to plain dotted IPv4", () => {
    // RFC 5952 §5: a mapped address *is* an IPv4 address. Collapsing it matters
    // because `rateLimitKey` would otherwise fold every IPv4 client behind a
    // dual-stack listener into the single `::/64` bucket.
    expect(canonicalizeClientAddress("::ffff:192.0.2.1")).toBe("192.0.2.1");
    expect(canonicalizeClientAddress("::ffff:c000:201")).toBe("192.0.2.1");
  });

  it("returns null for values that are not IP literals", () => {
    expect(canonicalizeClientAddress("evil.example.com")).toBeNull();
    expect(canonicalizeClientAddress("")).toBeNull();
    expect(canonicalizeClientAddress("2001:db8:::1")).toBeNull();
  });
});

describe("rateLimitKey", () => {
  it("reduces IPv6 to its /64 prefix so one host cannot rotate its own address", () => {
    /*
      Measured before the fix: this function returned the full address, because
      the prefix was handed to the canonicaliser as a bare four-group string,
      which is not a valid IPv6 literal — so validation failed and the code fell
      back to the input. The /64 rule was documented and inert.
    */
    const keys = [
      "2001:db8:1:2::1",
      "2001:db8:1:2::ffff",
      "2001:db8:1:2:aaaa:bbbb:cccc:dddd",
      "2001:0DB8:0001:0002:0:0:0:9",
    ].map(rateLimitKey);
    expect(new Set(keys).size, JSON.stringify(keys)).toBe(1);
    expect(keys[0]).toBe("2001:db8:1:2::/64");
  });

  it("decomposes NAT64 and 6to4 instead of folding the IPv4 internet into one bucket", () => {
    /*
      The /64 rule is right for a customer network and wrong for a prefix that
      *encodes* an IPv4 address. Keyed naively, `64:ff9b::/64` is not one
      customer — it is every IPv4 destination reachable from an IPv6-only mobile
      network, so all of them would share five submissions a minute. The same
      holds for the 6to4 relay prefix.
    */
    const nat64 = ["64:ff9b::203.0.113.5", "64:ff9b::198.51.100.7", "64:ff9b::8.8.8.8"];
    const nat64Keys = nat64.map(rateLimitKey);
    expect(new Set(nat64Keys).size, JSON.stringify(nat64Keys)).toBe(3);
    // And the embedded address lands in the same bucket as the plain form, so a
    // NAT64 client cannot get a second allowance by using its IPv6 route.
    expect(rateLimitKey("64:ff9b::203.0.113.5")).toBe(rateLimitKey("203.0.113.5"));

    const sixToFour = ["2002:cb00:7105::1", "2002:c633:6407::1"];
    const sixToFourKeys = sixToFour.map(rateLimitKey);
    expect(new Set(sixToFourKeys).size, JSON.stringify(sixToFourKeys)).toBe(2);
    expect(rateLimitKey("2002:cb00:7105::1")).toBe(rateLimitKey("203.0.113.5"));
  });

  it("keeps different /64s in different buckets", () => {
    expect(rateLimitKey("2001:db8:1:2::1")).not.toBe(rateLimitKey("2001:db8:1:3::1"));
  });

  it("keys IPv4, including IPv4-mapped, on the full address", () => {
    // A mapped address must not fold into the shared `::/64` bucket.
    expect(rateLimitKey("203.0.113.5")).toBe("203.0.113.5");
    expect(rateLimitKey("::ffff:203.0.113.5")).toBe("203.0.113.5");
    expect(rateLimitKey("::ffff:cb00:7105")).toBe("203.0.113.5");
  });

  it("applies the /64 rule to the remaining special-use range too", () => {
    /*
      `::1` therefore shares `::/64`. That is correct rather than a collision:
      once `::ffff:0:0/96` is unwrapped to IPv4, what remains in that /64 is the
      unspecified address, loopback, and the deprecated IPv4-compatible range —
      none of which a public client can source from. Pinned so the behaviour is
      a decision rather than an accident.
    */
    expect(rateLimitKey("::1")).toBe("::/64");
    expect(rateLimitKey("::")).toBe("::/64");
  });

  it("passes through values it cannot canonicalise", () => {
    expect(rateLimitKey(UNKNOWN_CLIENT)).toBe(UNKNOWN_CLIENT);
  });
});

describe("canonicalizeClientAddress rejects the malformed forms the old validator did", () => {
  /*
    `isIpLiteral` was the previous validator and is now removed: the resolution
    path uses `canonicalizeClientAddress`, and nothing referenced the old export.
    Two validators with different semantics for one question is how the next
    reader picks the wrong one, so its distinct cases move here rather than
    being dropped with it.
  */
  it("accepts valid IPv4 and IPv6", () => {
    for (const value of ["0.0.0.0", "255.255.255.255", "2001:db8::1", "::1", "fe80::1"]) {
      expect(canonicalizeClientAddress(value), value).not.toBeNull();
    }
  });

  it("rejects octets over 255 and leading zeros", () => {
    expect(canonicalizeClientAddress("256.0.0.1")).toBeNull();
    expect(canonicalizeClientAddress("999.1.1.1")).toBeNull();
    // "01.2.3.4" must not alias "1.2.3.4" as a bucket key.
    expect(canonicalizeClientAddress("01.2.3.4")).toBeNull();
  });

  it("rejects malformed IPv6", () => {
    expect(canonicalizeClientAddress("2001:db8:::1")).toBeNull();
    expect(canonicalizeClientAddress("1:2:3:4:5:6:7:8:9")).toBeNull();
  });

  it("rejects hostnames, empty input, and over-long strings", () => {
    expect(canonicalizeClientAddress("example.com")).toBeNull();
    expect(canonicalizeClientAddress("")).toBeNull();
    expect(canonicalizeClientAddress("a".repeat(46))).toBeNull();
  });
});
