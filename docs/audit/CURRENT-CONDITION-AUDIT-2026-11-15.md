# ARKYON — Current-Condition QA & Enterprise Audit

**Date:** 2026-11-15
**Scope:** `main` @ `f0d3b3b` (production), whole repository — application code, tests, gates, CI, docs, deployment posture.
**Standard applied:** enterprise software-agency workflow (evidence-first, severity-ranked, ratchet-only gates, explicit residual risk).
**Relation to prior audits:** supersedes `docs/audit/AUDIT-2026-10-25.md` as the *current* condition. That report's P0s are confirmed closed (see §7); this report does not re-list them except where a regression or an adjacent gap remains.

> **Status addendum (2026-11-16).** Every finding in this report (P1-1, P1-2,
> P2-1 … P2-6, and the INFO items marked for action) has been remediated on
> branch `feat/enterprise-audit-remediation` and re-verified on the final tree:
> `npm run verify` exit 0 (214/214 unit tests, 98/98 pages, budgets 158.4/176.7/12.2 KiB),
> RTL 24/24, journey 26/26, vitals worst LCP 408 ms / CLS 0.0001 (both inside
> budget), production `npm audit` 0 vulnerabilities, import graph 0 unreachable
> modules. Per-finding closure and the exact commands:
> `docs/audit/REMEDIATION-EVIDENCE-2026-11-16.md`. The findings below are
> preserved unchanged as the point-in-time snapshot of `main` @ `f0d3b3b` they
> were written against; test counts and scores in §1 describe that snapshot, not
> the remediated tree.

---

## 0. Verdict

**PASS-WITH-FINDINGS. No P0. No release blocker.**

The site is in unusually strong condition for its size: 98 routes, fully static, zero dependency vulnerabilities, 180 unit tests + 151 e2e tests green, rendered-output and bundle-budget gates enforced in CI, and a documented honesty/claims register. The findings below are real but are **hardening and correctness-adjacent**, not "the site is broken".

Three findings are worth the owner's attention because they are *claims that do not match behaviour*, which is the one class of defect this project treats as serious:

| # | Finding | Severity |
|---|---|---|
| C-1 | The rate limiter's bucket key is derivable from a client-supplied header on any non-Vercel deploy | **P1** |
| C-2 | IPv6 clients get unlimited fresh rate-limit windows by re-spelling the same address | **P1** |
| C-3 | The intake endpoint's 422 echoes Zod's internal message for the honeypot field | **P2** (verified) |
| C-4 | `allowScripts` in `package.json` is documented/assumed as an allowlist but is not one | **P2** (verified from npm source) |

Scores, where a number is more useful than prose:

| Dimension | Score | Basis |
|---|---|---|
| Security posture | 8.5 / 10 | Headers, CSP scaffolding, intake hardening, zero vulns; deductions for C-1/C-2 and CSP-without-collector |
| Accessibility | 9 / 10 | axe WCAG 2.2 A/AA + structural rules across engines and both themes; manual keyboard traps covered |
| Performance | 9 / 10 | 158.4 KiB shared baseline, 176.7 KiB heaviest route, 12.3 KiB CSS — all under budget, all gated |
| SEO / AEO | 9 / 10 | Canonicals/OG/RSS on every indexable route asserted by gate; JSON-LD per family; `llms.txt`; sitemap; honesty policy on ratings |
| Code quality | 7.5 / 10 | Exceptional comment density and intent; **543 lines of unreachable homepage components** and two divergent `countWord` implementations |
| Test rigour | 9 / 10 | 331 assertions, cross-engine, no-JS content checks; **zero assertions on security headers** |
| Ops / CI / governance | 9 / 10 | Two-job CI, dependabot, CODEOWNERS, SECURITY.md, threat model; residual-risk register lacks owners/expiry |
| Content honesty | 9.5 / 10 | Claims register + fact/proof register; no invented clients, ratings, or certifications |

---

## 1. Evidence base — what was actually executed

All commands run locally on this machine, node v24.19.0, npm 11.17.0, Windows.

