import Link from "next/link";
import { solutions } from "@/data/solutions";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export function WhatWeSolve() {
  return (
    <section className="section-y" aria-labelledby="solve-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="What we solve"
          title="From business problem to production system."
          lead="One team across strategy, engineering, automation, data and operations — so accountability never falls between vendors."
          id="solve-heading"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, i) => (
            <Reveal key={solution.slug} delay={i * 0.05}>
              <Link
                href={`/solutions/${solution.slug}`}
                className="card-surface group flex h-full flex-col p-6 transition-colors hover:border-accent/40"
              >
                <h3 className="h-card">{solution.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {solution.summary}
                </p>
                <span className="mono-label mt-5 text-accent-strong opacity-80 transition-opacity group-hover:opacity-100">
                  Explore solution →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-line bg-surface px-6 py-5 md:flex-row md:items-center">
            <p className="max-w-xl text-sm text-muted">
              Need engineering capacity rather than a packaged solution? Our{" "}
              <Link href="/services" className="text-accent-strong underline-offset-4 hover:underline">
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


