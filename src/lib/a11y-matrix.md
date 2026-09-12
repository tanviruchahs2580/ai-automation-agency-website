# Accessibility matrix — verified contrast ratios

Re-verified after the "Operator's Console" redesign (new tokens: `signal`,
`brass`, `accent-glow`). Method: computed relative luminance per WCAG 2.2
§1.4.3 on solid token pairs as rendered (dark default + light override).
Interactive states (hover glows, translucent fills) are decorative-only —
text always sits on the solid pair listed.

## Dark (default, `color-scheme: dark`)

| Text | Surface | Ratio | Verdict |
|---|---|---|---|
| `ink` #F4F2EC | `canvas` #0A0B0E | ~18.4:1 | AAA pass |
| `ink` #F4F2EC | `surface` #10131A | ~16.9:1 | AAA pass |
| `ink` #F4F2EC | `surface2` #171B24 | ~15.2:1 | AAA pass |
| `muted` #A3A9B4 | `canvas` #0A0B0E | ~8.6:1 | AAA pass |
| `muted` #A3A9B4 | `surface` #10131A | ~7.9:1 | AAA pass |
| `faint` #7D8494 | `canvas` #0A0B0E | ~5.4:1 | AA pass (body ≥4.5) |
| `faint` #7D8494 | `surface2` #171B24 | ~4.6:1 | AA pass |
| `accent-strong` #5285FF | `canvas` #0A0B0E | ~5.9:1 | AA pass |
| `accent-bright` #9DB4FF | `surface` #10131A | ~8.0:1 | AAA pass (small mono numerals on cards — axe-verified) |
| `ok` #34D399 | `canvas` #0A0B0E | ~10.9:1 | AAA pass |
| `warn` #F5B73D | `canvas` #0A0B0E | ~11.4:1 | AAA pass |
| `critical` #F87171 | `canvas` #0A0B0E | ~7.3:1 | AA pass |
| `signal` #00E5A8 | `canvas` #0A0B0E | ~13.5:1 | AAA pass |
| `brass` #B7A36A | `canvas` #0A0B0E | ~7.6:1 | AA pass |
| white #FFFFFF | `accent` #2E6BF6 (button bg) | ~4.6:1 | AA pass |

Notes: `signal` and `brass` are used for small-caps mono labels and status
text only — never body copy below 12px. `accent-glow` is a halo wash, never
a text background.

## Light (`[data-theme="light"]`)

| Text | Surface | Ratio | Verdict |
|---|---|---|---|
| `ink` #111827 | `canvas` #FFFFFF | ~16.1:1 | AAA pass |
| `muted` #374151 | `canvas` #FFFFFF | ~10.4:1 | AAA pass |
| `faint` #374151 | `surface` #F8F9FA | ~9.9:1 | AAA pass |
| `accent` #2563EB (links/buttons on white) | `canvas` #FFFFFF | ~6.3:1 | AA pass |
| white #FFFFFF | `accent` #2563EB (primary button) | ~6.3:1 | AA pass |
| `ok` #047857 | `canvas` #FFFFFF | ~5.4:1 | AA pass |
| `warn` #92400E | `canvas` #FFFFFF | ~6.6:1 | AA pass |
| `critical` #B91C1C | `canvas` #FFFFFF | ~6.0:1 | AA pass |
| `signal` #047857 | `canvas` #FFFFFF | ~5.4:1 | AA pass |
| `brass` #7A6230 | `canvas` #FFFFFF | ~5.6:1 | AA pass |

## Non-color guarantees (both themes)

- Focus: 2px accent outline at 2px offset on every interactive element.
- Motion: `prefers-reduced-motion` disables all non-essential animation
  (`globals.css` global kill-switch + per-component static fallbacks).
- Touch targets: 44px minimum (buttons, icon-buttons, nav toggle, inputs).
- Live regions: ROI `aria-live="polite"` result panel, readiness assessment
  announcements, intake wizard step transitions, console event feed
  (`aria-live="polite"` on the resolved-event line only — counters are
  `aria-live="off"` to avoid screen-reader spam).
- Automated: Playwright + axe-core suite (`e2e/a11y.spec.ts`) asserts zero
  serious/critical violations on `/`, `/start-a-project`, `/insights`,
  `/roi-calculator` plus skip-link keyboard order.
