"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { StatusDot } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";

/**
 * HeroInstrument — the home hero's signature moment: a live "operations
 * console" showing a 3-layer agent stack (orchestrator → workers → tools)
 * with status pulses, incrementing task counters, a ticking throughput
 * sparkline, animated flow lines, floating state-bound annotation chips,
 * and one "anomaly resolved" event ~every 7s with a signal-green flash.
 *
 * All figures are simulated for illustration (labelled); nothing here is
 * company or client data. Pauses under `prefers-reduced-motion`.
 */

const layers = [
  { id: "orchestrator", label: "Orchestrator", detail: "routes work · enforces policy" },
  { id: "workers", label: "Workers ×4", detail: "intake · support · finance · research" },
  { id: "tools", label: "Tools", detail: "scoped credentials · approval gates" },
] as const;

const anomalies = [
  "Mismatch $12.50 auto-flagged → credit note requested",
  "Stale permission mirror refreshed on knowledge base",
  "Model fallback engaged: 0 failed requests during switch",
  "Duplicate invoice detected → merged before posting",
];

const SPARK_MAX = 26;

export function HeroInstrument() {
  const [tasks, setTasks] = useState(48210);
  const [approvals, setApprovals] = useState(316);
  const [resolved, setResolved] = useState(128);
  const [spark, setSpark] = useState<number[]>(() =>
    Array.from({ length: SPARK_MAX }, (_, i) => 4 + Math.round(4 * Math.sin(i / 3) + (i % 5))),
  );
  const [eventIndex, setEventIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [live, setLive] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const panelY = useTransform(scrollY, [0, 600], [0, 6]);

  // rAF gate (same SSR-safe pattern as Reveal): the server and first client
  // paint render the static console, so live state never mismatches
  // hydration. Motion enables after first paint; reduced-motion stays static.
  useEffect(() => {
    let counter: ReturnType<typeof setInterval> | undefined;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const raf = requestAnimationFrame(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setLive(true);
      const tick = () => {
        const delta = 3 + Math.floor(Math.random() * 9);
        setTasks((t) => t + delta);
        setSpark((s) => [...s.slice(-(SPARK_MAX - 1)), delta]);
        if (Math.random() > 0.6) setApprovals((a) => a + 1);
      };
      counter = setInterval(tick, 1800);
      const fireEvent = () => {
        setEventIndex((i) => (i + 1) % anomalies.length);
        setResolved((r) => r + 1);
        setFlash(true);
        timeouts.push(setTimeout(() => setFlash(false), 900));
        timeouts.push(setTimeout(fireEvent, 6500 + Math.random() * 1500));
      };
      timeouts.push(setTimeout(fireEvent, 3500));
    });
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(counter);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const sparkPath = spark
    .map((v, i) => {
      const x = 4 + (i * 152) / (SPARK_MAX - 1);
      const y = 30 - Math.min(26, Math.max(2, v * 2.1));
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <motion.div style={reduceMotion ? undefined : { y: panelY }} className="relative">
      {/* Floating state-bound chips — layered depth, values from live state */}
      <div
        aria-hidden="true"
        className="absolute -left-4 -top-14 z-10 hidden rounded-lg border border-line bg-surface px-3 py-2 shadow-xl sm:block"
      >
        <p className="mono-label text-faint">APPROVALS QUEUED</p>
        <p className="tabular mt-0.5 font-mono text-sm text-brass">{approvals}</p>
      </div>
      <div
        aria-hidden="true"
        className="absolute -bottom-5 -right-2 z-10 hidden rounded-lg border border-line bg-surface px-3 py-2 shadow-xl sm:block"
      >
        <p className="mono-label text-faint">EVENTS RESOLVED</p>
        <p className="tabular mt-0.5 font-mono text-sm text-signal">{resolved}</p>
      </div>

      <div className="card-surface grain relative w-full overflow-hidden shadow-2xl shadow-black/40">
        <div
          className="glow-halo pointer-events-none absolute -right-16 -top-16 h-56 w-56"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="mono-label flex items-center gap-2 uppercase text-muted">
            <StatusDot tone="signal" pulse={live} />
            Operations console
          </p>
          <span className="mono-label rounded border border-warn/40 bg-warn/10 px-2 py-0.5 uppercase text-warn">
            Interactive simulation
          </span>
        </div>

        <ol className="space-y-0 px-5 pt-5 sm:px-6">
          {layers.map((layer, i) => (
            <li key={layer.id}>
              {i > 0 && (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="ml-5">
                  <line
                    x1="6"
                    y1="0"
                    x2="6"
                    y2="12"
                    stroke="var(--color-signal)"
                    strokeWidth="1.5"
                    className="diagram-live-path"
                  />
                </svg>
              )}
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface2 px-3 py-2.5">
                <StatusDot tone={layer.id === "workers" ? "accent" : "signal"} pulse={live} />
                <div className="min-w-0">
                  {/* line-clamp (wrapping) rather than truncate (nowrap): a
                      nowrap line sets this card's min-content width to the
                      full detail string (~166px), which pushed the console
                      26px past a 320px viewport. Clamping keeps the identical
                      one-line ellipsis look without inflating intrinsic width. */}
                  <p className="mono-label line-clamp-1">{layer.label}</p>
                  <p className="line-clamp-1 text-[11px] text-faint">
                    {layer.detail}
                  </p>
                </div>
                <span className="mono-label ml-auto shrink-0 text-signal">
                  LIVE
                </span>
              </div>
            </li>
          ))}
        </ol>

        {/* Throughput sparkline — ticks with the task counter */}
        <div className="px-5 pt-4 sm:px-6">
          <div className="rounded-lg border border-line bg-surface2 p-3">
            <div className="flex items-baseline justify-between">
              <p className="mono-label text-faint">THROUGHPUT / 1.8S TICK</p>
              <p className="tabular font-mono text-xs text-muted">
                {tasks.toLocaleString("en-US")} tasks
              </p>
            </div>
            <svg viewBox="0 0 160 34" className="mt-2 h-9 w-full" aria-hidden="true" preserveAspectRatio="none">
              <path d={sparkPath} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
              <path d={`${sparkPath} L160 34 L0 34 Z`} fill="var(--color-accent-glow)" stroke="none" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-5 sm:px-6">
          <div className="rounded-lg border border-line bg-surface2 p-3">
            <p className="mono-label text-faint">Tasks processed</p>
            <p className="tabular mt-1 font-mono text-xl" aria-live="off">
              {tasks.toLocaleString("en-US")}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface2 p-3">
            <p className="mono-label text-faint">Human approvals</p>
            <p className="tabular mt-1 font-mono text-xl">{approvals}</p>
          </div>
        </div>

        <div className="border-t border-line px-5 py-3 sm:px-6" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={eventIndex}
              initial={live ? { opacity: 0, y: 4 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 text-xs text-muted"
            >
              <Icon
                name="check"
                size={14}
                className={flash ? "text-signal" : "text-faint"}
              />
              <span>
                <span className="mono-label mr-2 text-signal">RESOLVED</span>
                {anomalies[eventIndex]}
              </span>
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="border-t border-line px-5 py-2.5 text-[11px] leading-snug text-faint sm:px-6">
          All figures simulated for illustration. No client data is shown.
        </p>
      </div>
    </motion.div>
  );
}
