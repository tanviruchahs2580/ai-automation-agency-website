import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/ui/Accordion";
import { GridLines } from "@/components/ui/GridLines";
import { breadcrumbJsonLd } from "@/lib/seo";
import { Reveal } from "@/components/ui/Reveal";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  lead: string;
  breadcrumbs: Array<{ name: string; path: string }>;
  actions?: ReactNode;
}

/**
 * PageHero v3 — one label row (breadcrumb trail whose final crumb carries
 * the eyebrow when it duplicates it), compact vertical rhythm so content
 * starts inside the first viewport, aurora bleed + a deterministic schematic
 * strip keyed by the eyebrow. Copy and breadcrumb semantics untouched.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  actions,
}: PageHeroProps) {
  const last = breadcrumbs[breadcrumbs.length - 1];
  // Kill the "HOME / WORK + eyebrow WORK" duplication: when the eyebrow
  // already contains the final crumb, the crumb carries it.
  const eyebrowCovered =
    last != null &&
    eyebrow.toLowerCase().includes(last.name.toLowerCase());
  const seed = [...eyebrow].reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <section className="relative overflow-hidden border-b border-line">
      <GridLines opacity={0.5} />
      <div
        className="aurora-bleed pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div className="container-x relative pb-10 pt-10 md:pb-14 md:pt-14">
        <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="mono-label flex flex-wrap items-center gap-2 uppercase text-faint">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li key={crumb.path} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {isLast ? (
                    <span aria-current="page" className="text-muted">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link href={crumb.path} className="hover:text-ink">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              );
            })}
            {!eyebrowCovered && (
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="text-accent-bright">
                  ·
                </span>
                <span className="text-accent-bright">{eyebrow}</span>
              </li>
            )}
          </ol>
        </nav>
        <Reveal>
          <SchematicStrip seed={seed} />
          <h1 className="h-display mt-5 max-w-4xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {lead}
          </p>
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </Reveal>
      </div>
    </section>
  );
}

/** Deterministic thin schematic motif — decorative, derived from the label. */
function SchematicStrip({ seed }: { seed: number }) {
  const nodes = [0, 1, 2, 3, 4].map((i) => ({
    x: 8 + i * 46 + ((seed >> (i * 2)) % 12),
    live: (seed + i) % 3 === 0,
  }));
  return (
    <svg
      width="240"
      height="20"
      viewBox="0 0 240 20"
      fill="none"
      aria-hidden="true"
      className="opacity-80"
    >
      <path
        d={`M0 10 H240`}
        stroke="var(--color-line-strong)"
        strokeWidth="1"
      />
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={10}
            r={n.live ? 3.5 : 2.5}
            fill={n.live ? "var(--color-signal)" : "var(--color-surface2)"}
            stroke={
              n.live ? "var(--color-signal)" : "var(--color-line-strong)"
            }
            strokeWidth="1"
          />
          {n.live && (
            <circle
              cx={n.x}
              cy={10}
              r={6}
              stroke="var(--color-signal)"
              strokeWidth="1"
              opacity="0.4"
            />
          )}
        </g>
      ))}
    </svg>
  );
}
