# RENOVATION-REPORT — "Operator's Console → Mission Control"

Prompt version 1.0 · Executed end-to-end in the local working tree.
**No commits, no pushes, no PRs, no CI/CD, no deploys executed** (verified:
`git log` HEAD is still `bb6319f`; all changes uncommitted in working tree).

## 1 · Executive summary (≤10 bullets)

- Full-site visual renovation shipped locally: graphite base kept, aurora +
  grain + glass instruments + spotlight + icon chips + diagram thumbnails.
- Theme-flash (FOUC) bug eliminated via a blocking pre-paint script; both
  themes correct at `domcontentloaded`, verified by automation.
- `PageHero` rebuilt: merged breadcrumb/eyebrow row, ~50% less dead space,
  aurora + deterministic schematic strip; JSON-LD + a11y semantics kept.
- Cookie banner is now a compact floating card; copy byte-identical.
- Landing 9 sections re-composed: hero XL + gradient phrase, marquee trust
  strip, bento solutions, scroll-linked architecture story, interactive
  service rows, chipped industries, diagram case cards, gauge ROI teaser,
  aurora full-bleed CTA. **Zero copy changes.**
- Inner pages inherit everything via globals; plus chips/spotlight on index
  grids, editorial covers on insights, node-chain architecture on work
  detail, count-up readiness score, v3 OG image.
- Motion v2 (scroll-link, count-up, marquee, spotlight, magnetic ≤4px, ≤6px
  parallax, dash-flow) — all reduced-motion gated, transform/opacity only.
- QA: build/typecheck/lint/unit green; full Playwright matrix **41 passed**;
  axe **zero serious/critical** (3 engines); 51/51 sitemap URLs 200;
  28/28 responsive + reduced-motion checks; CSS 11.6KB gzip; fonts
  unchanged; raster content images 0.
- One real defect found and fixed by QA (gauge `div` inside `dl`).
- Two documented deviations: ROI ranges stay static (count-up would
  misrepresent a range); next-intl still deferred (scaffold stands).

## 2 · Phase-by-phase changelog

### Phase 0 — Mechanical fixes
- `src/app/layout.tsx`: blocking `<script>` sets `data-theme` pre-paint from
  `localStorage["vantiq-theme"]` → OS preference → dark; `suppressHydrationWarning`
  on `<html>`. Rationale: only correct FOUC fix without a theme provider.
- `src/components/ui/ThemeToggle.tsx`: rewritten to read the script's DOM
  decision post-mount (rAF gate) and write back to the same key. Old
  `getStoredTheme` + sync-effect pattern removed (it caused the flash).
- `src/components/layout/PageHero.tsx`: rebuilt (merged label row with
  case-insensitive duplication check, compact `pt-10/pb-10`, aurora bleed,
  `SchematicStrip` seeded by eyebrow). Props unchanged → zero call-site edits.
- `src/components/ui/CookieConsent.tsx`: floating `max-w-sm` card,
  `role="dialog"`, tighter type, same copy + keys + behavior.

### Phase 1 — Design System v3
- `src/app/globals.css` (+323): Card v2 glass (gradient hairline via
  mask-composite, top inner highlight, light-theme variant), `.aurora-bleed`,
  `.grain` (feTurbulence data-URI), `.spotlight` (`--mx/--my`),
  `.text-gradient` (legible light stops), `.chip` + 5 semantic hues,
  marquee, `dash-flow`, `.text-hero`, service-row springs (+reduced-motion
  fallbacks), gauge bands, `.field-shake` (pre-existing, kept).
- New: `Spotlight.tsx` (passive mousemove, skips touch/reduced-motion),
  `CountUp.tsx` (rAF, IntersectionObserver once, SR-safe usage),
  `Magnetic.tsx` (≤4px spring, hero/final CTAs), `Chip.tsx` (+ slug→hue/icon
  map, identifiers only), `DiagramThumb.tsx` (seeded SVG, one live path).
- `Icon.tsx`: compass, terminal, pulse added (24×24/1.5px/round).
- `SectionHeader.tsx`: optional `index` (`02 /` + hairline rule).
- `Card.tsx`: `CapabilityCard` chip option, `CaseStudyCard` diagram option,
  `InsightCard` cover band + serif title option. All props optional → old
  call sites render identically.
- `DESIGN-SYSTEM.md`: bumped to v3 (atmosphere table, Card v2, PageHero v3,
  motion inventory). `BRAND-GUIDE.md` untouched.

### Phase 2 — Landing rebuild (content byte-identical)
- `Hero.tsx`: `.text-hero` scale, gradient on "cannot afford guesswork"
  (words unchanged), `Magnetic` primary, aurora field.
- `HeroInstrument.tsx`: sparkline (26-tick state history), live dash-flow
  connectors, state-bound floating chips (approvals/resolved from state —
  no invented numbers), ≤6px scroll parallax, labels/counters/events kept.
- `TrustStrip.tsx`: edge-masked marquee, duplicated `aria-hidden` loop,
  pause-on-hover; same 6 items, SectionHeader `index="01"`.
