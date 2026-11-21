"use client";

import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { type ReactNode } from "react";

/**
 * Hero parallax — the photographic layer drifts a few pixels against the
 * scroll while its section leaves the viewport.
 *
 * Budget note: `useScroll`/`useTransform` are already in the shared bundle
 * (HeroInstrument, ArchitectureLandscape), so this adds no library code.
 *
 * Safety properties, mirroring Reveal:
 *  - transform-only (compositor; no layout, no repaint of the photograph);
 *  - disabled entirely under `prefers-reduced-motion` (plain static wrapper);
 *  - the wrapper is oversized by the exact drift range (see .hero-layer), so
 *    the photograph never exposes an edge at any scroll position;
 *  - SSR renders the same initial transform the client hydrates with, so the
 *    hero never shifts at hydration (LCP-stable).
 */
export function HeroParallax({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  /* 0 → 48px matches the wrapper's -6% overscan on a ~800px hero; the CSS
     comment on .hero-layer documents the pairing. */
  const y = useTransform(scrollYProgress, [0, 1], [0, 48]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div className={className} style={{ y, willChange: "transform" }}>
      {children}
    </m.div>
  );
}
