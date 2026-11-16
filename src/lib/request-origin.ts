/**
 * Cross-site request detection for state-changing routes.
 *
 * The intake endpoint holds no session and sets no cookie, so it cannot be
 * abused to *read* anything on a visitor's behalf — the classic CSRF target is
 * absent. What remains is quota theft: the rate limit is keyed on the caller's
 * address, so any third-party page could spend a visitor's allowance by posting
 * to this endpoint from their browser, locking them out of a form they were
 * legitimately filling in.
 *
 * Detection uses `Sec-Fetch-Site` rather than an `Origin`/`Host` comparison on
 * purpose. The header is set by the browser, is forbidden to script, and carries
 * no hostname — so there is nothing to derive from proxy headers. An
 * `Origin`-versus-`Host` check has to guess its own public origin behind a
 * reverse proxy, and guessing wrong rejects real visitors, which is a worse
 * failure than the one it prevents.
 *
 * Absent header means no browser made the request: server-to-server calls,
 * `curl`, and the project's own journey harness are all allowed. Every current
 * browser sends it on `POST`.
 */

/**
 * Values a browser may send for a same-site request.
 *
 * `none` is a user-initiated navigation rather than a cross-site embed, so it
 * is not a threat here. Anything else — `cross-site`, an unknown token, or a
 * comma-joined pair produced by a repeated header — is rejected.
 */
const ALLOWED = new Set(["same-origin", "same-site", "none"]);

/**
 * True when the request demonstrably originates on another site.
 *
 * This is an allowlist, not a comparison against `cross-site`. `Headers.get`
 * concatenates repeated fields with ", ", so a request carrying
 * `sec-fetch-site: same-origin` and `sec-fetch-site: cross-site` yields
 * `"same-origin, cross-site"` — which an equality test would happily accept.
 * Unrecognised values are rejected for the same reason: on a route that spends a
 * visitor's rate-limit allowance, failing closed is cheap and failing open is
 * not. The absent-header case above is the only allowance.
 */
export function isCrossSiteRequest(headers: Headers): boolean {
  const raw = headers.get("sec-fetch-site");
  if (raw === null) return false;
  return !ALLOWED.has(raw.trim().toLowerCase());
}