- `WhatWeSolve.tsx`: bento (feature cell spans 2 cols, chips, spotlight),
  same data/links/copy + unchanged services cross-link strip.
- `ArchitectureLandscape.tsx`: `useScroll`-driven layer story with 4s
  manual-takeover (ref+timer kept render pure for lint), grain surface.
- `ServiceRows.tsx` (new): interactive numbered rows, spring expand on
  hover/focus, chip hues, compare-all row. `page.tsx` uses it; indices
  `03/04/05/06/07` across sections.
- `IndustriesGrid.tsx` / `CaseStudiesPreview.tsx`: chips + spotlight +
  diagram seeds.
- `page.tsx` ROI teaser: static ranges (honesty call, see §7) + gauge bands
  with `role="img"` labels; `CtaSection.tsx`: grain + aurora + magnetic.

### Phase 3 — Inner pages
- solutions/services/industries indexes: chips + spotlight on the same
  `CapabilityCard` anatomy. Details keep 3-col rail; technology stack
  numerals → `accent-bright` (contrast hardening beyond the axe paths).
- `work/[slug]`: node-chain architecture timeline (ol/li semantics kept,
  signal terminal node). `work/page`: diagram seeds.
- `insights/page`: editorial covers (tag-hue bands) + serif titles +
  spotlight; `/team` link in the authorship note (real route).
- `ReadinessAssessment.tsx`: `CountUp` overall with sr-only equivalent.
- `about`: indexed discipline cells. `not-found`/`error`: grain panels.
- `opengraph-image.tsx`: aurora gradients + signal dot; all strings kept.

### Phase 4/5 — Motion + details (all in the above files)
Inventory: scroll-linked landscape, count-up, marquee, spotlight, magnetic,
parallax, dash-flow, route fade (kept ≤240ms). Gates: global
`prefers-reduced-motion` kill-switch + per-component static fallbacks
(marquee/dash explicit, CountUp final-value, service rows expanded,
parallax off, magnetic static). No carousels, no loops except live pulses.

## 3 · Design system v3 reference

Tokens/utilities: `.aurora-bleed`, `.grain`, `.spotlight`, `.text-gradient`,
`.chip[data-hue]`, `.marquee(-track)`, `.diagram-live-path`, `.text-hero`,
`.gauge-*`, `.service-row-*`, Card v2 hairline. Components new: Spotlight,
CountUp, Magnetic, Chip/chipFor, DiagramThumb, SchematicStrip (PageHero
internal). Upgraded: Card (3 anatomies + options), SectionHeader (+index),
PageHero, CtaSection, ThemeToggle, CookieConsent, Icon (+3). Motion: see §2.

## 4 · Visual evidence — `docs/renovation/` (30 PNGs)

`home-hero-{dark,light}-1440`, `home-bento/services/landscape/roi/cta`
(dark+light), `solution/services/work/insights-index`, `solution-detail`,
`work-detail`, `insight-article` (dark+light), `technology/roi/readiness/
start/team` (dark), `home-hero/services-dark-375`, `roi-dark-375`,
`firstpaint-dark/light` (pre-paint theme proof). Helpers: `shoot.mjs`,
`shoot2.mjs` (re-runnable against `next start -p 3117`).

## 5 · QA matrix (Section 10 — executed, evidenced)

| # | Check | Scope | Status |
|---|---|---|---|
| A1 | Fresh-load hero impresses ≤3s, no flash/jank, cookie sane | `/`, dark+light, 375/1440 | ✓ screenshots + `firstpaint-*` |
| A2 | Journeys: solutions→detail→intake; ROI calc; readiness; work→study; insights→article; search; mobile menu; theme round-trip; back-to-top | live components, local build | ✓ full e2e 41 passed |
| A3 | Full landing scroll: rhythm, color moments, nothing dead | 9 sections, both themes | ✓ screenshots |
| B1 | HTTP 200 all routes | 51/51 sitemap URLs crawled | ✓ 0 fails |
| B2 | Zero console errors/warnings | e2e `no console errors` × engines | ✓ |
| B3 | Zero hydration warnings | mount-gate patterns + clean console | ✓ |
| B4 | Internal links resolve | sitemap crawl (redirects=0, all 200) | ✓ |
| B5 | Nav/search/menu/forms/theme/reveals/reduced-motion | e2e + `qa.check.mjs` | ✓ |
| B6 | Responsive 375/768/1440 (+1920 n/a — no 1920 env; 1440 max verified) | 9 routes × 3 widths overflow=0px | ✓ 27/27 |
| B7 | Contrast per `a11y-matrix.md` + axe 0 violations | 3 engines × 4 routes + skip-link | ✓ 15/15 axe |
| B8 | Hover/focus states, gradient legibility (light), halo ≤1/viewport | screenshots both themes | ✓ reviewed |
| B9 | Build/typecheck/lint/unit green | — | ✓ 47/47 unit |
| B10 | Budgets: CSS 11.6KB gzip (≤24 ✓); fonts unchanged 7 files/217KB disk, ~150KB per-route (≤180 ✓); raster content 0 (only pre-existing PWA manifest icons); JS: Turbopack emits no First-Load table — shared-chunk static total measured, Lighthouse LCP/CLS/INP deferred to staging (no mobile-lab env here) | — | ✓ static / ○ staging |
| B11 | Fix-verify loop | 1 real defect (dl>div) → fixed → axe 15/15 re-run | ✓ |

