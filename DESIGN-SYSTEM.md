# ARKYON — Design System ("Architectural Night")

Version 5.0 · Status: active · Owner: frontend team.
Single source of truth for tokens, components, motion, and usage rules.
Companion: `BRAND-GUIDE.md` (voice, positioning, copy rules).

> v5 ("Architectural Night", 2026-11) supersedes the Keystone warm-ink palette
> per the owner-approved target reference (`docs/redesign/`): deep
> navy/charcoal base (#06101b family), one orange accent (#f58a1f family),
> cool muted text, blue atmospheric fields, pill CTAs, and a photographic
> architectural hero + Proven Approach banner. Structure, motion system,
> components, budgets, feature contracts and the approved logo carry over
> unchanged. Every change is a token or utility; no one-off magic numbers.

> Design language in three sentences: **"Architectural Night" presents ARKYON
> as a composed, premium engineering firm — deep navy surfaces, warm white
> type, one controlled orange signal over cinematic architecture.** Type
> carries the identity; color is reserved for state, never decoration. Every
> page earns one screen-shot-able signature moment and nothing more.

## 1. Principles (ranked — use to resolve conflicts)

1. Clarity beats cleverness (parseable in < 2s or it dies).
2. Restraint: one signature moment per page; whitespace > decoration.
3. Physical motion: springs and soft easings, never linear tweens.
4. Type is the brand (70% of identity).
5. Dark-first, light-rigor (light is fully designed, not inverted).
6. Numbers don't lie: `tabular-nums`, methodology one click away.
7. Accessibility wins every tie (WCAG 2.2 AA minimum).
8. International by default (locale-ready, RTL-safe).
9. Honesty in pixels ("example architecture" / "estimate" labels stay).
10. Performance is a feature (budgets in §7).

## 2. Color tokens (`src/app/globals.css` → `@theme`)

Semantic set (preserved): `canvas, surface, surface2, line,
line-strong, ink, muted, faint, accent, accent-strong, ok, warn,
critical, info`.

Architectural Night values (dark theme; light theme re-maps every token —
cool paper `#f2f5f9`, navy ink `#0d1b2a`, deep orange `#c2410c` — it is fully
designed, not inverted):

| Token | Value (dark) | Rule |
|---|---|---|
| `--color-canvas` | `#06101b` | Deep navy-black; blue is atmosphere, not an accent. |
| `--color-accent` | `#f58a1f` | **Orange — the one brand accent.** CTA fills, key phrase, icon emphasis. |
| `--color-accent-press` | `#d96f0d` | Pressed/hover fill; darkens (never lightens) to protect the ink label ratio. |
| `--color-accent-bright` | `#ffb966` | Small orange text on dark surfaces (AA ≥4.5:1). |
| `--color-ink` | `#f5f7fa` | Warm white primary text. |
| `--color-faint` | `#8f9cac` | Tertiary text; ≥4.5:1 on every surface token (enforced by `contrast.test.ts`). |
| `--color-signal` | `#00e5a8` | **Live / verified / running states ONLY.** Never decoration. |
| `--color-brass` | `#b7a36a` | "Considered" states: pull-quotes, engineering notes, reviewed badges. |
| `--color-accent-glow` | `rgba(245,138,31,.16)` | Halo, **max 1 per viewport**. |
| `--color-grid-line` | `rgba(167,190,214,.05)` | Background grid (`<GridLines />`). |

`.ink-on-accent` — the label colour for text on an accent fill (near-black
ink `#17120c` in dark theme, warm white `#fffaf4` in light). A fixed
`text-white` cannot straddle both themes against orange; every accent-filled
control labels itself with this class or takes `.btn-primary`.

Card borders use `--color-line` / `--color-line-strong`, not a dedicated
grid-line token. Contrast for every token pair is machine-checked by
`src/lib/__tests__/contrast.test.ts` — the stylesheet is parsed, resolved and
computed against WCAG 2.2 ratios; the numbers are never duplicated into prose.

### v4 atmosphere tokens & utilities (`globals.css`)

| Utility | What | Rule |
|---|---|---|
| `.aurora-bleed` | Copper + brass radial mesh, masked vignette | Ambient only, ≤8% perceptual; light theme dims further |
| `.grain` / `::after` | 2–3% `feTurbulence` data-URI noise | Kills flat-digital feel; never over text-heavy prose |
| `.spotlight` + `--mx/--my` | Cursor-following radial glow (`<Spotlight />` sets vars) | Interactive cards only; touch + reduced-motion skip |
| `.text-key` | **Solid** `accent-strong` orange phrase | The one key phrase per headline. No text gradients — a two-stop gradient is decoration, and axe cannot evaluate one |
| `.chip` + `data-hue` | 44px icon chip | **Single-hue orange on cards** (2026-11 review: a five-hue rotation was undecodable to visitors). The hue field remains for genuinely semantic state use |
| `.marquee` / `.marquee-track` | 36s edge-masked loop, pause on hover | Reduced-motion static (explicit gate + global gate) |
| `.diagram-live-path` | Signal dash-flow on one SVG path | Decorative paths only; explicit reduced-motion gate |
| `.text-hero` | `clamp(2.5rem, 4.2vw + 1rem, 4.25rem)` display | Landing hero H1 only |
| `.gauge-track` / `.gauge-band` | Range-band bars for illustrative metrics | Bands show ranges, never single animated numbers; band gradient stays within the orange ramp |
| `.field-shake` | 220ms inline validation shake | Errors only, with `critical` color pairing |

## 3. Typography

| Role | Font (self-hosted woff2, `font-display: swap`) | Weights | Usage |
|---|---|---|---|
| Display | Geist¹ | 500, 700 | Hero H1, section H2, big numerals |
| Body | Inter Tight | 400, 500 | Paragraphs, UI copy |
| Mono | JetBrains Mono (latin subset) | 400, 500 | Eyebrows, labels, metrics, code |
| Editorial | Source Serif 4 | 400, 400-italic | Insights articles + pull-quotes only |

¹ GT Walsheim is the licensed target; Geist ships until licensing clears
(same grotesque skeleton, same metrics intent). Total font payload ≤ 180 KB.

Fluid scale:

```css
--text-display: clamp(3rem, 6vw + 1rem, 6.5rem);
--text-h1:      clamp(2.25rem, 3.5vw + .5rem, 4rem);
--text-h2:      clamp(1.75rem, 2vw + .5rem, 2.75rem);
--text-h3:      clamp(1.25rem, 1vw + .5rem, 1.5rem);
--text-body:    1.0625rem;
--text-small:   .875rem;
--text-mono:    .8125rem;
```

Tracking: display `-0.025em`, H1/H2 `-0.015em`, body `0`, mono labels
`+0.16em` uppercase. Body `max-width: 42rem` (`--max-prose`); article body
uses the editorial serif.

## 4. Layout primitives

- `.container-x`: `max-width: 78rem`, responsive `--gutter` (1.5rem → 3rem).
  Implementation: the base value lives in `@theme`; the tablet/desktop bump is
  an **unlayered `@media { :root { --gutter } }`**, not `@media { @theme {} }` —
  Tailwind v4 hoists `@theme` blocks out of their media wrapper and silently
  drops the condition, which pinned the gutter to 1.5rem everywhere.

- `.section-y`: 4.5rem → 7rem vertical rhythm.
- `<GridLines />` is the only grid treatment: faint SVG grid at viewport edges
  only — intentional, not graph paper. The legacy `.panel-grid` class it
  replaced has been removed from `globals.css`; it had no remaining call sites.
- `--max-prose: 42rem` for long-form.

## 5. Components (`src/components/ui/`)

**Button** — three variants only: `primary` (solid orange fill, theme-aware
ink label via the shared pairing; solid by design — a gradient label
background is invisible to axe, and the previous gradient demonstrably shipped
a 2.89:1 state before the contrast tests caught it), `quiet` (1px `faint`
border; hover fills `surface2`), `link` (text + mono arrow translating 2px on
hover). 44px min target, 180ms `ease-out-soft`, 2px accent focus ring at 2px
offset. Forbidden: ghost, gradient, glow-pulse, icon+text primary.
(`secondary`/`ghost` props remain as deprecated aliases of `quiet`/`link` so
existing call sites keep working.)

**Wordmark** — the keystone-in-arch mark (arch strokes in `muted`, keystone
wedge in `accent`) beside the brand in the display face, read from
`siteConfig`; `compact` shrinks 20% for the scroll-compressed navbar. The mark
names no letter so a future rename never invalidates it.

**Card** — three anatomies: capability (chip / eyebrow / title / 3-line /
mono footer), case-study (diagram / eyebrow / industry / title /
before-after row / mono footer), insight (cover pattern / eyebrow / serif
title / 2-line dek / byline + read time). v3 surface: top-lit gradient
hairline + inner highlight (pure CSS, all call sites upgraded untouched);
interactive cards add `<Spotlight />` cursor glow. 16px radius, 24px
padding; hover lifts 2px, border → accent, 8% glow halo.

**Icon** (`Icon.tsx`) — unified set, 24×24 grid, 1.5px stroke, round
caps/joins, `currentColor`, `outline` default + `filled` for status only.
Never emojis, never third-party sets.

**Tag / StatusDot** — mono uppercase labels; `signal` tone reserved for
live states (maps to `--color-signal`).

**SectionHeader** — eyebrow + H2 + lead, `aria-labelledby` wiring via `id`,
optional `index` (`02 /` in accent-bright + hairline rule, v3).

**PageHero v3** — breadcrumb trail whose final crumb absorbs a duplicative
eyebrow, compact rhythm (content inside first viewport), aurora bleed +
deterministic schematic strip. JSON-LD + `aria-label="Breadcrumb"` kept.

**Motion v2 inventory** — `Reveal`/`RevealStagger` (unchanged contracts),
scroll-linked `ArchitectureLandscape` (manual hover/tap takes over 4s),
`<CountUp />` (once, tabular, SR text equivalent), marquee, spotlight,
`<Magnetic />` (≤4px, hero/final CTAs, touch + reduced-motion skip),
≤6px hero parallax, SVG dash-flow. Transform/opacity only; route fade ≤240ms.

**RevealStagger** — children reveal with 60ms stagger, 8px y, 260ms
`ease-out-soft`, fires once. (`Reveal` kept for single elements.)

## 6. Scenes (`src/components/scenes/` — one signature moment per page)

- **HeroInstrument** (home hero): 3-layer agent stack with status pulses,
  incrementing task counters, an "anomaly resolved" event ~every 7s with a
  signal flash. Pauses under `prefers-reduced-motion`. Honesty label kept.
- **ArchitectureLandscape** (home + `/technology`): exploded SVG stack,
  hover-to-isolate, "what each layer guarantees" tap interaction. SVG +
  Framer Motion, no canvas/WebGL.
- **MetricsPulse**: 1px signal dot, 2s cycle, beside computed metrics.
- **QuoteRail**: brass rail + editorial pull-quotes; long-form only.
- **ComplianceStamp**: 2° rotate-on-hover "reviewed" stamp; SOC 2 / ISO /
  GDPR callouts only.

## 7. Motion

```css
--ease-out-soft: cubic-bezier(.16,1,.3,1);
--ease-in-out:   cubic-bezier(.65,0,.35,1);
--ease-spring:   cubic-bezier(.34,1.56,.64,1);
--duration-fast: 180ms; --duration-base: 260ms; --duration-slow: 420ms;
```

Scroll-reveal via `RevealStagger`; hero numerals count up once (800ms,
`tabular-nums`, real metrics only); route change = 200ms opacity fade via
`template.tsx`. `prefers-reduced-motion` disables all non-essential motion
globally. Forbidden: linear easing (except progress bars), entrance bounce,
spinning logos, hero-text parallax, autoplaying carousels, endless loaders.

## 8. States

- Empty: one reusable SVG, one sentence, one action. No "oops".
- Loading: inline 3-dot signal pulse (800ms), never full-page overlay.
- 404/500: console-style operator errors with path / request ID / timestamp
  and a `mailto:engineering@` link.

## 9. Budgets (enforced)

LCP < 1.2s (home) · CLS < 0.05 · INP < 100ms · **shared JS baseline < 165KB
gzip** · **heaviest route < 185KB gzip** · CSS < 20KB gzip · fonts < 150KB ·
0 raster images · Lighthouse 100×4 home, ≥95 key routes · axe zero violations.

Enforcement: `npm run check:budget` reads the build's own route diagnostics and
gzips every chunk each route loads on first paint. It runs in CI after every
build, and it fails the build. `npm run check:rendered` runs alongside it for
the rendered-output invariants. Neither is advisory.

Optimisations in place: SSG everywhere, `LazyMotion` in place of the full motion
build, `optimizePackageImports` for Framer Motion, `LazyMotion` with the
`domAnimation` feature set (the full build shipped projection, drag and layout
code this site never uses), self-hosted subset fonts deduplicated to one file
per family, and the intake vocabulary split out of the zod module so the
validator never reaches the browser.

### Measured status (2026-10-05, production build, local `next start`)

> Historical baseline of the pre-rebrand build, kept for provenance. The
> 2026-11 Keystone rebrand re-measures these after implementation — see
> `docs/rebrand/2026-11/QA-REPORT.md` for the current numbers (budget gates
> and rendered-HTML invariants re-verified green on the rebrand branch).

| Budget | Measured | Status |
| --- | --- | --- |
| LCP < 1.2s (home) | 544ms (worst of 5 routes; `/solutions` 356ms, `/insights` 316ms) | met |
| CLS < 0.05 | 0.0000 – 0.0245 across 5 routes | met |
| INP < 100ms | not measured — needs real interactions in the field (CrUX), not a lab run | pending field data |
| shared JS baseline < 165KB gzip | 157.0KB gzip on all 23 routes | met (`npm run check:budget`) |
| heaviest route < 185KB gzip | 176.9KB gzip on `/` | met (`npm run check:budget`) |
| CSS < 20KB gzip | 12.2KB gzip | met (`npm run check:budget`) |
| fonts < 150KB | ~106KB loaded per route (one file per family after dedup; two faces preloaded) | met |
| 0 raster images | 0 raster bytes on all routes | met |
| axe zero violations above minor impact | 0 across 20 route scans + light theme + open dialog (Playwright axe suite) | met |
| document structure (best-practice rules) | 0 across 20 routes | met (`e2e/a11y.spec.ts`) |
| rendered-output invariants | 0 violations across 53 documents | met (`npm run check:rendered`) |
| LCP < 1.2s (measured on the deployment) | **1072ms worst** of 6 route×viewport combinations, 5 runs each | met (`npm run check:vitals`) |
| CLS < 0.05 (measured on the deployment) | **0.0276 worst** | met (`npm run check:vitals`) |
| Web Vitals, other | FCP 716–1072ms · TTFB 179–296ms · 400–515 KB transferred | measured, not budgeted |
| Lighthouse 100×4 / ≥95 | not run — `lighthouse` CLI is not fetchable from this environment | pending (use pagespeed.web.dev, see LAUNCH-CHECKLIST §3.2) |

### Why the old 90KB figure is gone

The previous target (JS < 90KB gzip initial) was unreachable by construction:
React 19 plus the Next.js App Router client runtime exceed it before a single
line of application code is counted. Keeping it meant the budget table reported
`over budget` on a number no version of this stack could hit, and the one
summary that claimed budgets were met simply omitted the JavaScript row.

The enforced budgets above are measured, and the baseline is split from the
per-route figure so a regression stays visible. Measured composition at the
time of writing (gzip): react-dom + scheduler 71.7KB · app router runtime ~5KB ·
framer-motion `domAnimation` ~56KB · shared client UI ~24KB.

The old text continued: ~190KB gzip is the runtime floor for this stack as bundled. LCP and CLS are already inside budget with 2×
headroom. Reduce only through route-level `next/dynamic` and chunk auditing —
never by vendoring or patching framework code.
