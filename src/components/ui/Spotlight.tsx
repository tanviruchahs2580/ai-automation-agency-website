"use client";

import { useCallback, useEffect, useRef, type ReactNode, type MouseEvent } from "react";

/**
 * Spotlight — cursor-following radial glow on interactive cards.
 * Writes `--mx`/`--my` custom properties consumed by `.spotlight::after`.
 *
 * The handler used to call `window.matchMedia` twice and
 * `getBoundingClientRect()` on *every* mouse-move event, then write a style —
 * an interleaved read/write across the whole event stream, which is the classic
 * layout-thrash pattern and the most expensive thing on any page with a card
 * grid. Two changes:
 *
 *  1. reads and writes are coalesced into a single `requestAnimationFrame`, so
 *     there is at most one geometry read and one write per frame regardless of
 *     how fast the pointer moves (the pointer position is what gets sampled,
 *     not the element geometry, so the glow stays accurate);
 *  2. the capability checks run once per pointer entry instead of per event —
 *     they cannot change mid-hover, and re-testing them ~120×/second was pure
 *     overhead.
 */
export function Spotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<number | null>(null);
  const enabled = useRef(false);

  const cancel = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const onEnter = () => {
    enabled.current =
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.matchMedia("(hover: none)").matches;
  };

  const flush = useCallback(() => {
    frame.current = null;
    const el = ref.current;
    const point = pointer.current;
    if (!el || !point) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${point.x - rect.left}px`);
    el.style.setProperty("--my", `${point.y - rect.top}px`);
  }, []);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!enabled.current) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(flush);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={cancel}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}
