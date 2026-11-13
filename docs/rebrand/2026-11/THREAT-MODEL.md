# THREAT-MODEL — ARKYON public website (proportionate to a marketing/tools site)

Scope: the public website + its one write endpoint. No auth, no user accounts, no payment, no storage of visitor data beyond browser localStorage.

## 1. Assets & trust boundaries

| Boundary | Components | Notes |
|---|---|---|
| Browser ⇢ CDN/edge | All pages, static assets | Served via Vercel; HSTS, XFO DENY, nosniff, COOP/CORP, Permissions-Policy locked (next.config headers). CSP currently **Report-Only**; `CSP_MODE=enforce` promotes it (owner deployment decision). |
| App server (SSG + 1 API route) | `next start`/Vercel functions | No filesystem writes, no DB, no secrets in client bundles (`NEXT_PUBLIC_*` are public by contract; `RESEND_API_KEY` is server-only env). |
| `POST /api/project-brief` | zod-validated intake | The only mutation-shaped surface; see §3. |
| Resend (email) | `brief-notification.ts` | Optional; active only when env configured; plain fetch; failure never blocks receipt. |
| Browser storage | localStorage/sessionStorage | Theme, consent, recent searches, intake draft (visitor's own machine; honeypot + consent never persisted into the draft). |

## 2. Data inventory (visitor perspective)

- **Collected:** only what a visitor types into the intake form (company, problem description, contact email, optional budget/timeline) — transmitted to the app server, validated, forwarded to the owner's email if configured. Nothing is persisted server-side (storage integration point marked but unused).
- **Analytics:** none wired; `track()` is consent-gated and discards events with no provider. No third-party scripts, fonts, or embeds exist (all assets self-hosted; CSP `default-src 'self'`).
- **Retention:** email inbox retention applies to notified briefs (owner-controlled). Browser state is visitor-controlled.
- **Logs:** server/runtime logs may hold request metadata; the API's dev-only log prints receipt id + delivery mode, never brief content.

## 3. Abuse cases & controls (verified against code)

| Abuse case | Control | Status |
|---|---|---|
| Spam/automated submissions | Fixed-window rate limit 5/min/IP (`rate-limit.ts`, bounded map, sweep at 4096); honeypot field `companyWebsite` returns a success-shaped receipt with **no notification and no log** | VERIFIED (unit tests + e2e) |
| IP spoofing to evade rate limit | `resolveClientAddress` trusts only proxy-attested headers (`x-vercel-forwarded-for` → `cf-connecting-ip` → `true-client-ip` → `x-real-ip` → right-most XFF); `unknown` fails closed | VERIFIED (12 unit tests) |
| Oversized payloads | Declared content-length + actual byte cap (64 KiB) → 413 | VERIFIED (unit tests) |
| Injection (content/header) | Zod schema bounds-before-sanitize, control-char stripping, 4000-char field caps; XML-escaping on RSS; React auto-escaping everywhere else | VERIFIED (tests) |
| Enumeration/probing | Rate limit applies to all responses; errors are generic (`role="alert"` fallback copy); no internal validation details leak | VERIFIED |
| XSS via stored content | No server persistence; content is build-time data files reviewed in-repo | VERIFIED by construction |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` | VERIFIED (headers) |
| Mixed content / downgrade | HSTS 2y includeSubDomains preload | VERIFIED (headers) |
| Secret leakage | `.env*` gitignored; `check:deps` clean; no `NEXT_PUBLIC_` around secrets (grep-verified); no secrets in client bundle | VERIFIED |
| Dependency compromise | `npm audit --omit=dev --audit-level=high` in CI + locally: **0 vulnerabilities** (2026-11-13); lockfile pinned; no postinstall scripts beyond allowlisted esbuild/unrs-resolver | VERIFIED |
| Malicious external content | CSP `default-src 'self'`; no third-party origins; no user-generated content surfaces | VERIFIED |
| Open redirects | No redirect functionality exists (proxy.ts only 308-normalizes trailing slashes on same-origin paths) | VERIFIED |

## 4. Residual risks / owner dependencies

1. **CSP is Report-Only** in production until the owner sets `CSP_MODE=enforce`. The policy exists and is tested in report mode only. Owner deployment decision (requires verifying no inline violation in Vercel's environment).
2. **Email provider account compromise** would expose brief contents sent via Resend — mitigated by Resend-side auth; owner manages that account.
3. **Rate limit is per-instance** (in-memory). Multi-instance scaling would need a shared store; at current traffic this is acceptable and documented.
4. No WAF/bot management beyond rate limit + honeypot — acceptable for a site with one low-volume write endpoint.
5. Legal/privacy policy wording: `DraftBanner` stays until `NEXT_PUBLIC_LEGAL_REVIEWED=true`; legal review is an owner action and is **not** claimed complete here.

## 5. What was not tested

- Vercel-edge behaviour (WAF/DDoS edge protections) — not reproducible locally; production platform controls are owner-visible only.
- Real email delivery (no Resend keys in test env by design; notification path unit-tested with mocked provider).