| Command | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | **19 files, 180 tests, all passed** (4.39 s) |
| `npm run build` | exit 0 — compiled 12.4 s, TS 9.0 s, 98 pages |
| `npm run check:rendered` | exit 0 — 53 documents; og/twitter/canonical/RSS on every indexable route; no hidden content; no duplicate ids; no first-paint fade |
| `npm run check:budget` | exit 0 — baseline **158.4 KiB**, heaviest **176.7 KiB** (`/technology`), CSS **12.3 KiB** |
| `npm audit --omit=dev --audit-level=high` | **0 vulnerabilities** |
| `node docs/qa/tools/import-graph.mjs` | 146 src modules, 118 reachable from `src/app` — **7 unreachable** |
| Production rate-limit probe (7 requests, distinct spoofed IP headers) | **5 × 422 then 2 × 429** — spoofed headers are *not* honoured on Vercel |
| Schema probe via `vitest` | `companyWebsite` appears in `fieldErrors` for `number`/`null`/`array` inputs |
| IPv6 aliasing probe via `vitest` | 4 spellings of one address → **4 distinct bucket keys** |
| npm source read (`@npmcli/arborist/lib/arborist/rebuild.js:229-237`) | `true` and `null` both fall through; only `false` denies |

**Not executed (and therefore not claimed):** a full cross-engine Playwright run against the *new* build (done in §6 after remediation), and any change to production.

---

## 2. Findings

Severity key: **P0** = do not ship · **P1** = fix before the next meaningful release · **P2** = fix when touching the area · **INFO** = hardening / taste.

### P1-1 · Rate-limit bucket key trusts headers that only one platform sets

`src/lib/client-ip.ts:73-97`

```ts
const SINGLE_VALUE_HEADERS = ["x-vercel-forwarded-for","cf-connecting-ip","true-client-ip","x-real-ip"];
// ...
const found = env.get(header);
if (found) { const normalized = normalize(found.split(",")[0] ?? ""); if (normalized) return normalized; }
```

**What is true:** the comment claims each of these is "set (not appended to) by its platform … ignoring client input". That is true for `x-vercel-forwarded-for` on Vercel and `cf-connecting-ip` behind Cloudflare. It is **not** true of `x-real-ip` or `true-client-ip` in general — on a plain Node/nginx deploy, or behind a CDN that does not strip them, they are pass-through request headers a client can write.

**What I verified:** on the current Vercel production deployment, 7 requests each carrying a *different* `x-real-ip`/`true-client-ip`/`cf-connecting-ip` triple were limited **5 then 429**, i.e. the spoof was ignored. `x-vercel-forwarded-for` wins the loop and is platform-set. **So there is no live bypass today.**

**Why it is still P1:** the code is correct only by accident of ordering plus one platform's behaviour. The function is the sole abuse control on the only state-changing endpoint, and it silently degrades to "trust the client" on any other host. This project already carries a documented Redis-upgrade path for the limiter (`rate-limit.ts:4-5`), so it is expected to run somewhere other than Vercel eventually.

**Fix:** make the trust decision explicit rather than positional — gate the header list on a deployment-mode variable (`VERCEL`, `CF_PAGES`, …) with `x-forwarded-for` right-most as the documented fallback, and say in the comment which header is trusted *because of which platform*. Keep the current order as the Vercel path so behaviour does not change.

### P1-2 · IPv6 rate-limit keys are not canonicalised (verified)

`src/lib/client-ip.ts:87` — `return isIpLiteral(value) ? value : null;`

`isIpLiteral` validates structure but returns the **original string**. Verified by running the shipped module: `2001:db8::1`, `2001:DB8::1`, `2001:0db8:0:0:0:0:0:1`, `2001:db8:0:0:0:0:0:1` produce four distinct keys. Case, zero-padding and elision all alias.

**Impact:** no header spoofing is required. Any client on IPv6 rotates spellings for unlimited fresh 5-request windows; a residential /64 offers 2^64 addresses regardless. The control that exists on IPv4 effectively does not exist on IPv6.

**Fix:** canonicalise before returning — lowercase, strip leading zeros per group, and compress the longest zero run. Add the round-trip cases as tests (they are currently absent, which is why this survived).

### P2-1 · The 422 response still names the honeypot field (verified)

