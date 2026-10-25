"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Loads only the animation features this site actually uses.
 *
 * Importing `motion` from Framer Motion pulls in the full feature set —
 * projection, layout projection, drag, pan gestures, layout groups — none of
 * which this codebase uses (there is no `layout`, `layoutId`, `drag` or
 * `whileTap` anywhere in `src/`). That full build was landing in the first-load
 * JavaScript of 22 of 23 routes at ~39 KB gzip, including `/privacy` and
 * `/terms`, which contain no animation at all.
 *
 * `LazyMotion` + `m` loads the smaller `domAnimation` set (animations, variants,
 * exit animations, and hover/tap/focus gestures — everything used here) as a
 * separate chunk, and `strict` turns any accidental `motion` import inside the
 * provider into a loud error rather than a silent budget regression.
 *
 * `children` are passed through as a prop, so every page below this provider
 * remains a Server Component; only the provider itself is client code.
 */
const loadFeatures = () =>
  import("framer-motion").then((framer) => framer.domAnimation);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
