"use client";

import { useEffect, useRef } from "react";
import { track, AnalyticsEvent } from "@/lib/analytics";

/**
 * Scroll-depth tracker — fires scroll_25/50/75/100 once each on the page
 * that mounts it (§14). Passive listener, fires through the existing
 * analytics abstraction. No-ops under SSR.
 */
export function ScrollDepthTracker() {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    const marks = [25, 50, 75, 100];
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.round((window.scrollY / total) * 100);
      for (const mark of marks) {
        if (pct >= mark && !fired.current.has(mark)) {
          fired.current.add(mark);
          track(AnalyticsEvent.ScrollDepth, { percent: mark });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
