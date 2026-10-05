"use client";

import { useMemo, useState } from "react";
import type { Insight } from "@/types/content";
import { InsightCard } from "@/components/ui/Card";
import { Spotlight } from "@/components/ui/Spotlight";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";
import { formatDate } from "@/lib/i18n";
import { readingTimeMinutes } from "@/data/insights";
import { cn } from "@/lib/utils";

/**
 * InsightsExplorer — the category chips are real, accessible filters
 * (buttons with aria-pressed + live result count), not decoration.
 * Filtering is client-side; the grid re-runs its stagger reveal per filter
 * change via a keyed remount.
 */
export function InsightsExplorer({
  insights,
  categories,
}: {
  insights: Insight[];
  categories: string[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const insight of insights) {
      map.set(insight.category, (map.get(insight.category) ?? 0) + 1);
    }
    return map;
  }, [insights]);

  const visible = active
    ? insights.filter((i) => i.category === active)
    : insights;

  return (
    <div>
      <div
        className="mb-10 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter articles by category"
      >
        <FilterChip
          label="All"
          count={insights.length}
          pressed={active === null}
          onClick={() => setActive(null)}
        />
        {categories.map((category) => (
          <FilterChip
            key={category}
            label={category}
            count={counts.get(category) ?? 0}
            pressed={active === category}
            onClick={() => setActive(active === category ? null : category)}
          />
        ))}
        <span className="sr-only" role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? "article" : "articles"} shown
        </span>
      </div>

      <RevealStagger
        key={active ?? "all"}
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((insight) => (
          <RevealStaggerItem key={insight.slug}>
            <Spotlight className="h-full">
              <InsightCard
                eyebrow={insight.category}
                title={insight.title}
                dek={insight.excerpt}
                byline={insight.author}
                readTime={`${formatDate(insight.publishedAt, "en-US", { year: "numeric", month: "short", day: "numeric" })} · ${readingTimeMinutes(insight)} min read`}
                href={`/insights/${insight.slug}`}
                patternSeed={insight.category}
                patternHue={
                  (["brass", "signal", "sky", "amber", "accent"] as const)[
                    [...insight.category].reduce((a, c) => a + c.charCodeAt(0), 0) % 5
                  ]
                }
              />
            </Spotlight>
          </RevealStaggerItem>
        ))}
      </RevealStagger>
    </div>
  );
}

function FilterChip({
  label,
  count,
  pressed,
  onClick,
}: {
  label: string;
  count: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "mono-label inline-flex min-h-11 items-center gap-2 rounded-full border px-4 transition-colors duration-150",
        pressed
          ? "border-accent bg-accent-glow text-accent-bright"
          : "border-line text-muted hover:border-line-strong hover:text-ink",
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] tabular",
          pressed ? "bg-accent/25 text-accent-bright" : "bg-surface2 text-faint",
        )}
      >
        {count}
      </span>
    </button>
  );
}
