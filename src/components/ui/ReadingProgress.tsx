"use client";

import { useEffect, useRef } from "react";

/**
 * Reading-progress bar for long-form articles.
 *
 * Writes straight to the DOM from inside a single `requestAnimationFrame` per
 * scroll burst instead of holding the value in React state. The previous
 * version called `setProgress` on every scroll event and animated `width`,
 * so a normal scroll ran a React render *and* a layout pass per frame. Scaling
 * a composited transform needs neither, and only the `aria-valuenow` attribute
 * is touched on screen readers' behalf — and only when the integer changes, so
 * assistive tech is not spammed with sub-percent updates.
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number | null = null;
    let lastPercent = -1;

    const update = () => {
      frame = null;
      const el = barRef.current;
      if (!el) return;

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;

      el.style.transform = `scaleX(${ratio})`;

      const percent = Math.round(ratio * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        el.setAttribute("aria-valuenow", String(percent));
      }
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div className="fixed start-0 top-0 z-[60] h-[3px] w-full">
      <div
        ref={barRef}
        role="progressbar"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
        className="progress-fill h-full bg-accent"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
