/**
 * Client address resolution for rate limiting.
 *
 * `x-forwarded-for` is **client-writable**. A caller can send their own value,
 * and most proxies *append* the address they actually observed. Reading the
 * left-most entry — the common implementation — therefore hands an attacker a
 * trivial bypass: rotate the header, get a fresh rate-limit bucket per request.
 *
 * So the question this module answers is not "what does the header say" but
 * "which of these headers was written by the platform that terminated the
 * connection". That is a property of the *deploy target*, not of the header
 * name: `x-real-ip` is trustworthy behind nginx and is an ordinary
 * client-writable header anywhere else. The platform gate below makes the
 * decision explicit instead of relying on the order of an array.
 *
 * Resolution order, most trustworthy first:
 *
 *   1. The single-value header belonging to the detected platform.
 *   2. The **right-most** `x-forwarded-for` entry — the address appended by the
 *      nearest trusted proxy as it forwarded the request.
 *   3. `"unknown"`, which fails *closed*: every unidentifiable caller shares one
 *      bucket, so an unattributable flood is throttled rather than exempted.
 *
 * The returned value is only ever used as an in-memory bucket key. It is
 * validated as an IP literal *and* canonicalised first: validation alone was not
 * enough, because every legal spelling of one IPv6 address used to become its
 * own bucket (see `canonicalizeClientAddress`).
 */

export const UNKNOWN_CLIENT = "unknown";

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
/* Dots are allowed so an embedded IPv4 suffix (`::ffff:192.0.2.1`) survives
   transport; `expandIpv6` is strict about where it may appear. */
const IPV6_CHARS = /^[0-9a-f:.]+$/i;
const IPV6_GROUP = /^[0-9a-f]{1,4}$/i;

function isValidIpv4(value: string): boolean {
  const match = IPV4.exec(value);
  if (!match) return false;
  return match.slice(1).every((octet) => {
    // Reject leading zeros ("01") so "1.2.3.04" cannot alias "1.2.3.4".
    if (octet.length > 1 && octet.startsWith("0")) return false;
    return Number(octet) <= 255;
  });
}

/**
 * Expands any well-formed IPv6 literal to eight lowercase, zero-stripped groups.
 * Returns null for anything that is not an IPv6 literal.
 */
function expandIpv6(value: string): string[] | null {
  if (!value.includes(":") || !IPV6_CHARS.test(value)) return null;

  /*
    An embedded IPv4 suffix is rewritten into the two hex groups it stands for
    before the address is split, so "::ffff:192.0.2.1" and "::ffff:c000:201"
    converge on the same eight groups. It may only appear as the final label.
  */
  let normalized = value;
  const lastColon = value.lastIndexOf(":");
  const lastLabel = value.slice(lastColon + 1);
  if (lastLabel.includes(".")) {
    if (!isValidIpv4(lastLabel)) return null;
    const [a, b, c, d] = lastLabel.split(".").map(Number);
    const high = ((a << 8) | b).toString(16);
    const low = ((c << 8) | d).toString(16);
    normalized = `${value.slice(0, lastColon + 1)}${high}:${low}`;
  } else if (value.includes(".")) {
    // A dotted label anywhere but last is not a valid IPv6 address.
    return null;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;

  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];

  if (halves.length === 1) {
    if (head.length !== 8) return null;
  } else {
    // "::" must stand for at least one group.
    if (head.length + tail.length > 7) return null;
  }

  const groups = [
    ...head,
    ...Array<string>(8 - head.length - tail.length).fill("0"),
    ...tail,
  ];

  if (!groups.every((group) => IPV6_GROUP.test(group))) return null;
  return groups.map((group) => parseInt(group, 16).toString(16));
}

/**
 * Canonical textual form of an IP literal, or null if it is not one.
 *
 * IPv6 has many legal spellings for one address — case, zero padding, and which
 * run of zero groups is elided. Rate limiting keys on the string, so without
 * this every spelling was a separate bucket: `2001:db8::1`, `2001:DB8::1` and
 * `2001:0db8:0:0:0:0:0:1` each bought a fresh window, and a client could rotate
 * them by simply re-printing its own address.
 *
 * Output follows RFC 5952: lowercase, no leading zeros, and the longest run of
 * zero groups compressed to `::` (the leftmost run on a tie, and never a single
 * group). IPv4-mapped IPv6 (`::ffff:a.b.c.d`) is returned as plain dotted IPv4,
 * as §5 recommends — see the note there about bucket collisions.
 */
