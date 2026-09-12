# VANTIQ Systems — Design System ("Operator's Console" → "Mission Control")

Version 3.0 · Status: active · Owner: frontend team.
Single source of truth for tokens, components, motion, and usage rules.
Companion: `BRAND-GUIDE.md` (voice, positioning, copy rules — unchanged).

> v3 ("Mission Control") is an evolution, not a replacement: same graphite
> base and instrument-panel soul, plus light, depth, and life — aurora
> atmosphere, film grain, glass instruments with cursor spotlight, semantic
> icon chips, diagram thumbnails, gradient display text, magnetic CTAs,
> scroll-linked scenes, and count-ups. Every addition is a token or utility;
> no one-off magic numbers in components. Budgets unchanged (§7).

> Design language in three sentences: **"Operator's Console" treats the site
> like a precision instrument panel — calm, dense where it matters, empty
> where it doesn't.** Type carries the identity; color is reserved for state,
> never decoration. Every page earns one screen-shot-able signature moment and
> nothing more.

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

Signature additions:

| Token | Value (dark) | Rule |
|---|---|---|
| `--color-signal` | `#00E5A8` | **Live / verified / running states ONLY.** Never decoration. |
| `--color-signal-dim` | `#00B486` | Muted live states. |
| `--color-critical` | `#F87171` (kept) | **Real errors ONLY.** Never accent. |
| `--color-brass` | `#B7A36A` | "Considered" states: pull-quotes, engineering notes, reviewed badges. |
| `--color-accent-glow` | `rgba(46,107,246,.18)` | Halo behind hero numerals / wordmark, **max 1 per viewport**. |
| `--color-grid-line` | `rgba(244,242,236,.04)` | Background grid (`<GridLines />`). |
| `--color-grid-line-strong` | `rgba(244,242,236,.08)` | Card borders on dark. |

Light theme re-maps every token (see `globals.css`); contrast re-verified in
`src/lib/a11y-matrix.md`.

### v3 atmosphere tokens & utilities (`globals.css`)

| Utility | What | Rule |
|---|---|---|
| `.aurora-bleed` | Accent + signal radial mesh, masked vignette | Ambient only, ≤8% perceptual; light theme dims further |
| `.grain` / `::after` | 2–3% `feTurbulence` data-URI noise | Kills flat-digital feel; never over text-heavy prose |
| `.spotlight` + `--mx/--my` | Cursor-following radial glow (`<Spotlight />` sets vars) | Interactive cards only; touch + reduced-motion skip |
| `.text-gradient` | Accent → signal `background-clip` text | Display phrases only; darker stops in light theme |
| `.chip` + `data-hue` | 44px icon chip, `accent/signal/brass/sky/amber` | Hues semantic per `Chip.tsx` map, never random |
| `.marquee` / `.marquee-track` | 36s edge-masked loop, pause on hover | Reduced-motion static (explicit gate + global gate) |
| `.diagram-live-path` | Signal dash-flow on one SVG path | Decorative paths only; explicit reduced-motion gate |
| `.text-hero` | `clamp(3rem, 7vw + .5rem, 6rem)` display | Landing hero H1 only |
| `.gauge-track` / `.gauge-band` | Range-band bars for illustrative metrics | Bands show ranges, never single animated numbers |
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
--text-body:    1.0625rem / 1.65;
--text-small:   .875rem;
--text-mono:    .8125rem;
```

Tracking: display `-0.025em`, H1/H2 `-0.015em`, body `0`, mono labels
`+0.16em` uppercase. Body `max-width: 42rem` (`--max-prose`); article body
uses the editorial serif.

## 4. Layout primitives

- `.container-x`: `max-width: 78rem`, responsive `--gutter` (1.5rem → 3rem).
- `.section-y`: 4.5rem → 7rem vertical rhythm.
- `<GridLines />` replaces `.panel-grid`: faint SVG grid at viewport edges
  only — intentional, not graph paper.
- `--max-prose: 42rem` for long-form.

## 5. Components (`src/components/ui/`)

**Button** — three variants only: `primary` (accent bg, 4px glow on hover),
`quiet` (1px `faint` border; hover fills `surface2`), `link` (text + mono
arrow translating 2px on hover). 44px min target, 180ms `ease-out-soft`,
2px accent focus ring at 2px offset. Forbidden: ghost, gradient, glow-pulse,
icon+text primary. (`secondary`/`ghost` props remain as deprecated aliases
of `quiet`/`link` so existing call sites keep working.)

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

## 9. Budgets (non-negotiable)

LCP < 1.2s (home) · CLS < 0.05 · INP < 100ms · JS < 90KB gzip initial ·
CSS < 24KB gzip · fonts < 180KB · 0 raster images ·
Lighthouse 100×4 home, ≥95 key routes · axe zero violations.

Enforcement: SSG everywhere, `next/dynamic` below the fold,
`optimizePackageImports` for Framer Motion, self-hosted subset fonts.
