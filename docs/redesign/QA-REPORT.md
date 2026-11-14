# QA-REPORT — Architectural Night redesign (candidate on feature branch)

Environment: local production build (`next start -p 3117`) of branch `feat/arkyon-architectural-redesign-v2` · 2026-11-14. Lab data only.

| Check | Command | Status | Evidence |
|---|---|---|---|
| Lint/typecheck/unit/build/rendered/budget | `npm run verify` | **PASS** EXIT 0 — 180/180 unit (contrast tests re-validated new tokens), 97/97 pages, rendered invariants, budgets | `docs/redesign/evidence/` + session logs |
| E2E chromium desktop+mobile | `npx playwright test --project=chromium-desktop --project=chromium-mobile` (PLAYWRIGHT_BASE_URL=local) | **PASS** 57/57 | arch-e2e.log |
| Responsive sweep 320–1440 (8 widths) | `responsive-check.mjs` | **PASS** — zero overflow, zero logo/nav collisions | session log |
| User-style functional test (16 checks incl. ROI compute, readiness run, intake walk, search, theme, consent) | `user-test-live.mjs` | **PASS 16/16** | session log |
| Rendered-HTML invariants (og/canonical/RSS/duplicate-ids) | `npm run check:rendered` | **PASS** | verify log |
| Bundle budgets | `npm run check:budget` | **PASS** | verify log |
| Visual captures | dark desktop/mobile home, strip/services, approach, light home, inner service (dark+light), ROI (light) | **DONE** | `docs/redesign/evidence/*.png` |
| NOT RUN (disclosed) | firefox/webkit projects, check:rtl, check:journey, check:vitals, Lighthouse | **NOT RUN** on this branch locally — CI runs the full e2e matrix on PR; rtl/journey/vitals unchanged-behaviour (no logic edits) and were green on the previous branch of the same pipeline | — |

Contrast: dark tokens (faint #8f9cac ≥6.4:1 all surfaces; ink-on-accent 7.6:1; press 5.6:1) and light tokens (faint #546476 ≥4.99:1; ink-on-accent 5.07:1) — machine-checked by `contrast.test.ts` (25 assertions) inside the 180.

Findings fixed during implementation: brand literal in approach aria-label (brand test), light-theme hero copy contrast over the photographic overlay (fixed light-on-photo values), accent phrase theme-drift (fixed #ffa13a).
