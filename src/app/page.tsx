import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhatWeSolve } from "@/components/home/WhatWeSolve";
import { OpportunityFinder } from "@/components/home/OpportunityFinder";
import { ArchitectureDiagram } from "@/components/architecture/ArchitectureDiagram";
import { AgentWorkflow } from "@/components/home/AgentWorkflow";
import { IndustriesGrid } from "@/components/home/IndustriesGrid";
import { CaseStudiesPreview } from "@/components/home/CaseStudiesPreview";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { SecurityGovernance } from "@/components/home/SecurityGovernance";
import { TechnologyMap } from "@/components/home/TechnologyMap";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { ROICalculator } from "@/components/calculators/ROICalculator";
import { CtaSection } from "@/components/layout/CtaSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/data/services";
import { engineeringPrinciples } from "@/data/architecture";
import { insights, readingTimeMinutes } from "@/data/insights";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Engineering & Automation for the Enterprise",
  description:
    "We design, engineer and operate intelligent automation systems that connect your people, software, data and workflows — from first architecture to production.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      {/* 01 · HERO */}
      <Hero />

      {/* 02 · TRUST / CREDIBILITY */}
      <TrustStrip />

      {/* 03 · WHAT WE SOLVE */}
      <WhatWeSolve />

      {/* 04 · AI OPPORTUNITY FINDER */}
      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="finder-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="AI opportunity finder"
            title="What are you trying to improve?"
            lead="Pick a goal and see the system we would engineer for it — architecture included, buzzwords excluded."
            id="finder-heading"
          />
          <div className="mt-12">
            <OpportunityFinder />
          </div>
        </div>
      </section>

      {/* 05 · AI SYSTEM ARCHITECTURE */}
      <section className="section-y" aria-labelledby="arch-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="System architecture"
            title="We don't just add AI. We engineer the system around it."
            lead="Models change monthly. A well-architected system keeps working regardless. Select any layer to see why it exists."
            id="arch-heading"
          />
          <div className="mt-12">
            <ArchitectureDiagram />
          </div>
        </div>
      </section>

      {/* 06 · SERVICES / CAPABILITIES */}
      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="services-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="Capabilities"
            title="Seven services, one accountable team."
            lead="Engage us for a single deliverable or the full lifecycle — the same engineers stay accountable throughout."
            id="services-heading"
          />
          <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <li key={service.slug}>
                <Reveal delay={(i % 4) * 0.04} className="h-full">
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex h-full flex-col bg-canvas p-5 transition-colors hover:bg-surface2"
                  >
                    <span className="mono-label text-accent-strong">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-medium leading-snug">{service.title}</h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">
                      {service.summary}
                    </p>
                  </Link>
                </Reveal>
              </li>
            ))}
            <li className="flex items-center justify-center bg-canvas p-5">
              <Link href="/services" className="mono-label uppercase text-accent-strong hover:underline">
                All services →
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* 07 · HOW AI AGENTS WORK */}
      <AgentWorkflow />

      {/* 08 · INDUSTRIES */}
      <IndustriesGrid compact />

      {/* 09 · CASE STUDIES */}
      <CaseStudiesPreview />

      {/* 10 · BEFORE → AFTER */}
      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="beforeafter-heading">
        <div className="container-x max-w-4xl">
          <SectionHeader
            eyebrow="Before → After"
            title="What actually changes."
            lead="A typical process transformation we engineer — compare the states directly."
            id="beforeafter-heading"
          />
          <div className="mt-10">
            <BeforeAfter />
          </div>
        </div>
      </section>

      {/* 11 · SECURITY + GOVERNANCE */}
      <SecurityGovernance />

      {/* 12 · TECHNOLOGY ECOSYSTEM */}
      <TechnologyMap />

      {/* 13 · DELIVERY PROCESS */}
      <ProcessTimeline />

      {/* 14 · AI READINESS TEASER */}
      <section className="border-t border-line" aria-labelledby="readiness-heading">
        <div className="container-x py-14 lg:py-20">
          <Reveal className="card-surface grid gap-8 p-8 md:p-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-3">AI readiness</p>
              <h2 id="readiness-heading" className="text-2xl font-bold tracking-tight md:text-3xl">
                Know where you stand before you spend.
              </h2>
              <p className="mt-4 max-w-xl text-muted">
                Our ten-question assessment scores your process, data,
                infrastructure, opportunity and governance readiness — then
                recommends the next step worth taking.
              </p>
            </div>
            <div className="lg:col-span-5">
              <dl className="mb-6 space-y-2 font-mono text-sm">
                {[
                  ["Process readiness", "—"],
                  ["Data readiness", "—"],
                  ["Infrastructure", "—"],
                  ["Governance", "—"],
                ].map(([label]) => (
                  <div key={label} className="flex items-center justify-between border-b border-line pb-2">
                    <dt>{label}</dt>
                    <dd className="text-faint">awaiting input</dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/ai-readiness"
                className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
              >
                Get My AI Readiness Score
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 15 · ROI CALCULATOR */}
      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="roi-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="ROI calculator"
            title="Estimate what manual work really costs you."
            lead="Built on your numbers — not our marketing. Every output is labelled an estimate because it is one."
            id="roi-heading"
          />
          <div className="mt-12">
            <ROICalculator />
          </div>
        </div>
      </section>

      {/* 16 · ENGINEERING PRINCIPLES (evidence-based trust) */}
      <section className="section-y border-t border-line" aria-labelledby="principles-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="How we think"
            title="Principles we can be held to."
            id="principles-heading"
          />
          <ol className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {engineeringPrinciples.map((principle, i) => (
              <li key={principle.title} className="flex gap-5">
                <span className="font-mono text-sm text-accent-strong">
                  {String(i + 1).padStart(2, "0")} —
                </span>
                <div>
                  <h3 className="font-semibold">{principle.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {principle.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 17 · INSIGHTS */}
      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="insights-heading">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              eyebrow="Insights"
              title="Engineering notes, not thought leadership."
              id="insights-heading"
            />
            <Link href="/insights" className="mono-label uppercase text-accent-strong hover:underline">
              All insights →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {insights.slice(0, 3).map((insight) => (
              <Reveal key={insight.slug}>
                <Link
                  href={`/insights/${insight.slug}`}
                  className="card-surface group flex h-full flex-col p-6 transition-colors hover:border-accent/40"
                >
                  <p className="mono-label uppercase text-faint">{insight.category}</p>
                  <h3 className="h-card mt-3">{insight.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {insight.excerpt}
                  </p>
                  <p className="mono-label mt-5 text-faint">
                    {readingTimeMinutes(insight)} min read
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 18 · FINAL CTA */}
      <CtaSection />
    </>
  );
}
