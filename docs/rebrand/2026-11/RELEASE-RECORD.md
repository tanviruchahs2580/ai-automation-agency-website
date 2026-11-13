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
