"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CountUp — numerals count up once on first reveal (800ms, ease-out,
 * tabular-nums). Reduced-motion users see the final value immediately.
 * Only for real illustrative values, never animated without a source.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 800,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || done.current) return;
    let observer: IntersectionObserver | undefined;
    // rAF gate (house SSR-safe pattern): no synchronous setState in effect.
    const raf = requestAnimationFrame(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplay(value);
        done.current = true;
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting || done.current) return;
          done.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(value * eased);
            if (t < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          };
          requestAnimationFrame(tick);
          observer?.disconnect();
        },
        { threshold: 0.4 },
      );
      observer.observe(el);
    });
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [value, duration]);

  const formatted = Number.isInteger(value)
    ? Math.round(display).toLocaleString("en-US")
    : display.toFixed(1);

  return (
    <span ref={ref} className={`count-up ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
