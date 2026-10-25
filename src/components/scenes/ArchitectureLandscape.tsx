"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { useMotionGate } from "@/components/motion/useMotionGate";
import { StatusDot } from "@/components/ui/Tag";
import { architectureLayers as layers } from "@/data/architecture";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * ArchitectureLandscape — interactive exploded view of the agent stack.
 * Hover (or tap) a layer to isolate it and read what that layer guarantees.
 * SVG connectors + Framer Motion; no canvas/WebGL. Keyboard accessible:
 * layers are real buttons with `aria-pressed`.
 *
 * The layer content lives in `@/data/architecture` so the `/technology` page can
 * state the count from the same source this component renders from.
 */

export function ArchitectureLandscape() {
  const [active, setActive] = useState<string>("agents");
  const manualRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const gate = useMotionGate();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start 0.75", "end 0.35"],
  });

  /*
    Entrance is gated on mount: `initial` has to be `false` for the first render,
    otherwise the server emits `style="opacity:0;transform:translateY(8px)"` on
    the whole panel and the entire right-hand column of this scene is blank until
    hydration completes (and permanently blank with JavaScript blocked).
  */
  const entrance = gate && !reduceMotion ? { opacity: 0, y: 8 } : false;

  /* Reduced motion gets an instant swap rather than a 260ms fade, and an
     `AnimatePresence mode="wait"` that no longer delays the replacement. */
  const exit = reduceMotion
    ? { opacity: 0, transition: { duration: 0 } }
    : { opacity: 0 };

  // Scroll-linked story: layers highlight in sequence while the scene
  // travels through the viewport. Any hover/focus/tap takes over for 4s
  // (flag + timer live in refs so the render stays pure).
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduceMotion || manualRef.current) return;
    const i = Math.min(layers.length - 1, Math.floor(v * layers.length));
    const next = layers[i]?.id;
    if (next) setActive((prev) => (prev === next ? prev : next));
  });

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const takeOver = (id: string) => {
    manualRef.current = true;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      manualRef.current = false;
    }, 4000);
    setActive(id);
  };

  const current = layers.find((l) => l.id === active) ?? layers[2];

  return (
    <div ref={rootRef} className="card-surface grain grid gap-0 overflow-hidden p-0 lg:grid-cols-12">
      <div
        className="border-b border-line p-4 sm:p-5 lg:col-span-5 lg:border-b-0 lg:border-r"
        role="group"
        aria-label="Architecture layers — select to isolate"
      >
        <ol className="space-y-1">
          {layers.map((layer, i) => {
            const isActive = layer.id === active;
            const dimmed = active !== layer.id;
            return (
              <li key={layer.id}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  /*
                    The button swaps the shared detail panel; aria-controls
                    exposes that relationship so a screen-reader user knows
                    which region the pressed state affects. The panel is
                    deliberately NOT a live region — the active layer also
                    changes on scroll, which would spam announcements.
                  */
                  aria-controls="architecture-layer-panel"
                  onMouseEnter={() => takeOver(layer.id)}
                  onFocus={() => takeOver(layer.id)}
                  onClick={() => takeOver(layer.id)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-start transition-all duration-150",
                    isActive
                      ? "border-accent/50 bg-accent/10"
                      : "border-transparent hover:border-line hover:bg-surface2",
                    dimmed && "opacity-70 hover:opacity-100",
                  )}
                >
                  <span className="mono-label w-7 shrink-0 text-accent-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <StatusDot tone={isActive ? "accent" : "signal"} pulse={isActive} />
                  <span className="text-sm font-medium">{layer.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative p-6 sm:p-8 lg:col-span-7">
        <div
          className="glow-halo pointer-events-none absolute -right-10 -top-10 h-48 w-48"
          aria-hidden="true"
        />
        {/*
          Minimum height, not a fixed height: `AnimatePresence mode="wait"` swaps
          one panel for the next, so without a floor the connectors below — and
          everything after the scene — shift on each change, including the
          scroll-driven changes that fire with no user input.

          Measured with a browser at each breakpoint by selecting all six layers
          in turn and reading the wrapper's height; every layer resolved to the
          same value, which is what these floors encode:

            390px wide → 272px (17rem, the default)
            768px wide → 208px (13rem, `sm:` and up)
           1440px wide → 200px (12.5rem, `lg:` and up)

          If a layer's copy grows past its breakpoint's floor, that panel will be
          taller than the others and the shift returns; re-measure and update the
          floor rather than adding padding elsewhere.
        */}
        <div className="min-h-[17rem] sm:min-h-[13rem] lg:min-h-[12.5rem]">
          <AnimatePresence mode="wait">
            <m.div
              key={current.id}
              id="architecture-layer-panel"
              initial={entrance}
              animate={{ opacity: 1, y: 0 }}
              exit={exit}
              transition={{ duration: DURATION.base, ease: EASE.outSoft }}
            >
              <p className="eyebrow">What this layer guarantees</p>
              <h3 className="h-card mt-3 font-display text-xl">{current.label}</h3>
              <p className="mt-3 max-w-lg leading-relaxed">{current.guarantee}</p>
              <p className="mono-label mt-4 border-t border-line pt-4 uppercase text-muted">
                {current.technical}
              </p>
            </m.div>
          </AnimatePresence>
        </div>
        <svg
          className="mt-6 w-full"
          height="56"
          viewBox="0 0 400 56"
          fill="none"
          aria-hidden="true"
        >
          {layers.map((layer, i) => {
            const x = 20 + i * 72;
            const isActive = layer.id === active;
            return (
              <g key={layer.id} opacity={active === layer.id || active === null ? 1 : 0.35}>
                <rect
                  x={x}
                  y={8}
                  width={52}
                  height={40}
                  rx={8}
                  stroke={isActive ? "var(--color-accent)" : "var(--color-line-strong)"}
                  strokeWidth={isActive ? 2 : 1}
                  fill={isActive ? "var(--color-accent-glow)" : "transparent"}
                />
                <circle
                  cx={x + 26}
                  cy={28}
                  r={4}
                  fill={isActive ? "var(--color-accent)" : "var(--color-signal)"}
                />
                {i < layers.length - 1 && (
                  <path
                    d={`M${x + 52} 28h20`}
                    stroke="var(--color-line-strong)"
                    strokeWidth={1}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
