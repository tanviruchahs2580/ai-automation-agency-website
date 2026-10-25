import { describe, expect, it } from "vitest";
import {
  isIpLiteral,
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

  it("honours cloudflare and x-real-ip", () => {
    expect(resolveClientAddress(headers({ "cf-connecting-ip": "198.51.100.4" }))).toBe(
      "198.51.100.4",
    );
    expect(resolveClientAddress(headers({ "x-real-ip": "198.51.100.5" }))).toBe(
      "198.51.100.5",
    );
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

  it("skips an invalid entry and uses the next valid one", () => {
    expect(
      resolveClientAddress(headers({ "x-forwarded-for": "unknown, 198.51.100.8" })),
    ).toBe("198.51.100.8");
  });
});

describe("isIpLiteral", () => {
  it("accepts valid IPv4 and IPv6", () => {
    for (const value of ["0.0.0.0", "255.255.255.255", "2001:db8::1", "::1", "fe80::1"]) {
      expect(isIpLiteral(value), value).toBe(true);
    }
  });

  it("rejects octets over 255 and leading zeros", () => {
    expect(isIpLiteral("256.0.0.1")).toBe(false);
    expect(isIpLiteral("999.1.1.1")).toBe(false);
    // "01.2.3.4" must not alias "1.2.3.4" as a bucket key.
    expect(isIpLiteral("01.2.3.4")).toBe(false);
  });

  it("rejects malformed IPv6", () => {
    expect(isIpLiteral("2001:db8:::1")).toBe(false);
    expect(isIpLiteral("1:2:3:4:5:6:7:8:9")).toBe(false);
  });

  it("rejects hostnames and arbitrary strings", () => {
    expect(isIpLiteral("example.com")).toBe(false);
    expect(isIpLiteral("")).toBe(false);
    expect(isIpLiteral("a".repeat(46))).toBe(false);
  });
});
