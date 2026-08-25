"use client";

import { useState } from "react";
import { beforeAfterPairs } from "@/data/architecture";
import { cn } from "@/lib/utils";

export function BeforeAfter() {
  const [showAfter, setShowAfter] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setShowAfter(false)}
          aria-pressed={!showAfter}
          className={cn(
            "mono-label rounded border px-4 py-2 uppercase",
            !showAfter
              ? "border-warn/50 bg-warn/10 text-warn"
              : "border-line text-muted hover:text-ink",
          )}
        >
          Before
        </button>
        <span aria-hidden="true" className="text-faint">→</span>
        <button
          type="button"
          onClick={() => setShowAfter(true)}
          aria-pressed={showAfter}
          className={cn(
            "mono-label rounded border px-4 py-2 uppercase",
            showAfter
              ? "border-ok/50 bg-ok/10 text-ok"
              : "border-line text-muted hover:text-ink",
          )}
        >
          After
        </button>
        <span className="ml-auto hidden text-xs text-faint sm:inline">
          Toggle to compare — or view both below
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Comparison of a manual process versus an engineered automated process
          </caption>
          <thead>
            <tr className="border-b border-line bg-surface">
              <th scope="col" className="mono-label px-5 py-3 uppercase text-muted">Area</th>
              <th scope="col" className="mono-label px-5 py-3 uppercase text-warn">Before</th>
              <th scope="col" className="mono-label px-5 py-3 uppercase text-ok">After</th>
            </tr>
          </thead>
          <tbody>
            {beforeAfterPairs.map((pair) => (
              <tr
                key={pair.area}
                className="border-b border-line last:border-0"
              >
                <th scope="row" className="px-5 py-3 font-medium">{pair.area}</th>
                <td
                  className={cn(
                    "px-5 py-3 transition-opacity duration-500",
                    showAfter ? "text-faint" : "text-warn/90",
                  )}
                >
                  {pair.before}
                </td>
                <td
                  className={cn(
                    "px-5 py-3 transition-opacity duration-500",
                    showAfter ? "text-ok" : "text-faint",
                  )}
                >
                  {pair.after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
