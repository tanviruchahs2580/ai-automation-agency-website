import Link from "next/link";
import { solutions } from "@/data/solutions";
import { caseStudies } from "@/data/case-studies";
import { insights, readingTimeMinutes } from "@/data/insights";
import { industries } from "@/data/industries";
import { services } from "@/data/services";
import { technologyCategories } from "@/data/technology";
import { disclaimers } from "@/data/disclaimers";
import { CapabilityCard, CaseStudyCard, InsightCard } from "@/components/ui/Card";
import { Spotlight } from "@/components/ui/Spotlight";
import { chipFor } from "@/components/ui/Chip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";
import { formatDate } from "@/lib/i18n";

/**
 * Homepage depth sections — the UI/UX elevation (2026-11-16).
 *
 * The owner brief: the site must read as a production-grade product, not a
 * demo. The audit (docs/audit/UI-UX-ELEVATION-PLAN.md) found the homepage
 * carrying only four sections; these components add the proof, depth and
 * capability breadth a production agency homepage carries.
 *
 * Feature contracts: every section reads existing data records and links to
 * existing routes — nothing is invented, nothing is removed. All counts in the
 * proof band are computed from the data arrays at render time, so they are
 * true by construction and cannot drift from the content they count. Server
 * components throughout; the only client code is the Reveal/Spotlight
 * primitives already in the shared bundle.
 */

/* ------------------------------------------------------------------ */
/* Proof band — inventory stats computed from the data layer.           */
/* ------------------------------------------------------------------ */

const proofStats = [
  { label: "Services", href: "/services", value: services.length },
  { label: "Solutions", href: "/solutions", value: solutions.length },
  { label: "Industries", href: "/industries", value: industries.length },
  {
    label: "Reference architectures",
    href: "/work",
    value: caseStudies.length,
  },
  { label: "Insight articles", href: "/insights", value: insights.length },
];

