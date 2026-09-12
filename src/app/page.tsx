import Link from "next/link";
import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhatWeSolve } from "@/components/home/WhatWeSolve";
import { MetricsPulse } from "@/components/scenes/MetricsPulse";
import { IndustriesGrid } from "@/components/home/IndustriesGrid";
import { CaseStudiesPreview } from "@/components/home/CaseStudiesPreview";
import { CtaSection } from "@/components/layout/CtaSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CapabilityCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";
import { ScrollDepthTracker } from "@/components/ui/ScrollDepthTracker";
import { services } from "@/data/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Engineering & Automation for the Enterprise",
  description:
    "VANTIQ Systems engineers the autonomous operations layer for enterprises that cannot afford guesswork — from first architecture to production.",
  path: "/",
});

const roiTeaserMetrics = [
  { value: "60–80%", label: "Manual triage reduction in 90 days" },
  { value: "40–60%", label: "Incident MTTR cut within one quarter" },
  { value: "3–6×", label: "Typical first-year return on automated hours" },
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
          />
          <div className="mt-12">
            <ArchitectureLandscape />
          </div>
        </div>
      </section>

      {/* 05 · SERVICES / CAPABILITIES */}
      <section
        className="section-y border-t border-line bg-surface/30"
        aria-labelledby="services-heading"
      >
        <div className="container-x">
          <SectionHeader
            eyebrow="Capabilities"
            title="Seven services, one accountable team."
            lead="Engage us for a single deliverable or the full lifecycle — the same engineers stay accountable throughout."
            id="services-heading"
          />
          <RevealStagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <RevealStaggerItem key={service.slug}>
                <CapabilityCard
                  eyebrow="Service"
                  index={String(i + 1).padStart(2, "0")}
                  title={service.title}
                  description={service.summary}
                  meta="Fixed scope · Senior engineers"
                  href={`/services/${service.slug}`}
                />
              </RevealStaggerItem>
            ))}
            <RevealStaggerItem>
              <Link
                href="/services"
                className="card-surface group flex h-full min-h-44 flex-col justify-center p-6"
              >
                <span className="eyebrow">Overview</span>
                <span className="h-card mt-3">
                  Compare all seven services
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block font-mono transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </RevealStaggerItem>
          </RevealStagger>
        </div>
      </section>

      {/* 06 · INDUSTRIES */}
      <IndustriesGrid compact />

      {/* 07 · CASE STUDIES */}
      <CaseStudiesPreview />

      {/* 08 · ROI TEASER — signature moment: live-pulsed estimate ranges */}
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
            />
            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              {roiTeaserMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-line bg-canvas p-4"
                >
                  <dd className="font-display text-2xl font-bold tracking-tight">
                    <MetricsPulse>{metric.value}</MetricsPulse>
                  </dd>
                  <dt className="mt-1 text-xs leading-snug text-muted">
                    {metric.label}
                  </dt>
                </div>
              ))}
            </dl>
            <p className="mono-label mt-4 uppercase text-faint">
              Illustrative ranges — your estimate is computed from your inputs
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="card-surface p-8 text-center">
              <p className="eyebrow">Three inputs · One minute</p>
              <p className="mt-3 text-lg font-medium">
                Start with industry, team size, and hours lost to manual ops.
              </p>
              <div className="mt-6">
                <Button href="/roi-calculator" dataCtaId="home-roi-primary-a">
                  Calculate My Estimate
                </Button>
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
