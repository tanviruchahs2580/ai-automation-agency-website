import Link from "next/link";
import { solutions } from "@/data/solutions";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Spotlight } from "@/components/ui/Spotlight";
import { Chip, chipFor } from "@/components/ui/Chip";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";

/**
 * WhatWeSolve — bento composition over the same solutions data + links.
 * First cell spans 2 cols with a larger surface; the rest fill the grid.
 * Copy, order, and destinations unchanged.
 */
export function WhatWeSolve() {
  const [feature, ...rest] = solutions;
  return (
    <section className="section-y" aria-labelledby="solve-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="What we solve"
          title="From business problem to production system."
          lead="One team across strategy, engineering, automation, data and operations — so accountability never falls between vendors."
          id="solve-heading"
          index="02"
        />

        <RevealStagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {feature && (
            <RevealStaggerItem className="md:col-span-2 lg:row-span-2">
              <BentoCell
                slug={feature.slug}
                title={feature.title}
                summary={feature.summary}
                feature
              />
            </RevealStaggerItem>
          )}
          {rest.map((solution) => (
            <RevealStaggerItem key={solution.slug}>
              <BentoCell
                slug={solution.slug}
                title={solution.title}
                summary={solution.summary}
              />
            </RevealStaggerItem>
          ))}
        </RevealStagger>

        <Reveal className="mt-12">
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-line bg-surface px-6 py-5 md:flex-row md:items-center">
            <p className="max-w-xl text-sm text-muted">
              Need engineering capacity rather than a packaged solution? Our{" "}
              <Link href="/services" className="text-accent-strong underline underline-offset-4 hover:text-ink">
                services
              </Link>{" "}
              cover strategy through operations — including embedded work with
              your own engineers.
            </p>
            <Link
              href="/services"
              className="mono-label shrink-0 uppercase text-accent-strong hover:underline"
            >
              View all services →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BentoCell({
  slug,
  title,
  summary,
  feature = false,
}: {
  slug: string;
  title: string;
  summary: string;
  feature?: boolean;
}) {
  const { icon, hue } = chipFor(slug);
  return (
    <Spotlight className="h-full">
      <Link
        href={`/solutions/${slug}`}
        className={`card-surface group flex h-full flex-col ${feature ? "p-8 md:p-10" : "p-6"}`}
      >
        <Chip icon={icon} hue={hue} />
        <h3 className={`mt-4 font-display font-semibold tracking-tight ${feature ? "text-2xl md:text-3xl" : "h-card"}`}>
          {title}
        </h3>
        <p
          className={`mt-3 flex-1 leading-relaxed text-muted ${feature ? "max-w-xl" : "text-sm"}`}
        >
          {summary}
        </p>
        <span className="mono-label mt-5 text-accent-strong">
          Explore solution{" "}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-150 group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </Link>
    </Spotlight>
  );
}
