"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Back-to-top control.
 *
 * Two fixes over the previous version:
 *
 *  1. It sat in the same bottom-right corner as the cookie banner and one z
 *     layer below it, so on a first visit — the only time the banner is on
 *     screen — the button was completely covered and unclickable at every
 *     scroll position past 300px. It now lifts by `--consent-offset`, which the
 *     banner publishes from its own measured height, so the two can never
 *     overlap at any width, text size or zoom level.
 *  2. `behavior: "smooth"` overrides the global
 *     `@media (prefers-reduced-motion: reduce) { scroll-behavior: auto }` rule —
 *     the ScrollOptions argument wins over the CSS property — so reduced-motion
 *     visitors still got a full-page animated scroll. The preference is now
 *     checked directly.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{ bottom: "calc(1.5rem + var(--consent-offset, 0px))" }}
      className="fixed end-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-field bg-canvas/90 text-muted shadow-lg backdrop-blur-md transition-colors hover:border-accent hover:text-accent-strong"
    >
      <Icon name="arrow-up" size={16} />
    </button>
  );
}
