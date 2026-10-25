/**
 * Client address resolution for rate limiting.
 *
 * `x-forwarded-for` is **client-writable**. A caller can send their own value,
 * and most proxies *append* the address they actually observed. Reading the
 * left-most entry — the common implementation — therefore hands an attacker a
 * trivial bypass: rotate the header, get a fresh rate-limit bucket per request.
 *
 * Resolution order, most trustworthy first:
 *
 *   1. Platform-specific single-value headers. Vercel (`x-vercel-forwarded-for`),
 *      Cloudflare (`cf-connecting-ip`) and nginx (`x-real-ip`) each *set* these
 *      from the connection they terminated, ignoring client input.
 *   2. The **right-most** `x-forwarded-for` entry — the address appended by the
 *      nearest trusted proxy as it forwarded the request.
 *   3. `"unknown"`, which fails *closed*: every unidentifiable caller shares one
 *      bucket, so an unattributable flood is throttled rather than exempted.
 *
 * The returned value is only ever used as an in-memory bucket key, and is
 * validated as an IP literal first so arbitrary strings cannot be used to grow
 * the limiter's map.
 */

export const UNKNOWN_CLIENT = "unknown";

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_CHARS = /^[0-9a-f:]+$/i;
const IPV6_GROUP = /^[0-9a-f]{1,4}$/i;

/** Accepts dotted-quad IPv4, any well-formed IPv6, and IPv4-mapped IPv6. */
export function isIpLiteral(value: string): boolean {
  if (value.length > 45) return false;

  const v4 = IPV4.exec(value);
  if (v4) {
    return v4.slice(1).every((octet) => {
      // Reject leading zeros ("01") so "1.2.3.04" cannot alias "1.2.3.4".
      if (octet.length > 1 && octet.startsWith("0")) return false;
      return Number(octet) <= 255;
    });
  }

  if (!value.includes(":")) return false;
  if (!IPV6_CHARS.test(value)) return false;
  /*
    Structure, not just characters. An earlier version accepted "2001:db8:::1":
    it counted `::` occurrences (one) and colon-separated segments (five, within
    the limit of eight) without noticing the empty group in between. Group
    count, group length and the single-elision rule are all checked here.
  */
  if (value.includes(":::")) return false;

  const groups = value.split(":");
  if (groups.length > 8) return false;
  const nonEmpty = groups.filter((group) => group.length > 0);

  if (value.includes("::")) {
    // "::" stands for one or more all-zero groups, so at most seven remain.
    if (nonEmpty.length > 7) return false;
  } else if (nonEmpty.length !== 8) {
    return false;
  }

  return nonEmpty.every(
    (group) => IPV6_GROUP.test(group) || IPV4.test(group),
  );
}

export interface ClientAddressEnv {
  get(name: string): string | null;
}

/** Header names checked in order; each is set (not appended to) by its platform. */
const SINGLE_VALUE_HEADERS = [
  "x-vercel-forwarded-for",
  "cf-connecting-ip",
  "true-client-ip",
  "x-real-ip",
] as const;

function normalize(candidate: string): string | null {
  // Strip the port from "203.0.113.5:443" and the brackets from "[::1]".
  let value = candidate.trim().replace(/^\[|\]$/g, "");
  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(value)) {
    value = value.slice(0, value.lastIndexOf(":"));
  }
  return isIpLiteral(value) ? value : null;
}

export function resolveClientAddress(env: ClientAddressEnv): string {
  for (const header of SINGLE_VALUE_HEADERS) {
    const found = env.get(header);
    if (found) {
      const normalized = normalize(found.split(",")[0] ?? "");
      if (normalized) return normalized;
    }
  }

  const forwarded = env.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    // Right-most first: the last hop is the one our own proxy appended.
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const normalized = normalize(parts[i] ?? "");
      if (normalized) return normalized;
    }
  }

  return UNKNOWN_CLIENT;
}
