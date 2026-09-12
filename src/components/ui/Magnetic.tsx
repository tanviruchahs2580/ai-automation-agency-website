"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Magnetic — ≤4px spring nudge on hover for hero/final CTAs only.
 * Transform-only; statically rendered on touch pointers + reduced-motion.
 */
export function Magnetic({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <span className="inline-flex">{children}</span>;

  return (
    <motion.span
      className="inline-flex"
      whileHover={{ x: 3, y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
    >
      {children}
    </motion.span>
  );
}
