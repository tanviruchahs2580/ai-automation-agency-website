"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DURATION, EASE, REVEAL_VIEWPORT } from "@/lib/motion";

/**
 * RevealStagger — scroll-reveal for groups: children enter with 60ms stagger,
 * 8px y-translate, one shared duration/easing token. Fires once.
 *
 * SSR-safe mount gate (same pattern as `Reveal`): the server and the first
 * client paint render a plain static wrapper, so no `opacity: 0` inline style
 * can be server-rendered.
 *
 * A group already inside the viewport at mount also stays static. Without that
 * check the group was painted visible (SSR) and then switched to `hidden` on
 * hydration, so anything straddling the fold — the top of `/industries`,
 * `/services`, `/solutions`, `/work` — visibly blinked: visible, gone, back.
 * The check is the same in-view test `Reveal` uses.
 *
 * Uses `m` (not `motion`) so LazyMotion can supply the feature set.
 */
export function RevealStagger({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const rect = ref.current?.getBoundingClientRect();
      const inView = !!rect && rect.bottom > 0 && rect.top < window.innerHeight - 40;
      setAnimate(!inView);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (reduceMotion || !animate) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <m.div
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={REVEAL_VIEWPORT}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </m.div>
  );
}

export function RevealStaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 8 },
        shown: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.base, ease: EASE.outSoft },
        },
      }}
    >
      {children}
    </m.div>
  );
}

/** Re-export prop so call sites can set per-item offset when needed. */
export type { ReactNode as RevealStaggerChild };
