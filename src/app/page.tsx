import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhatWeSolve } from "@/components/home/WhatWeSolve";
import { ServiceRows } from "@/components/home/ServiceRows";
import { MetricsPulse } from "@/components/scenes/MetricsPulse";
import { IndustriesGrid } from "@/components/home/IndustriesGrid";
import { CaseStudiesPreview } from "@/components/home/CaseStudiesPreview";
import { CtaSection } from "@/components/layout/CtaSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { ScrollDepthTracker } from "@/components/ui/ScrollDepthTracker";
import { buildMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";

export const metadata = buildMetadata({
  title: "AI Engineering & Automation for the Enterprise",
  description:
    "VANTIQ Systems engineers the autonomous operations layer for enterprises that cannot afford guesswork — from first architecture to production.",
  path: "/",
});

/**
 * Illustrative ranges stay static text: count-up on a range endpoint would
 * misrepresent the number (honesty wins over motion). The gauge bands carry
 * the visual momentum instead.
 */
const roiTeaserMetrics = [
  { value: "60–80%", label: "Manual triage reduction in 90 days", lo: 60, hi: 80 },
  { value: "40–60%", label: "Incident MTTR cut within one quarter", lo: 40, hi: 60 },
  { value: "3–6×", label: "Typical first-year return on automated hours", lo: 37, hi: 75 },
];

/** Below-the-fold scene — code-split per the performance budget (§10). */
const ArchitectureLandscape = dynamic(
  () =>
    import("@/components/scenes/ArchitectureLandscape").then(
      (mod) => mod.ArchitectureLandscape,
    ),
  {
    loading: () => (
      <div
        className="card-surface flex min-h-72 items-center justify-center p-12"
        aria-hidden="true"
      >
        <span className="signal-loader">
          <span />
          <span />
          <span />
        </span>
      </div>
    ),
  },
);

export default function HomePage() {
  return (
    <>
      <ScrollDepthTracker />

      {/* 01 · HERO — signature moment: HeroInstrument */}
      <Hero />

      {/* 02 · TRUST STRIP */}
      <TrustStrip />

      {/* 03 · WHAT WE SOLVE */}
      <WhatWeSolve />

      {/* 04 · ARCHITECTURE — signature moment: ArchitectureLandscape */}
      <section className="section-y" aria-labelledby="arch-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="System architecture"
            title="We don't just add AI. We engineer the system around it."
            lead="Models change monthly. A well-architected system keeps working regardless. Select any layer to see what it guarantees."
            id="arch-heading"
            index="03"
          />
          <div className="mt-12">
            <ArchitectureLandscape />
          </div>
        </div>
      </section>

      {/* 05 · SERVICES — interactive rows */}
      <ServiceRows />

      {/* 06 · INDUSTRIES */}
      <IndustriesGrid compact />

      {/* 07 · CASE STUDIES */}
      <CaseStudiesPreview />

      {/* 08 · ROI TEASER — gauge bands + live-pulsed estimate ranges */}
      <section
        className="section-y border-t border-line bg-surface/30"
        aria-labelledby="roi-heading"
      >
        <div className="container-x grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="ROI calculator"
              title="Estimate what manual work really costs you."
              lead="Built on your numbers — not our marketing. Every output is labelled an estimate because it is one."
              id="roi-heading"
              index="07"
            />
            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              {roiTeaserMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-line bg-canvas p-4"
                >
                  <dt className="text-xs leading-snug text-muted">
                    {metric.label}
                  </dt>
                  <dd className="font-display mt-1 text-2xl font-bold tracking-tight">
                    <MetricsPulse>{metric.value}</MetricsPulse>
                    <div
                      className="gauge-track mt-3"
                      role="img"
                      aria-label={`${metric.label}: illustrative band ${metric.value}`}
                    >
                      <div
                        className="gauge-band"
                        style={{ left: `${metric.lo}%`, width: `${metric.hi - metric.lo}%` }}
                      />
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mono-label mt-4 uppercase text-faint">
              Illustrative ranges — your estimate is computed from your inputs
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="card-surface grain p-8 text-center">
              <p className="eyebrow">Three inputs · One minute</p>
              <p className="mt-3 text-lg font-medium">
                Start with industry, team size, and hours lost to manual ops.
              </p>
              <div className="mt-6 inline-flex">
                <Magnetic>
                  <Button href="/roi-calculator" dataCtaId="home-roi-primary-a">
                    Calculate My Estimate
                  </Button>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 · FINAL CTA */}
      <CtaSection
        primaryCtaId="home-final-primary-a"
        secondaryCtaId="home-final-secondary-a"
      />
    </>
  );
}
