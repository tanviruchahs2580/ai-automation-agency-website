"use client";

import { useEffect, useState } from "react";

/**
 * Defers entrance animation until after the first client paint.
 *
 * The server cannot know whether a visitor prefers reduced motion or whether
 * JavaScript will run at all, so any element given `initial={{ opacity: 0 }}`
 * at render time is *server-rendered invisible* — the HTML contains
 * `style="opacity:0"` and the content only appears once Framer Motion runs.
 * That is a correctness bug, not a style preference: with JS blocked, on a slow
 * device, or when the chunk never arrives, the content stays blank. It also
 * caused the primary conversion form to render as an empty card.
 *
 * Callers combine this with `useReducedMotion()`:
 *
 * ```tsx
 * const gate = useMotionGate();
 * const reduce = useReducedMotion();
 * const initial = gate && !reduce ? { opacity: 0, y: 8 } : false;
 * ```
 *
 * `initial={false}` means "start at the animate value", so the first paint is
 * the visible resting state and no hide-then-show flash is possible. Motion
 * still runs for everything that happens after mount (step changes, layer
 * switches, scroll reveals), which is where the animation is actually seen.
 *
 * One frame via `requestAnimationFrame` rather than an immediately-set boolean:
 * it keeps the switch out of the same commit as hydration, which is what let
 * `useReducedMotion` settle and what the rest of the codebase already does.
 */
export function useMotionGate(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return ready;
}