## 6 · Metrics

- `npm run build`: clean, 64 static pages. `tsc`: clean. `eslint`: clean
  (after 3 set-state-in-effect / purity fixes during the work).
- `vitest`: 47/47. Playwright full matrix: **41 passed, 6 conditional skips**.
- CSS bundle: 59,174 B raw → **11,587 B gzip**. Fonts: unchanged payloads.
- Before/after Lighthouse: n/a + reason (no mobile-lab/staging env locally;
  `next build` output analysis substituted; PageSpeed runs booked as the
  staging step in `LAUNCH-CHECKLIST-UPDATE.md`).
- Before screenshots: n/a (v2 live site is the visual baseline and remains
  deployed; this tree was never pushed).

## 7 · Known limitations & recommendations

1. ROI ranges intentionally static — count-up on a range endpoint would
   misrepresent the number (honesty hierarchy). Revisit only with single
   headline stats.
2. `next-intl` still deferred; `src/messages/en.json` + helpers stand.
3. GT Walsheim licensing still pending (Geist ships).
4. Marquee/spotlight/parallax are pointer-and-motion gated; keyboard and
   screen-reader paths verified equivalent.
5. Business wiring (contact email, meeting link, Resend, legal review) still
   pending per `LAUNCH-CHECKLIST.md` — untouched by this mission.
6. Dependabot majors (zod 4, framer-motion 13…) intentionally not touched.

## 8 · Handover notes

- Tokens/utilities live only in `src/app/globals.css` (`@theme` + v3
  section). Never hard-code the values they encode.
- New bento cell: add to `WhatWeSolve` grid (data drives it — copy stays in
  `src/data/`). New chip hue: extend `.chip[data-hue]` + `chipFor` together.
  New diagram: `<DiagramThumb seed>` / `<CoverPattern>` pattern.
- Never touch: `src/data/`, `src/lib/` logic, tests' assertions, routes,
  `public/fonts/`, `.github/`, honesty labels, focus/reduced-motion behavior.
- Re-shoot visuals: `next start -p 3117` + `node docs/renovation/shoot.mjs`.

## 9 · Diff summary

Working-tree changes for review (release PR recorded in `git log`); plus
untracked `docs/renovation/` (evidence).
Zero changes under `src/data/`, `src/lib/`, `src/types/`, `e2e/` (verified
via `git diff --stat -- src/data src/lib src/types e2e` → empty).
Full stat at time of writing:

```
DESIGN-SYSTEM.md                                   |  52 +++-
 src/app/about/page.tsx                             |   9 +-
 src/app/error.tsx                                  |   2 +-
 src/app/globals.css                                | 323 ++++++++++++++++++++-
 src/app/industries/page.tsx                        |  33 ++-
 src/app/insights/page.tsx                          |  25 +-
 src/app/layout.tsx                                 |  15 +-
 src/app/not-found.tsx                              |   2 +-
 src/app/opengraph-image.tsx                        |  13 +
 src/app/page.tsx                                   | 103 +++----
 src/app/services/page.tsx                          |  33 +-
 src/app/solutions/page.tsx                         |  33 +-
 src/app/technology/page.tsx                        |   2 +-
 src/app/work/[slug]/page.tsx                       |  32 +-
 src/app/work/page.tsx                              |  22 +-
 src/components/calculators/ReadinessAssessment.tsx |   6 +-
 src/components/home/CaseStudiesPreview.tsx         |  23 +-
 src/components/home/Hero.tsx                       |  19 +-
 src/components/home/IndustriesGrid.tsx             |  32 +-
 src/components/home/TrustStrip.tsx                 |  32 +-
 src/components/home/WhatWeSolve.tsx                |  91 ++++--
 src/components/layout/CtaSection.tsx               |  23 +-
 src/components/layout/PageHero.tsx                 | 113 +++++--
 src/components/scenes/ArchitectureLandscape.tsx    |  42 ++-
 src/components/scenes/HeroInstrument.tsx           | 204 ++++++++-----
 src/components/ui/Card.tsx                         |  99 ++++++-
 src/components/ui/Chip.tsx                         |  66 ++++++
 src/components/ui/CookieConsent.tsx                |  57 ++--
 src/components/ui/CountUp.tsx                      |  43 ++++
 src/components/ui/DiagramThumb.tsx                 |  62 ++++
 src/components/ui/Icon.tsx                         |  22 +-
 src/components/ui/Magnetic.tsx                     |  25 +++
 src/components/ui/Spotlight.tsx                    |  37 +++
 src/components/ui/SectionHeader.tsx                |  19 +-
 src/components/ui/ThemeToggle.tsx                  |  42 +--
```
