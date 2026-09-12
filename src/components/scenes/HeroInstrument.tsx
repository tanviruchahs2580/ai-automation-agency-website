"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusDot } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";

/**
 * HeroInstrument — the home hero's signature moment: a live "operations
 * console" showing a 3-layer agent stack (orchestrator → workers → tools)
 * with status pulses, incrementing task counters, and one "anomaly resolved"
 * event ~every 7s with a signal-green flash.
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

export function HeroInstrument() {
  const [tasks, setTasks] = useState(48210);
  const [approvals, setApprovals] = useState(316);
  const [eventIndex, setEventIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [live, setLive] = useState(false);

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
        setTasks((t) => t + 3 + Math.floor(Math.random() * 9));
        if (Math.random() > 0.6) setApprovals((a) => a + 1);
      };
      counter = setInterval(tick, 1800);
      const fireEvent = () => {
        setEventIndex((i) => (i + 1) % anomalies.length);
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

  return (
    <div className="card-surface relative w-full overflow-hidden shadow-2xl shadow-black/40">
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
              <div
                className="ml-5 h-3 w-px bg-[color:var(--color-line-strong)]"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-3 rounded-lg border border-line bg-surface2 px-3 py-2.5">
              <StatusDot tone={layer.id === "workers" ? "accent" : "signal"} pulse={live} />
              <div className="min-w-0">
                <p className="mono-label truncate">{layer.label}</p>
                <p className="truncate text-[11px] text-faint">{layer.detail}</p>
              </div>
              <span className="mono-label ml-auto shrink-0 text-signal">
                LIVE
              </span>
            </div>
          </li>
        ))}
      </ol>

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
  );
}