`src/app/api/project-brief/route.ts:89-92` returns `z.flattenError(parsed.error).fieldErrors` wholesale; `src/lib/validation.ts:62` declares `companyWebsite: z.string().optional()`.

Verified by executing the real schema: `companyWebsite: 0` → `{"companyWebsite":["Invalid input: expected string, received number"]}`. A JSON crawler sending a number or `null` learns exactly which field is the trap.

This is a partial regression of the fix documented at `validation.ts:55-60`, which explains at length why the field must not be constrained — but only the *length* constraint was removed. The type constraint silently reintroduced the signal.

**Fix:** remove `companyWebsite` from the returned `fieldErrors` before responding. The client never renders that field's error, so no user-visible behaviour changes. Add a test asserting the key is absent for every non-string JSON type.

### P2-2 · `allowScripts` is not an allowlist (verified from npm's source)

`package.json:46-49`, no `.npmrc`.

Read from `@npmcli/arborist/lib/arborist/rebuild.js:229-237`:

> `true` and `null` (unreviewed) both fall through to the existing detection logic — unreviewed nodes still run their scripts in Phase 1 and are surfaced via the post-reify advisory warning.

So this block pre-approves two packages but denies nothing: any *new* dependency with a postinstall runs on `npm ci` in CI. Verified additionally:
- `esbuild` is **absent from the lockfile** (only a peer spec at `package-lock.json:7417`) — the `esbuild@0.28.2` entry is stale.
- `strict-allow-scripts` is `false` on this machine and set nowhere.
- `node_modules/fsevents` and `node_modules/playwright/node_modules/fsevents` carry `hasInstallScript: true` and are unreviewed.

**Fix:** add `.npmrc` with `strict-allow-scripts=true`, remove the stale `esbuild` entry, and add `fsevents` + `unrs-resolver` entries with a one-line reason each. This converts the block into an actual gate. **Caution:** this is a CI-behaviour change; it must be verified with a clean `npm ci` before merge.

### P2-3 · Dead homepage components — 543 lines, 7 files

`node docs/qa/tools/import-graph.mjs` (added with this audit; read-only):

```
Unreachable from src/app (candidate dead code):
  components/home/CaseStudiesPreview.tsx     44 lines
  components/home/Hero.tsx                   74
  components/home/IndustriesGrid.tsx         45
  components/home/ServiceRows.tsx            94
  components/home/TrustGovernance.tsx        96
  components/home/TrustStrip.tsx             54
  components/home/WhatWeSolve.tsx           136
```

These are the pre-redesign homepage sections, orphaned when the homepage became `ArchitecturalSections` (D-R6 recorded that *content* moved to dedicated routes; it did not record that the *components* were left behind). Verified: no page, component, test, or script imports any of them. `ServiceRows.tsx` is also the sole consumer of `countWord(..., {capitalize:true})` from `src/lib/utils.ts`.

**Impact:** not user-visible, but it is 543 lines a future contributor will read, extend, or "restore", and it is the kind of drift that makes an audit's "no dead code" claim false. `src/lib/utils.ts` also carries a divergent duplicate of `countWord`/`capitalize` (`src/lib/text.ts` has the tested one; `utils.ts:58` has a second implementation with a different option shape) — with `ServiceRows` deleted, that duplicate becomes unreachable.

**Fix:** delete the seven components; keep `ArchitecturalSections` (reachable via `page.tsx`). Confirm `src/lib/utils.ts` exports used elsewhere (`cn`, `formatCurrency`, `formatNumber`, `clamp`, `slugify`) and remove only the duplicated `countWord`. Re-run the graph to prove 0 unreachable.

### P2-4 · Zero assertions on security headers in the test suite

`grep -rn "content-security|x-frame|strict-transport" e2e/` → no matches.

`next.config.ts:142-144` installs headers via one regex source, `"/(.*)"`. A typo or an upstream Next change would ship silently: nothing in 331 tests reads a response header. The CSP comment (`next.config.ts:106-112`) also instructs the reader to "watch the console for reports" for a policy that has **no `report-to`/`report-uri` directive**, so no reports are produced anywhere — the documented promotion path is not executable.

