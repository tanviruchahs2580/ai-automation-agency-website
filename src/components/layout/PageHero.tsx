import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/ui/JsonLd";
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
 * PageHero — shared inner-page header.
 *
 * Two structural fixes over the previous version:
 *
 *  1. The eyebrow is no longer appended as a pseudo-crumb inside the
 *     breadcrumb `<ol>`. It was rendered as another `<li>` of the same
 *     `flex-wrap` list whenever it did not literally contain the final crumb,
 *     which (a) made the *visible* breadcrumb disagree with the emitted
 *     `BreadcrumbList` structured data — Google's breadcrumb guidance requires
 *     the two to match — and (b) collided with long final crumbs. On
 *     `/insights/[slug]` the crumb itself was already truncated to 40
 *     characters, so the row overflowed and the article title was cut
 *     mid-word ("…reach productio"). The eyebrow now sits on its own line,
 *     where length cannot collide with anything.
 *  2. The schematic strip is gone. It was five circles on a rule, positioned
 *     exactly where users look for progress, and at narrow widths it read as a
 *     half-completed stepper. It is replaced by a scale motif: an instrument
 *     rule with tick marks and no state. Decorative, unambiguous, and closer to
 *     the "Operator's Console" identity than a row of dots pretending to be a
 *     control.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  actions,
}: PageHeroProps) {
  /*
    Suppressed when the eyebrow merely restates the final crumb. On the index
    pages the eyebrow is the section name and the crumb is that same name, so
    rendering both produced "…/ Work" followed immediately by "Work". An earlier
    version of this component avoided the duplication by folding the eyebrow into
    the breadcrumb list, which made the *visible* trail disagree with the emitted
    `BreadcrumbList` — this keeps them separate and simply omits the echo.

    A `"Section — qualifier"` eyebrow still renders, because the qualifier is the
    part worth reading ("Insight — Enterprise AI" under a long article title).
  */
  const last = breadcrumbs[breadcrumbs.length - 1]?.name.toLowerCase();
  const eyebrowHead = eyebrow.split("—")[0]?.trim().toLowerCase() ?? "";
  const echo = last !== undefined && eyebrowHead === last;

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
          </ol>
        </nav>
        <Reveal>
          <InstrumentRule />
          {!echo && <p className="eyebrow mt-5">{eyebrow}</p>}
          <h1 className="h-display mt-3 max-w-4xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {lead}
          </p>
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Scale motif: a rule with regular ticks, reading as a measurement scale rather
 * than a progress control. Purely decorative (`aria-hidden`, no state), and
 * fixed at 1px so it never competes with the heading below it.
 */
function InstrumentRule() {
  const ticks = Array.from({ length: 13 }, (_, i) => i * 20);
  return (
    <svg
      width="240"
      height="9"
      viewBox="0 0 240 9"
      fill="none"
      aria-hidden="true"
      className="text-line-strong"
    >
      <path d="M0 0.5 H240" stroke="currentColor" strokeWidth="1" />
      {ticks.map((x, i) => (
        <path
          key={x}
          d={`M${x + 0.5} 0.5 v${i % 4 === 0 ? 8 : 4}`}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
