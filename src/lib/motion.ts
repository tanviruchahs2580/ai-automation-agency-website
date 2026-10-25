/**
 * Motion tokens for JavaScript-driven animation.
 *
 * Mirrors the CSS custom properties declared in `globals.css`
 * (`--duration-fast|base|slow`, `--ease-out-soft|in-out|spring`) so a value
 * chosen in CSS and a value chosen in Framer Motion describe the same motion
 * language. Components import from here instead of writing literals — the
 * previous state of the codebase had `0.26 / [0.16, 1, 0.3, 1]` duplicated in
 * three files and a fourth, off-system easing in the most-used wrapper.
 *
 * Durations are seconds (Framer's unit); CSS tokens are milliseconds.
 */

export const DURATION = {
  /** 180ms — state changes the user caused: hover, press, toggle. */
  fast: 0.18,
  /** 260ms — the default for entrances and route-level transitions. */
  base: 0.26,
  /** 420ms — larger surfaces: panels, scroll reveals, section entrances. */
  slow: 0.42,
} as const;

export const EASE = {
  /** cubic-bezier(0.16, 1, 0.3, 1) — decelerating; the house default. */
  outSoft: [0.16, 1, 0.3, 1],
  /** cubic-bezier(0.65, 0, 0.35, 1) — symmetric; for reversible transitions. */
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const SPRING = {
  /** ≤4px hover nudge (`Magnetic`). Named rather than inline so the feel is
   *  one decision, not one per call site. */
  nudge: { type: "spring", stiffness: 400, damping: 18 },
} as const;

/**
 * Shared `viewport` config for scroll-triggered animation: fire once, and hold
 * until the element is properly on screen rather than letting it trigger at the
 * first pixel. One definition keeps every reveal firing at the same threshold.
 */
export const REVEAL_VIEWPORT = { once: true, margin: "-60px" } as const;
