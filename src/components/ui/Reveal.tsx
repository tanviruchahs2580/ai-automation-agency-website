"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}

/**
 * Scroll-triggered reveal that fully disables itself under
 * `prefers-reduced-motion` — content is rendered statically instead.
 *
 * SSR-safe: the server and the first client paint render a plain static
 * wrapper, so no `opacity: 0` inline style mismatches hydration.
 *
 * Content already inside the viewport at mount stays static. Reveal is a
 * *scroll* reveal: handing an above-the-fold element to framer-motion would
 * paint it at full opacity (SSR) and then re-run `initial: opacity 0` on
 * hydration — a visible hide-and-return that gated the hero's LCP at
 * ~1.5s (budget: 1.2s). Below-the-fold elements keep the entrance motion,
 * and they are off-screen while the switch happens, so it is never seen.
 */
export function Reveal({ children, delay = 0, className, y = 18 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"ssr" | "static" | "motion">("ssr");

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const rect = ref.current?.getBoundingClientRect();
      const inView = !!rect && rect.bottom > 0 && rect.top < window.innerHeight - 40;
      setPhase(inView ? "static" : "motion");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (phase !== "motion" || reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}
