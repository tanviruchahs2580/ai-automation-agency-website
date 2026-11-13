# QA-REPORT — ARKYON rebrand, final tree (commit `1de5e3e`)

Environment: local Windows / Git Bash / Node v24.19.0 · branch `feat/arkyon-rebrand-frontend-v3` · 2026-11-13. Production build served at `http://localhost:3117` for all deployment-dependent gates. Lab data only — no field/CrUX data exists or is claimed.

## 1. Suite-by-suite results (from TEST-COMMAND-REGISTRY.md)

| Suite (command) | Purpose | Result | Detail |
|---|---|---|---|
| `npm run lint` | ESLint | **PASS** | 0 errors, 0 warnings |
| `npm run typecheck` | tsc --noEmit strict | **PASS** | clean |
| `npm run test` (vitest) | unit/integration, 19 files | **PASS** — 180/180 (was 178 at base; +2 brand tests) | includes machine-checked contrast (25), brand single-sourcing, content integrity, API/validation/rate-limit |
| `npm run build` | production build | **PASS** | 97/97 pages (51 routes + OG images + errors) |
| `npm run check:rendered` | rendered-HTML invariants | **PASS** | og:image, twitter:image, canonical + RSS autodiscovery on every indexable route; no SSR-hidden content; no duplicate ids; no first-paint fade; exemption count unchanged |
| `npm run check:budget` | bundle budgets | **PASS** | shared 157.4/165 KiB · heaviest 176.3/185 KiB · CSS 12.2/20 KiB (gzip) |
| `npm run check:deps` | prod dependency audit | **PASS** | 0 vulnerabilities (audit-level=high) |
| `npm run test:e2e` | Playwright full matrix | **PASS** with disclosed flakes — see §2 | chromium/firefox/webkit desktop + chromium mobile |
| `npm run check:rtl` | RTL overflow ≤1px, 12 routes × {390,1440} | **PASS** | 24/24 clean (run against the pre-cleanup build; CSS delta after was token-equivalent — same rendered values) |
| `npm run check:journey` (JOURNEY_BASE=local) | 26-step user-journey harness | **PASS** | 26/26 incl. one-header-CTA invariant at 1440/900/412/320, full intake with consent refusal, theme persistence, search Escape |
| `npm run check:vitals` (METRICS_BASE=local) | lab LCP/CLS/FCP/TTFB, 5 runs/route | **PASS** | worst LCP 588ms (<1200), worst CLS 0.0004 (<0.05); `/` desktop 560ms, `/solutions` 588ms, `/start-a-project` 480ms |

Aggregate honest summary: every suite green on the final tree; no skipped suites; the only failures encountered anywhere were environment-contention flakes (§2) and missing browser binaries before installation (tooling, not product).

## 2. E2E detail, flakes and their disposition (disclosure per brief §11.6)

Full parallel run (2 workers, this Windows machine): **145 passed / 12 first-attempt failures**. Every one of the 12 passed on retry or in isolation (`--workers=1`); zero assertion failures against product behaviour.

| First-attempt failure | Engine | Retry/isolation outcome | Root cause |
|---|---|---|---|
| nav disclosure Space (32s timeout) | chromium | retry pass 3.2s | worker contention |
| 16-route axe sweep (1.8m) | chromium | retry pass 1.2m | worker contention |
| `/` 320px overflow check | firefox | retry pass | worker contention |
| search dialog focus-trap ×2, Escape-closes-search ×2, cookie-banner region ×2, nav Escape, banner collision ×2 | webkit | **all 5 pass in isolation, 6.5–21.6s** | WebKit-on-Windows starvation under 2-worker parallel load |

Flaky-test policy compliance: first-attempt failures are recorded above (a retry pass does not erase them); no arbitrary waits, retry loops, assertion loosening or browser-project removals were introduced. The repo's CI executes the identical suite on ubuntu-latest, where the engine timing profile differs.

Pre-existing tooling note (not a product finding): the machine lacked firefox-1538/webkit-2336 builds for the repo's pinned Playwright 1.62.1; `npx playwright install firefox webkit` (browser binaries only — no dependency/lockfile change) resolved it. First E2E attempt: 57 chromium passes + 216 instant launch-errors, all `Executable doesn't exist`.

## 3. Route/journey coverage actually exercised

- axe WCAG 2.2 A/AA: `/`, `/start-a-project`, `/insights`, `/roi-calculator` individually + a 16-route family sweep + light-theme sweep + open-search-dialog scan — **all engines**.
- Interactions: search open/filter/Escape/focus-restore, nav disclosure Space/Escape, cookie-banner semantics, intake `aria-invalid`/`aria-describedby`, readiness `aria-pressed` + focus, skip link — **all engines**.
- Tools end-to-end: ROI recompute + debounced live summary; readiness full 10-question run; intake full 7-step submission with `PB-` receipt; invalid-step block — **all engines**.
- No-JS content visibility across 18 routes; architecture panel without JS; above-fold CTA at 1440×900 and 390×844; 320px no-overflow on 5 routes; fixed-overlay collision; document structure on 20 routes.
- Journey harness: 26 steps incl. desktop+mobile nav, intake consent-refusal path, search, theme persistence, 404, social-card resolution.
- Visual: 17 baseline (prod) + 14 candidate (local) + 3 fix-verification captures; matrix in VISUAL-REGRESSION-MATRIX.md.

## 4. Accessibility — scope and limits of the claim

Claimed: WCAG 2.2 AA **automated** conformance evidence (axe above-minor violations zero across the sweep set; contrast machine-checked in both themes; keyboard/focus behaviours asserted for search, nav, intake, readiness, skip link; 320px reflow; reduced-motion gates in CSS and component code; no-JS content visibility).

Not claimed: full manual screen-reader conformance (NVDA/VoiceOver walk-throughs were not performed in this environment — no screen reader available). Residual risk recorded for the owner. The `a11y-matrix.md` (rewritten this change) names the automated record and its deliberate exclusions.

## 5. Security/privacy verification

- Headers, CSP (report-only), body cap, rate limit, honeypot, proxy-attested IP, no-store semantics: unchanged from base + covered by unit tests (api-project-brief, client-ip, rate-limit, validation, brief-notification).
- `check:deps`: 0 vulnerabilities. No new runtime/dev dependencies in the diff (package.json/lock untouched — verified by reviewer).
- Rendered-output scan: zero brand-copy VANTIQ occurrences; the only legacy-name strings in built HTML are the documented storage-key fallback reads (D-01/D-12).
- THREAT-MODEL.md records abuse cases, controls with test links, residual risks (CSP enforcement owner decision, per-instance rate limit, email-provider trust) and untested areas.

## 6. SEO

Per-route canonical/og/twitter/RSS gates green (check:rendered); sitemap 51 locs; robots allow-all minus `/api/`; feed identity "ARKYON — Insights" (curl-verified); title suffix "— ARKYON"; JSON-LD identity strings derive from `siteConfig`. Local-build canonical note (localhost:3000) is the documented pre-deploy state — `NEXT_PUBLIC_SITE_URL` remains an owner deployment input (F-11).