**Fix (minimal, high value):** one e2e test asserting the full header set on `/` and on a `POST` to `/api/project-brief`, plus one asserting HSTS/CSP presence on a static asset path. Add `report-to` only if a collector endpoint is chosen — otherwise amend the comment to say the policy is currently unobserved rather than implying telemetry exists.

### P2-5 · 413 comment overstates the guarantee

`src/app/api/project-brief/route.ts:23-24` says an oversized body is "rejected without being buffered or scanned"; the byte check at `:77` runs after `request.text()` at `:72` has fully buffered the body. The declared-length pre-check at `:62-65` catches honest clients only.

**Impact:** bounded by the rate limit (5/min/IP) and Vercel's own function body cap, so this is a memory-efficiency and honesty issue, not an availability hole. **Fix:** either correct the comment, or read via `request.body` with a counting transform and cancel past 64 KiB. The comment fix is the low-risk option; record the streaming version as future work.

### P2-6 · Intake drafts persist PII in `localStorage` with no expiry

`src/components/forms/ProjectIntake.tsx:156-159` writes the whole form (`contactName`, `contactEmail`, `problem`, …) to `arkyon:intake-draft:v1` on every keystroke-batch; `savedAt` is stored at `:158` but only used for display at `:141`. Nothing ever expires it.

`src/app/privacy/page.tsx:48` says submissions are "retained only as long as…". On a shared or borrowed machine the next visitor can read the previous visitor's brief, and the draft never ages out.

**Fix:** on restore, discard a draft older than a fixed TTL (7 days), and treat the present-but-expired case as "no draft". One condition, one test. No UI change.

### INFO — hardening opportunities (no defect)

1. Missing `X-XSS-Protection: 0` (explicitly disables the legacy auditor), `Cross-Origin-Embedder-Policy`, and `upgrade-insecure-requests` in the CSP.
   *Resolved:* the first two were added. `upgrade-insecure-requests` was added and then removed on
   2026-11-15 — Chromium logs "The Content Security Policy directive 'upgrade-insecure-requests'
   is ignored when delivered in a report-only policy", which the console-cleanliness test caught. It
   is not decoration worth shipping; it belongs in the enforcing policy, with `CSP_MODE=enforce`.
2. `X-DNS-Prefetch-Control: on` enables prefetching of links the visitor has not chosen — a small privacy leak for a site that already ships a consent banner.
3. `POST /api/project-brief` accepts any `Origin`. No ACAO is set and there are no cookies, so impact is limited to cross-site spam charged to the victim's IP; a same-origin check is three lines.
4. `brief-notification.ts:70` `fetch` has no `AbortSignal.timeout` — a hung Resend response holds the serverless invocation open until the platform timeout.
5. `rate-limit.ts:42-46` sweeps on every check once the map exceeds 4096 entries, and only removes expired buckets — while all buckets are fresh nothing is reclaimed. With canonicalised IPv6 keys the key space shrinks dramatically, but a hard cap with eviction is the correct shape.
6. ~~`proxy.ts:26-27` skips canonicalisation for any path containing `.`, which leaves dotted
   URLs as duplicate indexable routes.~~ **Retracted on measurement (2026-11-15).** No route
   contains a dot, so `/about.v2`, `/privacy.html` and `/services/x.` return 404 — they were
   never duplicate indexable URLs. While checking it, a larger defect surfaced: Next.js core
   canonicalizes trailing slashes by itself (verified with `src/proxy.ts` deleted), so the file's
   redirect branch never ran in production, and when invoked directly it built a `Location`
   equal to the slashed input — a self-redirect loop. The file was removed rather than fixed.
7. `docs/rebrand/2026-11/THREAT-MODEL.md` §4 residuals (incl. CSP Report-Only) carry no owner and no expiry date, so "accepted" cannot be re-confirmed at the next audit.
8. Honeypot autofill risk: the field is DOM-present with the label "Company website"; a password manager or aggressive autofill can fill it and silently discard a genuine lead (client shows `HB-000000`). Low probability, high cost per event — worth one line in the acceptance record.

### Confirmed still closed (not re-reported)

Dependency advisories (P0-1) · social cards on all routes (P0-2) · CTA contrast (P0-3) · invisible SSR form (P0-4) · placeholder brand (P0-5) · honeypot returns an indistinguishable receipt with no notify/log · `no-store` on every response path · XML escaping at every feed interpolation · CORS default-deny · LICENSE/SECURITY.md/CODEOWNERS/branch protection/Dependabot.

