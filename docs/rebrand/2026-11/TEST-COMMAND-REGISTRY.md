# TEST-COMMAND-REGISTRY — actual repository commands (do not invent others)

| Command | Scope | Environment / inputs | Gates |
|---|---|---|---|
| `npm run lint` | ESLint (eslint.config.mjs) | local | zero errors |
| `npm run typecheck` | `tsc --noEmit` strict | local | zero errors |
| `npm run test` | Vitest, 19 files / 178 tests in `src/lib/__tests__/` | node env, no network | all pass |
| `npm run build` | `next build` (97 static pages incl. 34 dynamic + OG images) | needs `NEXT_PUBLIC_*` defaults ok | build success |
| `npm run check:rendered` | Invariants over `.next/server/app` HTML: og/twitter/canonical/RSS per route; no SSR-hidden content; no duplicate ids; no first-paint fade; no skeleton/deferred `<div hidden>`; exemption count for `_global-error`/`_not-found` must not change | after build | exit 0 |
| `npm run check:budget` | First-load gzip budgets from `.next/diagnostics/route-bundle-stats.json`: shared ≤165 KiB, heaviest route ≤185 KiB, CSS ≤20 KiB | after build | exit 0 |
| `npm run check:deps` | `npm audit --omit=dev --audit-level=high` | network | no high+ advisories |
| `npm run test:e2e` | Playwright: projects chromium-desktop, firefox-desktop, webkit-desktop (full), chromium-mobile (smoke only); retries 1; workers 2; baseURL `PLAYWRIGHT_BASE_URL` or builds+starts `localhost:3117`; specs: smoke(5), tools(4), a11y (axe WCAG2.2 A/AA + interactions + light-theme), quality (no-JS content, 320px overflow, above-fold) | production build; `colorScheme: dark`; awaits `[data-hydrated="true"]` | all pass, no browser project removed |
| `npm run check:rtl` | 12 routes × {390,1440} rtl overflow ≤1px | chromium; `RTL_BASE` to target deploy | exit 0 |
| `npm run check:journey` | 11-step desktop journey + mobile journey; asserts ONE header CTA at 1440/900/412/320; full intake incl. consent-refusal; requires `JOURNEY_BASE` | against a deployment (never prod for submissions — intake posts go to that base; only run against local/preview) | exit 0 |
| `npm run check:vitals` | LCP/CLS/FCP/TTFB lab, `METRICS_RUNS=5`, routes `/`,`/solutions`,`/start-a-project`; gates worst LCP<1200ms, CLS<0.05; requires `METRICS_BASE` | local/preview; lab data only | exit 0 |
| `npm run verify` | lint+typecheck+test+build+check:rendered+check:budget | local | exit 0 |

**Side-effect policy:** E2E intake submissions post to the suite's own baseURL (local `next start`) — never to production. Notification is inert unless `RESEND_API_KEY`+`BRIEF_NOTIFICATION_EMAIL` are set; `.env.local` on this machine contains only `VERCEL_OIDC_TOKEN` (name recorded, value never read) so local submissions are receipt-only. Never run `check:journey` against production (would send real brief-shaped traffic and rate-limit-burn prod IP).

**CI (`.github/workflows/ci.yml`):** job `quality` = check:deps→lint→test→typecheck→build→check:rendered→check:budget; job `e2e` = playwright full matrix after build+check:rendered. Node 22 on CI (repo engines ≥22; local runs v24 — noted).

**Baseline run (2026-11-13, local, HEAD `27b566c`):** `npm run verify` → EXIT 0; 178/178 unit tests; 97/97 pages; rendered+budget gates ✓. Log: `baseline-verify.log` (repo root, untracked). E2E/rtl/journey/vitals: NOT RUN at baseline (heavy; run in Phase 6 against build + preview).
