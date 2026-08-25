"use client";

import Link from "next/link";
import { useState } from "react";
import { opportunities } from "@/data/opportunities";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function OpportunityFinder() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = opportunities.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5" role="group" aria-label="Choose a goal">
        <div className="flex flex-wrap gap-2">
          {opportunities.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={selectedId === o.id}
              onClick={() => {
                setSelectedId(o.id);
                track(AnalyticsEvent.OpportunitySelect, { opportunity: o.id });
              }}
              className={cn(
                "rounded-md border px-4 py-2.5 text-left text-sm transition-colors",
                selectedId === o.id
                  ? "border-accent bg-accent/15 text-accent-strong"
                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7" aria-live="polite">
        {selected ? (
          <div className="card-surface h-full p-6 md:p-8">
            <p className="mono-label uppercase text-faint">Recommended system</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight">
              {selected.recommendedSystem}
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              {selected.summary}
            </p>
            <ol className="mt-6 flex flex-wrap items-center gap-y-2" aria-label="System flow">
              {selected.flow.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-faint">
                      →
                    </span>
                  )}
                  <span
                    className={cn(
                      "mono-label rounded border px-2.5 py-1.5",
                      i === 0 || i === selected.flow.length - 1
                        ? "border-accent/40 bg-accent/10 text-accent-strong"
                        : "border-line bg-surface2 text-muted",
                    )}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/solutions/${selected.solutionSlug}`}
                className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
              >
                Explore this solution
              </Link>
              <Link
                href={`/services/${selected.serviceSlug}`}
                className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-5 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent-strong"
              >
                How we deliver it
              </Link>
            </div>
          </div>
        ) : (
          <div className="card-surface flex h-full flex-col justify-center p-6 md:p-8">
            <p className="mono-label uppercase text-faint">Recommended system</p>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              Select what you&apos;re trying to improve and we&apos;ll outline the
              system architecture we would engineer for it — honestly, including
              where AI isn&apos;t the right answer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
