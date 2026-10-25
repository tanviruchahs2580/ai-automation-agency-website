"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Route-transition fade (Design System §8.3) — applied to client-side
 * navigations only.
 *
 * `template.tsx` is re-instantiated for every navigation, *including the first
 * page load*. The previous implementation applied `route-fade` unconditionally,
 * and because that keyframe starts at `opacity: 0`, the server-rendered HTML of
 * every page opened on a fully transparent frame: the first thing painted was
 * an empty page, and the page was promoted to a composited layer for 200ms even
 * though no navigation had happened. With JavaScript blocked or slow, the whole
 * page stayed invisible.
 *
 * `seenRouteTransition` is module state for one reason: it describes the
 * *session*, while this component instance describes a single route. React's own
 * tools — state, refs, context — are all scoped to an instance that no longer
 * exists by the time the next navigation renders, so none of them can answer
 * "has this document already painted a route?".
 *
 * The read is safe because it happens exactly once per mount, inside a lazy
 * initialiser, and the result is then frozen:
 *  - the flag is only written from an effect, so on the server it stays `false`
 *    and SSR never emits the class;
 *  - the client's hydration render therefore computes `false` too, matching the
 *    server markup exactly;
 *  - because the decision is frozen per instance, a later re-render of the same
 *    route cannot re-apply the class and replay the animation over visible
 *    content;
 *  - it selects a cosmetic class name only — never structure or content.
 *
 * Visible result: the entry page paints immediately; every subsequent in-app
 * navigation still gets the designed 200ms fade.
 */

let seenRouteTransition = false;

export default function Template({ children }: { children: ReactNode }) {
  const [isClientNavigation] = useState(
    () => typeof window !== "undefined" && seenRouteTransition,
  );

  useEffect(() => {
    seenRouteTransition = true;
  }, []);

  return (
    <div className={isClientNavigation ? "route-fade" : undefined}>{children}</div>
  );
}
