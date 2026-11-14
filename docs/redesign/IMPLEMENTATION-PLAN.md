# PHASE-0-BASELINE + IMPLEMENTATION-PLAN — Architectural redesign

## Phase 0 (2026-11-14)

- Base: `054fb90aedb7b587769a7f70b4c3bfd2eed77b76` (main, clean tree, == origin/main)
- Branch: `feat/arkyon-architectural-redesign-v2`
- Stack verified live: Next.js 16 App Router · React 19 · TS strict · Tailwind v4 (@theme tokens) · framer-motion 12 (LazyMotion) · zod 4 · Vitest 5 · Playwright 1.62 · npm/package-lock
- Command registry (verified in package.json): lint · typecheck · test · build · check:rendered · check:budget · check:deps · test:e2e · check:rtl · check:journey · check:vitals · verify
- Baseline state: main == production deploy `054fb90` (ARKYON, Keystone theme); `npm run verify` EXIT 0 recorded pre-change (re-run on branch: EXIT 0, 180/180)
- Live deployment inspected read-only (production URL + GitHub Deployments API); no production changes made

## Route & feature inventory (verified, not assumed)

- 51 indexable routes (17 static + 34 dynamic: solutions 6, services 7, industries 12, insights 6, work 3) + utilities (sitemap/robots/manifest/feed/OG conventions) + `POST /api/project-brief` — from build output (97 prerendered docs) + sitemap (51 locs)
- Features: kit FC-01…FC-21 map 1:1 onto the repo's `docs/rebrand/2026-11/FEATURE-CONTRACT-INVENTORY.md` (no drift; union preserved)

## Implementation plan (executed)

1. Tokens: globals.css `@theme` dark block → Architectural Night values (spec §5); light theme re-derived cool-paper design; ambient fields → blue atmospheric; pill buttons.
2. Homepage: new `src/components/home/ArchitecturalSections.tsx` + module (adapted starter; global tokens; repo Button/SectionHeader; next/image with `public/images/arkyon-hero-architecture.webp`); `src/app/page.tsx` rewritten to the reference sequence; ScrollDepthTracker retained.
3. Touchpoints: layout themeColor, manifest colours, global-error inline palette, OgCard palette → navy/orange.
4. Inner routes: inherit the new system via tokens (all routes are tokenised); verified representatives across families.
5. Docs: this folder + DESIGN-SYSTEM.md v5.

## Feature-traceability summary (full table = repo FEATURE-CONTRACT-INVENTORY + kit matrix)

| Contract | Redesign impact | Regression evidence |
|---|---|---|
| FC-01 search, FC-02 consent, FC-03 ROI, FC-04 readiness, FC-05 intake+API, FC-06 nav, FC-07 drawer, FC-08 theme, FC-09 SEO endpoints, FC-10 accordion, FC-11 architecture explorer (/technology), FC-12 finder, FC-13 explorer, FC-14 before/after, FC-15 progress, FC-16 BackToTop, FC-17 errors, FC-18 draft banner, FC-19 motion, FC-20 hydration signal, FC-21 analytics | **No behavioural change** (presentation-only redesign; git diff touches no route/validation/rate-limit/lib logic files) | e2e suites 57/57 (smoke/tools/a11y/quality), user-style test 16/16, verify EXIT 0 (180/180), rendered gate, budgets |

Homepage teaser removals (D-R6) remove no capability: every removed teaser's destination remains live and navigable.
