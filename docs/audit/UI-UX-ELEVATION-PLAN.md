# UI/UX Elevation — Audit Findings & Plan (2026-11-16)

Branch: `feat/ui-ux-elevation` · Baseline: `main` @ d7910a8, `npm run verify` PASS
(98/98 pages, 180/180 unit, budgets: shared 158.4/165 KiB, heaviest 176.7/185 KiB, CSS 12.2/20 KiB).

## Owner brief

"Existing feature thik rekhe full frontend, UI/UX elevation koro — production-grade app
frontend er moto feel asbe, demo app er moto feel thaka jabena."

Constraints carried from the repo's own gates: feature contracts preserved (every route,
form, calculator, search, theme toggle, consent gate intact), WCAG AA machine-checked,
bundle budgets enforced, no new dependencies that threaten the JS budget.

## Why the site reads as a "demo" (audit findings)

Visual audit: `docs/qa/elevation-audit/*.png` (14 routes × desktop 1440 + mobile 390).

| # | Finding | Evidence |
|---|---------|----------|
| F1 | **Sparse homepage** — only 4 sections (hero, industry strip, 6 small cards, approach banner). No proof, no depth, no process, no insights, no capability breadth. A production agency homepage carries 7–9 sections. | home-d1440.png |
| F2 | **Uniform index-page pattern** — every index route is PageHero + one flat 3-col grid of identical cards + CTA. No rhythm variation, no featured items, no asymmetric layouts. | solutions/work/industries-d1440.png |
| F3 | **Flat cards** — simple 1px-bordered boxes, small icons, hover = translateY(-2px) only. No depth, no sheen, no hover choreography. | solutions-d1440.png |
| F4 | **Zero imagery on inner pages** — the whole site has 2 photographs, both on the homepage. Inner pages are pure text on flat surfaces. | all inner captures |
| F5 | **Monotonous section rhythm** — same SectionHeader + same background everywhere; no alternating bands, no editorial variation, no stat moments. | work-d1440.png |
| F6 | **Minimal motion** — subtle Reveal fades only; no scroll-linked moments, no parallax, no hover choreography beyond 2px lift. | — |
| F7 | **Plain PageHero** — eyebrow + title + lead on flat canvas; no depth layers, no atmospheric treatment. | solutions-d1440.png |

Non-findings (already production-grade, must not regress): type system (4 families,
fluid scale), contrast (machine-checked AA), SEO/OG/canonical, budgets, a11y (axe-clean
98 routes), forms/calculators (all functional), e2e coverage (151 tests).

## Elevation plan

Principle: **CSS-first, server-first, zero new dependencies.** New motion reuses the
already-bundled framer-motion LazyMotion primitives (`Reveal`/`RevealStagger` are client
and already paid for). All new sections are server components reading existing data files
and linking to existing routes — feature contracts untouched.

### Phase A — Design-system primitives (globals.css, no JS)

- **Card v3**: gradient hairline + top-lit sheen + hover choreography (icon lift, arrow
  slide, accent border glow) — extends `.card-surface`, axe-clean.
- **`.bento`** asymmetric grid utility (featured cell spans 2×2 on lg).
- **`.stat-band`** metric strip treatment (tabular numerals, hairline separators).
- **`.section-alt`** alternating surface band for rhythm.
- **PageHero depth**: grid-line field + accent halo + gradient scrim behind hero copy.

### Phase B — Homepage enrichment (server components, existing data)

Sequence preserved (hero → strip → services → approach banner stay in the owner-approved
order); new sections are **added after** existing ones, before the footer CTA:

1. **Proof band** — honest inventory stats (7 services · 6 solutions · 12 industries ·
   4 example architectures · N insight articles), each linking to its index route.
   Inventory counts are verifiable facts, not invented client claims.
2. **Solutions bento** — 6 solutions in an asymmetric grid (first cell featured),
   from `src/data/solutions.ts` → `/solutions/*`.
3. **Example architectures** — 3 case-study cards from `src/data/case-studies.ts`
   (labeled example architectures, as everywhere they appear) → `/work/*`.
4. **Process** — reuse the existing `ProcessTimeline` component (already shipped on
   /approach) → `/approach`.
5. **Insights preview** — latest 3 articles from `src/data/insights.ts` → `/insights/*`.
6. **Technology marquee** — capability names from `src/data/technology.ts` using the
   existing `.marquee` CSS → `/technology`.

### Phase C — Index pages

- PageHero v2 (depth layers + optional stat row) applied to all index routes.
- Featured first card (bento span) on `/solutions` and `/industries`.
- Alternating `.section-alt` bands where pages have 2+ sections.

### Phase D — Detail pages

- `DetailLayout` header polish: meta chips, hairline rules, editorial title scale.

### Phase E — Motion (tiny client components only)

- Hero scroll parallax (transform-only, `prefers-reduced-motion` gated, <1 KB client).
- RevealStagger on all new grids (existing primitive).

### Phase F — Verification

`npm run verify` + full e2e (desktop+mobile) + fresh visual captures + budget deltas
reported in the final report. Any budget regression >2 KiB shared must be justified or
trimmed.

## Risk register

- Budget headroom is ~6.6 KiB shared / ~7.8 KiB CSS → all additions CSS + server JSX;
  client additions limited to one tiny parallax component reusing LazyMotion.
- Feature contracts: no route, form, or copy removal; homepage additions only append.
- D-R6 (homepage follows owner reference): the owner's 2026-11-16 brief supersedes the
  reference's sparseness; the approved sequence is preserved and enriched, not replaced.
