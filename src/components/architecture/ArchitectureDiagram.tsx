"use client";

import { useState } from "react";
import { architectureNodes } from "@/data/architecture";
import { cn } from "@/lib/utils";

/**
 * Interactive architecture explorer. Fully keyboard operable; the selected
 * node's explanation is announced via aria-live. On small screens the node
 * list stacks above the detail panel.
 */
export function ArchitectureDiagram() {
  const [activeId, setActive] = useState(architectureNodes[0].id);
  const active = architectureNodes.find((n) => n.id === activeId)!;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5 xl:col-span-4">
        <ul className="flex flex-col gap-1.5" role="list">
          {architectureNodes.map((node, i) => {
            const isActive = node.id === activeId;
            return (
              <li key={node.id} className="relative">
                {i < architectureNodes.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[2.05rem] top-full h-1.5 w-px bg-[color:var(--color-line-strong)]"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setActive(node.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "border-accent bg-accent/10"
                      : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "mono-label flex h-6 w-6 shrink-0 items-center justify-center rounded border",
                      isActive
                        ? "border-accent text-accent-strong"
                        : "border-line text-faint",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{node.label}</span>
                    <span className="block text-xs text-muted">{node.role}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lg:col-span-7 xl:col-span-8">
        <div
          aria-live="polite"
          className="card-surface sticky top-24 p-6 md:p-8"
        >
          <p className="eyebrow mb-3">Layer detail</p>
          <h3 className="text-2xl font-bold tracking-tight">{active.label}</h3>
          <dl className="mt-6 space-y-6">
            <div>
              <dt className="mono-label uppercase text-accent-strong">
                Why it matters to the business
              </dt>
              <dd className="mt-2 leading-relaxed text-muted">{active.business}</dd>
            </div>
            <div>
              <dt className="mono-label uppercase text-muted">How we engineer it</dt>
              <dd className="mt-2 font-mono text-sm leading-relaxed text-muted">
                {active.technical}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
