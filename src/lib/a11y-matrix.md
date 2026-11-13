# Accessibility matrix

Re-issued for the Keystone rebrand (2026-11). Historical note: the previous
version of this file tabulated hand-computed ratios for the retired palette
(blue accent, blue-black canvas); those numbers went stale the moment the
tokens changed — which is exactly why they are no longer duplicated here.

## Contrast — the test is the record

`src/lib/__tests__/contrast.test.ts` parses `globals.css` (the stylesheet that
actually ships), resolves every custom property and `color-mix()`, and
computes WCAG 2.2 ratios for:

- every text-token pair on its real surfaces, in both themes (`ink`, `muted`,
  `faint`, `accent-bright`, `accent-strong` on canvas / surface / surface2);
- the primary button's label against its resting and hover fills, in both
  themes (the `.ink-on-accent` / `--color-ink-on-accent` pairing);
- WCAG 1.4.11 non-text contrast for interactive-control boundaries
  (`--color-field`) and the accent focus ring;
- a guard that the primary button stays a solid token fill (gradients are
  invisible to axe — see the history note in `.btn-primary`).

Run it: `npx vitest run src/lib/__tests__/contrast.test.ts`. It fails the
build on any regression. Current status after the Keystone re-token: 25/25
passing.

Method note: ratios are computed on solid token pairs as rendered.
Interactive-state effects (glows, translucent fills) are decorative only —
text always sits on the solid pair the test evaluates.

## Non-color guarantees (both themes)

- Focus: 2px accent outline at 2px offset on every interactive element
  (1.4.11 boundary contrast for the ring is machine-checked — see above).
- Motion: `prefers-reduced-motion` disables all non-essential animation
  (`globals.css` global kill-switch + per-component static fallbacks).
- Touch targets: 44px minimum (buttons, icon-buttons, nav toggle, inputs).
- Live regions: the ROI calculator's debounced one-sentence summary, the
  search result count, the insights filter count, the readiness counter, the
  restored-draft notice and the intake server error. The ROI *results panel* is
  deliberately not a live region (every metric recomputes per keystroke, so a
  polite queue announced stale numbers for seconds and could not be interrupted)
  and the intake wizard announces a step change by moving focus to the step
  heading rather than by re-announcing the whole step.
  (`aria-live="polite"` on the resolved-event line only — counters are
  `aria-live="off"` to avoid screen-reader spam.)
- Automated: Playwright + axe-core suite (`e2e/a11y.spec.ts`) asserts zero
  violations above *minor* impact on `/`, `/start-a-project`, `/insights`,
  `/roi-calculator`, a 16-route sweep in dark, a light-theme pass and the open
  search dialog — plus skip-link and keyboard order. Minor-impact rules are
  excluded deliberately; they are style preferences rather than barriers.
- Automated: `e2e/a11y.spec.ts` "document structure" runs the best-practice
  rules the WCAG tag set excludes — heading order, landmark coverage, duplicate
  ids — across 20 routes. Those are the rules that let `h1 → h3` and the
  historical duplicate grid id ship unnoticed.
