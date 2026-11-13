# BASELINE-AUDIT — ARKYON Rebrand (Phase 0/1 record)

Date: 2026-11-13 · Base SHA: `27b566cca1c2a7de3e5cb39a0485f6165390ac01` (local `main` == `origin/main`)
Branch: `feat/arkyon-rebrand-frontend-v3` · Environment: local (Windows, Git Bash, Node v24.19.0, npm 11.17.0)

## 1. Repository identity (VERIFIED)

- Remote: `https://github.com/tanviruchahs2580/ai-automation-agency-website.git` — matches prompt header.
- Local HEAD == origin/main == `27b566c`; no drift. Two unmerged dependabot branches exist upstream (framer-motion 14.6.0, types/node, minor-and-patch) — noted, out of scope (no major upgrades without approval).
- Owner working-tree state: `src/components/ui/Button.tsx` modified — diff is **line-ending only** (LF→CRLF warning; `git diff` body empty). Preserved untouched.
- Next.js 16.4.3 (`node_modules/next/dist/docs/` present and consulted), React 19.1, Tailwind 4.1, zod 4.6, framer-motion ^12.23, Vitest 5, Playwright 1.62. Package manager: npm (package-lock.json). Engines: node >=22 (running v24.19.0).

## 2. Release-drift audit (VERIFIED)

- Production deployment `https://ai-automation-agency-website-lilac.vercel.app/` serves title `AI Engineering & Automation for the Enterprise — VANTIQ`, body strings `VANTIQ`/`VANTIQ SYSTEMS` (counted via curl 2026-11-13).
- Production sitemap returns **51 `<loc>` entries** — equals local inventory (17 static + 34 dynamic). og:image present. Drift between repo HEAD and prod cannot be cryptographically confirmed (no deployment metadata header exposed) → deployment-commit parity: **NOT DETERMINED** (do not claim parity).

## 3. Brand audit (VERIFIED by grep, 2026-11-13)

Public brand today: **`VANTIQ SYSTEMS`** (placeholder default, overridable via `NEXT_PUBLIC_BRAND_NAME`; `deriveBrandForms` in `src/data/site.ts`). `ARKYON` occurs nowhere in the repo.

Active-source occurrences of `vantiq` (case-insensitive) — all require migration:

| Surface | Files |
|---|---|
| Brand source of truth | `src/data/site.ts` (brand + deriveBrandForms) |
| Rendered/behavioural | `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/app/work/[slug]/page.tsx`, `src/components/ui/SearchModal.tsx` (localStorage `vantiq-recent-searches`), `src/components/ui/ThemeToggle.tsx` (`vantiq-theme`), `src/components/ui/GridLines.tsx` (DOM id `vantiq-grid`), `src/lib/consent.ts` (`vantiq-cookie-consent`), `src/lib/analytics.ts` (`window.__vantiqAnalytics`), `src/lib/seo.ts`, `src/components/forms/ProjectIntake.tsx` (`vantiq:intake-draft:v1`), `src/components/forms/ExitIntentSave.tsx` (`vantiq:exit-intent-seen`) |
| Regression tests asserting brand rules | `src/lib/__tests__/brand.test.ts` (11), `seo.test.ts`, `redesign.test.ts`, `brief-notification.test.ts` |
| Docs (active brand docs) | `README.md`, `BRAND-GUIDE.md`, `DESIGN-SYSTEM.md` |
| Test/tooling references | `e2e/a11y.spec.ts` (`vantiq-theme`, `vantiq-grid` comment), `e2e/smoke.spec.ts` (comment), `scripts/user-journey.mjs` (`vantiq-theme`), `scripts/check-rendered-html.mjs` (comment) |

Assets: `src/app/icon.svg|icon.png|apple-icon.png|favicon.ico`, `public/icons/icon-192.png|icon-512.png`, OG images generated in code (`next/og`). All carry the old identity (regenerated in Phase 5).

**Decision D-01:** user-state storage keys get new `arkyon:`/`arkyon-` names **with legacy read-fallback** so returning visitors keep theme/consent/drafts; old keys are written off after read. See DECISIONS.md.

## 4. Historical reports

`RENOVATION-REPORT.md`, `docs/audit`, `docs/qa/*` (historical evidence). Headline historical fixes now verified as still in place by baseline gates: SSR-visible content, social cards/canonical/RSS on every route, security headers + body cap + honeypot, a11y gates, bundle budgets, displayed-CTA invariant. Any historical defect not re-observed today is classified `FIXED AND VERIFIED` via current gates rather than assumed.

## 5. Baseline scorecard (evidence-linked)

Scored with the Phase 13 weights against current prod. Detailed reasoning in `docs/rebrand/2026-11/BASELINE-AUDIT.md` §5:

| Dimension | Weight | Baseline | Basis |
|---|---:|---:|---|
| Brand strategy & identity consistency | 10 | 3 | Coherent but placeholder brand (`VANTIQ SYSTEMS`), env-dependent; name not owner-confirmed |
| Visual design craft & distinctiveness | 25 | 16 | Console/"Mission Control" theme; functional but template-adjacent dark theme; screenshots pending Phase 1 visual pass |
| UX/IA/conversion | 15 | 11 | Strong journeys, 4 tools; 6 of 12 industries not in nav dropdown; single CTA good |
| Content integrity & route coverage | 10 | 8 | 51/51 routes rendered, claims disciplined (example-architecture labels) |
| Frontend architecture & code quality | 15 | 12 | Strict TS, tested seams, budgets; framer-motion major behind (dependabot open) |
| Accessibility | 10 | 8 | axe suites + contrast tests green; manual pass pending |
| Performance/responsive | 7 | 5 | Budgets green; vitals harness exists; no fresh lab numbers recorded this run |
| SEO | 4 | 4 | Canonical/OG/RSS/sitemap verified by check:rendered |
| Security/privacy/release governance | 4 | 3 | Strong controls; CSP report-only; release docs pending |
| **Total** | **100** | **70** | |

## 6. Scope matrix (baseline → target), MUST/SHOULD/COULD

- **MUST:** ARKYON single-source brand everywhere active (copy, metadata, RSS, JSON-LD, manifest, icons, OG, consent/search/theme/draft keys with migration); every one of the 51 routes + 7 utility endpoints preserved; all feature contracts preserved (search, consent, ROI, readiness, intake+API, nav, theme, errors); all gates stay green; tests updated not weakened.
- **SHOULD:** art-directed visual refresh across all page families with new tokens/type/logo; nav dropdown coverage for remaining 6 industries; refreshed brand docs.
- **COULD:** motion polish within reduced-motion constraints; OG card art direction.
