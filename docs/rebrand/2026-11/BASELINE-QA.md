# BASELINE-QA — recorded baseline measurements (Phase 0)

Environment: local Windows / Git Bash / Node v24.19.0 / npm 11.17.0 · HEAD `27b566cca1c2a7de3e5cb39a0485f6165390ac01` · 2026-11-13

| Check | Command | Result | Evidence |
|---|---|---|---|
| Lint + typecheck + unit + build + rendered + budget | `npm run verify` | **PASS, exit 0** — 178/178 tests (19 files), 97/97 pages generated, rendered invariants ✓, budgets ✓ | `baseline-verify.log` (root, untracked) |
| Dependency audit (prod deps) | `npm run check:deps` | NOT RUN at baseline — scheduled in Phase 6 | — |
| Playwright e2e (4 projects) | `npm run test:e2e` | NOT RUN at baseline — scheduled Phase 6 (heavy; browser install check pending) | — |
| RTL overflow | `npm run check:rtl` | NOT RUN at baseline — Phase 6 | — |
| User journey | `npm run check:journey` | NOT RUN at baseline — Phase 6 against local build (never prod) | — |
| Vitals (lab) | `npm run check:vitals` | NOT RUN at baseline — Phase 6 after build (needs `METRICS_BASE`) | — |
| Production smoke (read-only) | curl homepage + sitemap | title `— VANTIQ`, 51 sitemap locs, og:image present | curl outputs in EXECUTION-LEDGER E-01 |

Known baseline facts carried forward:
- CI runs on Node 22; local dev box is Node 24. Watch for engine-specific behaviour only if a failure appears.
- Playwright config: retries=1 (flaky policy: record first-attempt failures even if retry passes).
- The intake E2E posts to its own baseURL; `.env.local` has no Resend keys → receipt-only, no external side effects.
