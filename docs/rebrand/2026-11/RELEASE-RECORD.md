# RELEASE-RECORD — ARKYON production release (executed 2026-11-14)

## Release identity

| Item | Value |
|---|---|
| Production commit | `e43ed3d3201f4ffaa23478245ba601fda9cd421a` (merge of PR #25, head `5fae321`) |
| PR | [#25 — ARKYON rebrand + Keystone frontend renovation](https://github.com/tanviruchahs2580/ai-automation-agency-website/pull/25) |
| CI on PR | quality PASS (1m10s) · E2E PASS (4m44s) · Vercel preview PASS |
| Production deployment | `e43ed3d` · environment **Production** · created 2026-11-13T18:51:26Z (GitHub Deployments API) |
| Production URL | https://ai-automation-agency-website-lilac.vercel.app |
| Rollback target | previous production deployment of `27b566c` (VANTIQ) — Vercel instant rollback |
| Authorization | owner, 2026-11-14 (DECISIONS D-16) |

## Sync verification (codebase == git == GitHub == production)

`git rev-parse main` == `origin/main` == `e43ed3d` == deployed SHA (GitHub Deployments API, environment=Production). Working tree clean; feature branch `feat/arkyon-rebrand-frontend-v3` merged; local main fast-forwarded to origin.

## Live verification performed (all against production, 2026-11-14)

**User-style functional test — 16/16 PASS** (`tools/user-test-live.mjs`): title suffix, hero, wordmark, single header CTA, nav dropdown navigation, ⌘K search open/filter/Escape, theme toggle + persistence, ROI calculator computation from inputs, readiness assessment full 10-question run with score, intake wizard all 7 steps + submit reachable (no UI submit), back-navigation, cookie consent persistence, 404 recovery page, example-architecture honesty label, RSS identity, zero console/page errors.

**Intake pipeline (live, zero notification side effects):** honeypot-sink payload (valid fields + honeypot filled — the designed silent path) → `{"ok":true,"briefId":"PB-MWFC3MK1-2TIW"}` on production; invalid enum → 422 with field-level issues; rate limit → 429 after window (verified on preview: `200 200 200 429 429 429` within one minute window). **No real lead was sent to any inbox** (D-16 rule).

**Endpoint smoke (production):** sitemap 51 locs · robots allow-all (−`/api/`) · manifest icons 192/512 · favicon/apple-icon/icon-512 all 200 · og:image 200 (image/png) · feed `<title>ARKYON — Insights</title>` · HSTS 2y preload · XFO DENY · nosniff · CSP Report-Only · production correctly indexable (no `X-Robots-Tag: noindex` — that is preview-only, verified).

**Deployment flow evidence:** production title flipped `— VANTIQ` → `— ARKYON` within ~1 minute of merge (poll log in session transcript); Vercel preview for the PR branch served the same build with `X-Robots-Tag: noindex`.

## Residual / not performed

- CSP remains **Report-Only** on production (`CSP_MODE=enforce` is an owner follow-up; THREAT-MODEL residual risk 1).
- Legal pages keep the honest `DraftBanner` until owner legal review (`NEXT_PUBLIC_LEGAL_REVIEWED` unset) — intentional.
- Independent human review: waived by informed owner decision (D-16) — recorded as waiver, not PASS.
- A real (non-honeypot) lead submission was deliberately NOT sent; the notification path remains verified by unit/integration tests only.

---

# RELEASE-RECORD — audit-remediation release (executed 2026-11-16)

## Release identity

| Item | Value |
|---|---|
| Production commit | `de277de5f7de8dffd1095b6d4a2b1acc628ede05` (merge of PR #32, head `470ca66`) |
| PR | [#32 — Enterprise audit remediation: intake hardening, supply-chain gate, dead-code removal](https://github.com/tanviruchahs2580/ai-automation-agency-website/pull/32) |
| CI on PR | quality PASS (1m30s) · E2E PASS (3m55s). Both jobs pinned npm 11.17.0 (version-asserted) and ran a clean `npm ci` on Node 22 before any other step — this run is the clean-install evidence for `.npmrc`'s `strict-allow-scripts` policy |
| Production deployment | `de277de` · environment **Production** (GitHub Deployments API) |
| Production URL | https://ai-automation-agency-website-lilac.vercel.app |
| Rollback target | previous production deployment `f0d3b3b` (Vercel instant rollback) |
| Authorization | owner, 2026-11-16 — standing release authorization covering push → PR → CI → merge → deploy |

## Live verification performed (all against production, 2026-11-16)

**User-style functional test — 16/16 PASS** (`tools/user-test-live.mjs`): title suffix, hero, wordmark, single header CTA, nav dropdown, ⌘K search open/filter/Escape, theme toggle + persistence, ROI computation, readiness 10/10 with score, intake 7 steps + submit reachable (no UI submit), back-navigation, cookie persistence, 404 recovery, honesty label, RSS identity, zero console/page errors.

**Intake pipeline (zero notification side effects):** honeypot sink (valid fields + honeypot filled) → `{"ok":true,"briefId":"PB-MWIPJDNW-C29B"}`; invalid payload → 422; rate-limit probe → `422 422 422 429 429 429 429` within one minute window — the sink probe consumed the first slot of the same 5/min/IP window, so 3×422 + 4×429 is the expected shape, not a deviation. **No real lead was sent.**

**Headers (new set live):** `X-XSS-Protection: 0` · `Cross-Origin-Embedder-Policy: require-corp` · `X-DNS-Prefetch-Control: off` · CSP still Report-Only (owner decision pending) · production indexable (no `X-Robots-Tag`).

**Trailing slash:** `/approach/` → 308 to `/approach` — Next.js core, with `src/proxy.ts` deleted.

**Sync verification:** local `main` == `origin/main` == deployed SHA == `de277de`; working tree clean after the record commit below.

## Residual / not performed

- Owner items unchanged from the 2026-11-14 record: CSP enforce, legal review, custom domain + `NEXT_PUBLIC_SITE_URL`, trademark counsel (THREAT-MODEL §4, re-confirm by 2027-05-16).
- 7 moderate advisories in the dev-only lint chain recorded in `docs/audit/REMEDIATION-EVIDENCE-2026-11-16.md`; the remaining fix requires a semver-major toolchain bump (production audit: 0 vulnerabilities).
- A real (non-honeypot) lead submission was deliberately NOT sent.