export function canonicalizeClientAddress(value: string): string | null {
  if (value.length > 45) return null;
  if (isValidIpv4(value)) return value;

  const groups = expandIpv6(value);
  if (!groups) return null;

  /*
    An IPv4-mapped address is an IPv4 address wearing an IPv6 hat. Collapsing it
    to the dotted form is not cosmetic: `rateLimitKey` reduces any address with a
    colon to its /64, so leaving these mapped would fold *every* IPv4 client
    behind a dual-stack listener into the single bucket `::/64` — one caller
    could then exhaust the limit for all of them.
  */
  if (groups.slice(0, 5).every((group) => group === "0") && groups[5] === "ffff") {
    return ipv4KeyFromGroups(groups[6], groups[7]);
  }

  let bestStart = -1;
  let bestLength = 0;
  for (let i = 0; i < groups.length; i += 1) {
    if (groups[i] !== "0") continue;
    let end = i;
    while (end < groups.length && groups[end] === "0") end += 1;
    const length = end - i;
    if (length > bestLength) {
      bestStart = i;
      bestLength = length;
    }
    i = end;
  }

  if (bestLength < 2) return groups.join(":");

  const left = groups.slice(0, bestStart).join(":");
  const right = groups.slice(bestStart + bestLength).join(":");
  return `${left}::${right}`;
}

/**
 * Bucket key for a canonical address.
 *
 * IPv6 is keyed on its /64 prefix, not on the full address. A single host is
 * routinely handed a whole /64, so it can bind any of 2^64 source addresses —
 * and operating systems rotate the interface identifier on their own (RFC 4941
 * privacy extensions). Keying on the full address therefore leaves the limiter
 * bypassable even after canonicalisation, while keying on the prefix is what a
 * WAF does and is the smallest unit an ISP actually assigns to one customer.
 *
 * The trade-off is deliberate and worth stating: every device on one IPv6
 * network shares a bucket, exactly as every device behind one IPv4 NAT already
 * does. For an intake form limited to five submissions per minute that is the
 * correct side to err on.
 */
export function rateLimitKey(address: string): string {
  // Canonicalise first so a caller cannot hand in a mapped address or an
  // alternate spelling and land in a different bucket than the resolved form.
  const canonical = canonicalizeClientAddress(address) ?? address;
  if (!canonical.includes(":")) return canonical;

  const groups = expandIpv6(canonical);
  if (!groups) return canonical;

  /*
    Prefixes that *encode* an IPv4 address must be decomposed before the /64
    rule is applied, because their /64 is not a customer network — it is the
    whole IPv4 internet.

    NAT64 (`64:ff9b::/96`, RFC 6052) is how IPv6-only mobile networks reach
    IPv4 servers, so these are real visitors, not an edge case. Keyed as
    `64:ff9b::/64` every one of them shares five submissions a minute.
    `2002::/16` (6to4, RFC 3056) has the same shape. Both carry the IPv4
    address in a fixed position, so reduce to it and reuse the IPv4 bucket.
  */
  if (
    groups[0] === "64" &&
    groups[1] === "ff9b" &&
    groups.slice(2, 6).every((group) => group === "0")
  ) {
    const key = ipv4KeyFromGroups(groups[6], groups[7]);
    if (key) return key;
  }
  if (groups[0] === "2002") {
    const key = ipv4KeyFromGroups(groups[1], groups[2]);
    if (key) return key;
  }

  /*
    A bare four-group string is not a valid IPv6 literal, so it cannot be passed
    to `canonicalizeClientAddress` directly — pad the remaining four groups with
    zeros and canonicalise the whole /64 prefix. (An earlier version did pass the
    bare prefix, which failed validation and silently fell back to the full
    address: the /64 rule looked implemented and was not.)

    The `/64` is appended to the canonical prefix, which already carries its own
    `::` elision, so it must not be sandwiched between two of them.
  */
  const prefix = canonicalizeClientAddress(
    [...groups.slice(0, 4), "0", "0", "0", "0"].join(":"),
  );
  return prefix === null ? canonical : `${prefix}/64`;
}

