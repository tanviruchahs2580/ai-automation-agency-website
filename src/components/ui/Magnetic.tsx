"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { SPRING } from "@/lib/motion";

/**
 * Magnetic — ≤4px spring nudge on hover for hero/final CTAs only.
 * Transform-only; statically rendered on touch pointers + reduced-motion.
 * Uses `m` (not `motion`) so LazyMotion can supply the feature set.
 */
export function Magnetic({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <span className="inline-flex">{children}</span>;

  return (
    <m.span
      className="inline-flex"
      whileHover={{ x: 3, y: -1 }}
      transition={SPRING.nudge}
    >
      {children}
    </m.span>
  );
}