export function ProofBand() {
  return (
    <section className="border-b border-line" aria-label="What we cover">
      <div className="container-x py-10">
        <dl className="stat-band grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {proofStats.map((stat) => (
            <div key={stat.label}>
              <dt className="mono-label uppercase text-faint">{stat.label}</dt>
              <dd className="mt-1.5">
                <Link
                  href={stat.href}
                  className="tabular inline-flex items-baseline gap-2 font-display text-3xl font-semibold tracking-tight text-ink transition-colors hover:text-accent-bright md:text-4xl"
                >
                  {stat.value}
                  <span
                    aria-hidden="true"
                    className="text-base text-faint transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Solutions bento — asymmetric grid, first solution featured.          */
/* ------------------------------------------------------------------ */

export function SolutionsBento() {
  const featured = solutions[0];
  const rest = solutions.slice(1, 6);

  return (
    <section className="section-y" aria-labelledby="home-solutions-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="Solutions"
          title="Complete systems, engineered end to end."
          lead="Not pilots or proof-of-concepts — each solution is an architecture we design, build and operate."
          id="home-solutions-heading"
          index="01"
        />
        <RevealStagger className="bento mt-12">
          <RevealStaggerItem className="bento-feature">
            <Spotlight className="h-full">
              <CapabilityCard
                eyebrow="Solution"
                index="01"
                icon={chipFor(featured.slug).icon}
                hue={chipFor(featured.slug).hue}
                title={featured.title}
                description={featured.summary}
                meta={featured.meta}
                href={`/solutions/${featured.slug}`}
              />
            </Spotlight>
          </RevealStaggerItem>
          {rest.map((solution, i) => {
            const { icon, hue } = chipFor(solution.slug, i);
            return (
              <RevealStaggerItem key={solution.slug}>
                <Spotlight className="h-full">
                  <CapabilityCard
                    eyebrow="Solution"
                    index={String(i + 2).padStart(2, "0")}
                    icon={icon}
                    hue={hue}
                    title={solution.title}
                    description={solution.summary}
                    meta={solution.meta}
                    href={`/solutions/${solution.slug}`}
                  />
                </Spotlight>
              </RevealStaggerItem>
            );
          })}
        </RevealStagger>
        <Reveal className="mt-8">
          <Link
            href="/solutions"
            className="btn btn-link"
            data-cta-id="home-solutions-all"
          >
            All solutions <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reference architectures — three example case studies.                */
/* ------------------------------------------------------------------ */

export function CaseStudiesPreview() {
  const featured = caseStudies.slice(0, 3);

  return (
    <section
      className="section-y section-alt"
      aria-labelledby="home-work-heading"
    >
      <div className="container-x">
        <SectionHeader
          eyebrow="Reference architectures"
          title="How we engineer a problem class."
          lead="Worked examples, not client claims — each one shows the architecture we would build, layer by layer."
          id="home-work-heading"
          index="02"
        />
        <RevealStagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((study) => (
            <RevealStaggerItem key={study.slug}>
              <Spotlight className="h-full">
                <CaseStudyCard
                  eyebrow={disclaimers.exampleArchitectureLabel}
                  industry={study.industry}
                  title={study.title}
                  before={study.before[0] ?? "Manual process"}
                  after={study.after[0] ?? "Engineered system"}
                  layers={study.architecture}
                  meta={`${study.architecture.length} layers · ${study.security.length} controls`}
                  href={`/work/${study.slug}`}
                />
              </Spotlight>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
        <Reveal className="mt-8">
          <Link
            href="/work"
            className="btn btn-link"
            data-cta-id="home-work-all"
          >
            All reference architectures{" "}
            <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Insights preview — the three most recent articles.                   */
/* ------------------------------------------------------------------ */

const latestInsights = [...insights]
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  .slice(0, 3);

function hueForCategory(category: string) {
  const hues = ["brass", "signal", "sky", "amber", "accent"] as const;
  const index =
    [...category].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    hues.length;
  return hues[index] ?? "brass";
}

export function InsightsPreview() {
  return (
    <section className="section-y" aria-labelledby="home-insights-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="Insights"
          title="Notes from inside the engineering."
          lead="What we learn building production AI systems — including what breaks."
          id="home-insights-heading"
          index="03"
        />
        <RevealStagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {latestInsights.map((insight) => (
            <RevealStaggerItem key={insight.slug}>
              <Spotlight className="h-full">
                <InsightCard
                  eyebrow={insight.category}
                  title={insight.title}
                  dek={insight.excerpt}
                  byline={insight.author}
                  readTime={`${formatDate(insight.publishedAt, "en-US", { year: "numeric", month: "short", day: "numeric" })} · ${readingTimeMinutes(insight)} min read`}
                  href={`/insights/${insight.slug}`}
                  categoryHue={hueForCategory(insight.category)}
                />
              </Spotlight>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
        <Reveal className="mt-8">
          <Link
            href="/insights"
            className="btn btn-link"
            data-cta-id="home-insights-all"
          >
            All insights <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Technology marquee — capability breadth, edge-masked loop.           */
/* ------------------------------------------------------------------ */

const marqueeNames = technologyCategories.flatMap((category) =>
  category.items.map((item) => item.name),
);

function MarqueeTrack({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="marquee-track gap-10 pe-10"
      aria-hidden={hidden ? "true" : undefined}
    >
      {marqueeNames.map((name) => (
        <span
          key={name}
          className="mono-label flex items-center gap-10 whitespace-nowrap uppercase text-faint"
        >
          {name}
          <span aria-hidden="true" className="text-accent">
            ·
          </span>
        </span>
      ))}
    </div>
  );
}

export function TechnologyMarquee() {
  return (
    <section
      className="section-y section-alt"
      aria-labelledby="home-tech-heading"
    >
      <div className="container-x">
        <SectionHeader
          eyebrow="Technology ecosystem"
          title="Model-agnostic. Architecture-first."
          lead="We select the stack per task through our routing gateway — never hard-wired to a vendor."
          id="home-tech-heading"
          index="04"
        />
        <Reveal className="mt-10">
          {/*
            Two tracks for the seamless -50% loop; the duplicate is aria-hidden
            so assistive tech reads the capability list exactly once.
          */}
          <div className="marquee">
            <MarqueeTrack />
            <MarqueeTrack hidden />
          </div>
        </Reveal>
        <Reveal className="mt-8">
          <Link
            href="/technology"
            className="btn btn-link"
            data-cta-id="home-tech-all"
          >
            Explore the technology{" "}
            <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