---

## 3. What is genuinely strong (stated precisely)

- **Rendered-output gate.** `check-rendered-html.mjs` asserts og/twitter/canonical/RSS on every prerendered document, no server-rendered hidden content, no duplicate ids, no first-paint fade, and pins the exemption count so it cannot quietly grow. Almost no marketing site has this.
- **Budget gate.** Real per-route gzip measurement read from Next's own diagnostics, with an explicit "do not silently raise the budget" instruction in the failure text.
- **Test intent.** Tests are written as defect post-mortems ("the endpoint used to read the left-most entry…"), so a future reader learns the failure mode, not just the assertion.
- **No-JS content coverage** across 18 route families (`quality.spec.ts:37-52`), asserting geometric layout, not just DOM presence.
- **Honesty infrastructure.** `CONTENT-CLAIMS-REGISTER`, `FACT-AND-PROOF-REGISTER`, and the deliberate absence of `aggregateRating` in `softwareJsonLd` — the site declines to fabricate social proof.
- **Intake design.** Honeypot silent sink, receipt never blocked by delivery failure, `no-store` on every path, client and server min-lengths kept in sync, draft restore that loses to live typing.

---

## 4. Enterprise blockers — honest list

Nothing blocks operating this site. The items that block *enterprise procurement conversations* are business/legal, not code:

| Blocker | Owner action | Status |
|---|---|---|
| Legal review of `/privacy`, `/terms`, `/cookie-policy` | Counsel sign-off, then set `NEXT_PUBLIC_LEGAL_REVIEWED` to remove `DraftBanner` | **open** — draft banner ships |
| Trademark clearance for "ARKYON" | Counsel | **open** |
| Named client references / case-study evidence | Owner must authorise disclosure | **open** — cases are described anonymously and labelled as illustrative |
| Custom domain + `NEXT_PUBLIC_SITE_URL` | Owner (purchase in process) | **open** |
| Independent human review of releases | Currently waived by owner (D-16); recorded as waiver, never PASS | **waived, dated** |
| CSP enforcement | Needs either an accepted `unsafe-inline` risk or a nonce migration + dynamic rendering | **open — Report-Only** |

---

## 5. Betterment scope (ranked by value per unit of risk)

1. **Canonicalise and platform-gate the client address** (P1-1/P1-2) — closes the only real abuse-control weakness.
2. **Assert security headers in e2e** (P2-4) — converts a silent-success surface into a gated one for ~30 lines.
3. **Delete 543 lines of dead components** (P2-3) — reduces the surface a future change can accidentally resurrect.
4. **Honeypot error-field scrubbing** (P2-1) — restores the trap's intended silence.
5. **Draft TTL** (P2-6) — makes the privacy page true without a rewrite.
6. **`.npmrc strict-allow-scripts` + lockfile hygiene** (P2-2) — turns a comment into a control.
7. Then INFO items in the order listed, each independently shippable.

Deliberately **not** recommended: a CSP nonce migration in this cycle. It requires forcing dynamic rendering across 98 static routes, which would trade a real, measured static-render advantage for a policy improvement — the wrong trade for a marketing site with no auth, no user content, and no third-party scripts. Record it as a decision with the reasoning, rather than leaving it as an untracked open item.

---

## 6. Reproducing this audit

```bash
npm run lint && npm run typecheck && npm test
npm run build && npm run check:rendered && npm run check:budget
npm audit --omit=dev --audit-level=high
node docs/qa/tools/import-graph.mjs        # dead-code sweep (read-only)

# Production rate-limit probe — honeypot-safe (invalid payload, no lead submitted)
H=https://ai-automation-agency-website-lilac.vercel.app
for i in 1 2 3 4 5 6 7; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "$H/api/project-brief" \
    -H "content-type: application/json" -H "x-real-ip: 198.51.100.$i" --data '{"bad":1}'
done   # expect 422 422 422 422 422 429 429
```

**Do not** run `check:journey` against production — it submits a real brief and emails the owner. The probe above sends an invalid payload and is side-effect free.
