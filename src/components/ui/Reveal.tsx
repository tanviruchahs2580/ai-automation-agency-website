"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

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
 * wrapper, so no `opacity: 0` inline style mismatches hydration. Motion is
 * only enabled after mount.
 */
export function Reveal({ children, delay = 0, className, y = 18 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Mount gate: keeps SSR HTML identical to the first client paint
  // (plain wrapper, no `opacity: 0` inline style) so entrance motion never
  // triggers a hydration mismatch. Motion enables after first paint.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (reduceMotion || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
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
