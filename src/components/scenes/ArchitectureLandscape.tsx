"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { StatusDot } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

/**
 * ArchitectureLandscape — interactive exploded view of the agent stack.
 * Hover (or tap) a layer to isolate it and read what that layer guarantees.
 * SVG connectors + Framer Motion; no canvas/WebGL. Keyboard accessible:
 * layers are real buttons with `aria-pressed`.
 */

const layers = [
  {
    id: "goal",
    label: "Business Goal",
    guarantee: "Every layer below moves a named metric — never technology for its own sake.",
    technical: "Objectives encoded as measurable targets that evaluation suites assert on every release.",
  },
  {
    id: "orchestration",
    label: "Orchestration",
    guarantee: "Work follows your process, with retries, timeouts, and escalation paths built in.",
    technical: "State machines coordinating agents, retries, timeouts and escalation paths.",
  },
  {
    id: "agents",
    label: "AI Agents",
    guarantee: "Judgment-heavy steps run around the clock — inside scoped, reviewable bounds.",
    technical: "Specialised agents with scoped prompts, memory policies and per-task model routing.",
  },
  {
    id: "tools",
    label: "Tools",
    guarantee: "Agents touch your systems with least-privilege credentials and approval gates.",
    technical: "Schema-validated tool registry; consequential actions queue for human sign-off.",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    guarantee: "Answers cite your approved content — never invented facts.",
    technical: "Permission-aware retrieval over vector and keyword indexes with freshness SLAs.",
  },
  {
    id: "governance",
    label: "Governance",
    guarantee: "Policy compliance is structural and auditable — every decision leaves a trace.",
    technical: "Guardrails, PII redaction, RBAC and policy-as-code applied at runtime.",
  },
];

export function ArchitectureLandscape() {
  const [active, setActive] = useState<string>("agents");
  const manualRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start 0.75", "end 0.35"],
  });

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
                  onMouseEnter={() => takeOver(layer.id)}
                  onFocus={() => takeOver(layer.id)}
                  onClick={() => takeOver(layer.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-150",
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
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">What this layer guarantees</p>
            <h3 className="h-card mt-3 font-display text-xl">{current.label}</h3>
            <p className="mt-3 max-w-lg leading-relaxed">{current.guarantee}</p>
            <p className="mono-label mt-4 border-t border-line pt-4 uppercase text-muted">
              {current.technical}
            </p>
          </motion.div>
        </AnimatePresence>
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
