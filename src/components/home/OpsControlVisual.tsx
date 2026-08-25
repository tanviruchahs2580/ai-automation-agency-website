"use client";

import { useEffect, useState } from "react";
import { StatusDot } from "@/components/ui/Tag";

/**
 * Simulated operations panel — decorative telemetry only.
 * Permanently labelled "Interactive Simulation"; numbers are not company data.
 */

const agents = [
  { name: "Intake Agent", state: "RUNNING", tone: "ok" as const },
  { name: "Support Agent", state: "RUNNING", tone: "ok" as const },
  { name: "Finance Agent", state: "REVIEW", tone: "warn" as const },
  { name: "Research Agent", state: "RUNNING", tone: "ok" as const },
];

export function OpsControlVisual() {
  const [tasks, setTasks] = useState(1284);
  const [approvals, setApprovals] = useState(43);
  const [exceptions, setExceptions] = useState(8);
  const [rate, setRate] = useState(87);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setTasks((t) => t + Math.floor(Math.random() * 4));
      if (Math.random() > 0.75) setApprovals((a) => a + 1);
      if (Math.random() > 0.92) setExceptions((e) => e + 1);
      setRate(84 + Math.floor(Math.random() * 6));
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card-surface relative w-full overflow-hidden shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="mono-label uppercase text-muted">AI Operations Control</p>
        <span className="mono-label rounded border border-warn/40 bg-warn/10 px-2 py-0.5 text-warn">
          Interactive Simulation
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div className="space-y-3" aria-hidden="true">
          {[
            { label: "Incoming Work", accent: false },
            { label: "AI Router", accent: true },
            { label: "Agent Layer ×4", accent: false },
            { label: "Human Review", accent: false },
            { label: "Business Systems", accent: false },
          ].map((node, i) => (
            <div key={node.label}>
              {i > 0 && <div className="ml-5 h-3 w-px bg-[color:var(--color-line-strong)]" />}
              <div
                className={`flex items-center gap-3 rounded border px-3 py-2 ${
                  node.accent
                    ? "border-accent/50 bg-accent/10"
                    : "border-line bg-surface2"
                }`}
              >
                {node.accent ? (
                  <StatusDot tone="accent" />
                ) : (
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-faint opacity-60" />
                )}
                <span className="mono-label">{node.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <table className="w-full text-left">
            <caption className="sr-only">Simulated agent status</caption>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.name} className="border-b border-line last:border-0">
                  <td className="py-2 pr-2">
                    <span className="flex items-center gap-2 text-sm">
                      <StatusDot tone={agent.tone} />
                      {agent.name}
                    </span>
                  </td>
                  <td
                    className={`mono-label py-2 text-right ${
                      agent.state === "RUNNING" ? "text-ok" : "text-warn"
                    }`}
                  >
                    {agent.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded border border-line bg-surface2 p-3">
              <dt className="mono-label text-faint">TASKS PROCESSED</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums">
                {tasks.toLocaleString("en-US")}
              </dd>
            </div>
            <div className="rounded border border-line bg-surface2 p-3">
              <dt className="mono-label text-faint">HUMAN APPROVALS</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums">{approvals}</dd>
            </div>
            <div className="rounded border border-line bg-surface2 p-3">
              <dt className="mono-label text-faint">EXCEPTIONS</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums">{exceptions}</dd>
            </div>
            <div className="rounded border border-line bg-surface2 p-3">
              <dt className="mono-label text-faint">AUTOMATION RATE</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums">{rate}%</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] leading-snug text-faint">
            All figures simulated for illustration. No client data is shown.
          </p>
        </div>
      </div>
    </div>
  );
}