/** Dotted-quad from the two 16-bit groups holding an embedded IPv4 address. */
function ipv4KeyFromGroups(highHex: string | undefined, lowHex: string | undefined): string | null {
  const high = Number.parseInt(highHex ?? "", 16);
  const low = Number.parseInt(lowHex ?? "", 16);
  if (!Number.isInteger(high) || !Number.isInteger(low)) return null;
  return `${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`;
}

export interface ClientAddressEnv {
  get(name: string): string | null;
}

/**
 * Deploy targets whose connection-terminating proxy sets a header the client
 * cannot overwrite. Adding a platform here is a statement that the platform
 * strips or overwrites that header on ingress — verify it before adding one.
 */
export type ClientPlatform = "vercel" | "cloudflare" | "nginx" | "node";

/**
 * The single-value header each platform sets from the connection it terminated.
 * `node` has none: a bare Node server sees only what the request carried, so
 * nothing beyond `x-forwarded-for` (and only its right-most entry) is honoured.
 */
const PLATFORM_HEADERS: Record<ClientPlatform, string | null> = {
  vercel: "x-vercel-forwarded-for",
  cloudflare: "cf-connecting-ip",
  nginx: "x-real-ip",
  node: null,
};

/**
 * Which platform is serving this request.
 *
 * `VERCEL` and `CF_PAGES` are set by the platform itself. nginx has no such
 * marker, so it must be declared via `CLIENT_IP_SOURCE=nginx` — an operator
 * statement rather than a guess.
 */
export function detectClientPlatform(): ClientPlatform {
  if (process.env.VERCEL) return "vercel";
  if (process.env.CF_PAGES) return "cloudflare";
  if (process.env.CLIENT_IP_SOURCE?.trim().toLowerCase() === "nginx") return "nginx";
  return "node";
}

/**
 * Normalise the transport wrappings a hop may add: quotes, brackets, a port.
 *
 * `[2001:db8::1]:443` is legal in `Forwarded`-style chains and is emitted by
 * real proxies. Stripping the brackets without also stripping the port leaves
 * `2001:db8::1]:443`, which fails to parse — and a parse failure in the trusted
 * position used to hand control to the client-written left-most entry (see
 * `resolveClientAddress`). Quoted values (`"203.0.113.5"`) fail the same way and
 * are seen in the wild, so they are unwrapped too.
 */
function stripPortAndBrackets(candidate: string): string {
  let value = candidate.trim();

  // Double quotes are permitted around an address in some proxy chains.
  if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1).trim();
  }

  // Bracketed IPv6, optionally followed by a port: "[2001:db8::1]:443".
  const bracketed = /^\[([^\]]+)\](?::(\d+))?$/.exec(value);
  if (bracketed) return bracketed[1] ?? "";

  // Bare IPv4 with a port: "203.0.113.5:443". A bare IPv6 has several colons
  // and cannot be split this way, which is why the bracketed form is required
  // for it above.
  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(value)) {
    value = value.slice(0, value.lastIndexOf(":"));
  }

  return value;
}

export function resolveClientAddress(
  env: ClientAddressEnv,
  options: { platform?: ClientPlatform } = {},
): string {
  const platform = options.platform ?? detectClientPlatform();

  const platformHeader = PLATFORM_HEADERS[platform];
  if (platformHeader) {
    const found = env.get(platformHeader);
    if (found) {
      const canonical = canonicalizeClientAddress(
        stripPortAndBrackets(found.split(",")[0] ?? ""),
      );
      if (canonical) return canonical;
    }
  }

  const forwarded = env.get("x-forwarded-for");
  if (forwarded) {
    /*
      Only the right-most entry is read, and only if it parses.

      It is the one our own hop appended, so it names the peer that connected to
      us. Every entry to its left is a value some downstream client supplied, and
      the left-most one is written by whoever is making the request — reading it
      hands an attacker a fresh rate-limit bucket per request.

      The previous code walked leftward until something parsed, which meant a
      trusted entry that failed to parse (`[2001:db8::1]:443`, a quoted address,
      `unknown`) silently promoted the client's own entry to trusted. A parse
      failure now yields `UNKNOWN_CLIENT`: shared buckets are a cost, but a
      client-controlled key is the bypass this module exists to prevent.
    */
    const parts = forwarded.split(",");
    return canonicalizeClientAddress(stripPortAndBrackets(parts[parts.length - 1] ?? "")) ?? UNKNOWN_CLIENT;
  }

  return UNKNOWN_CLIENT;
}
