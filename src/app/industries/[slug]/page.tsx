import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { DetailLayout, IncludesCard } from "@/components/layout/DetailLayout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ComplianceStamp } from "@/components/scenes/ComplianceStamp";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getIndustry, industries } from "@/data/industries";
import { caseStudies } from "@/data/case-studies";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return buildMetadata({
    title: `AI for ${industry.title}`,
    description: industry.summary,
    path: `/industries/${industry.slug}`,
  });
}

/**
 * Industry compliance posture — honest readiness labels, never certificates.
 * Regulated sectors name their frameworks; all others get the GDPR baseline.
 */
const complianceByIndustry: Record<string, Array<{ label: string; status: string }>> = {
  "financial-services": [
    { label: "SOC 2 controls", status: "Mapped · In progress" },
    { label: "Financial data handling", status: "Reviewed" },
    { label: "GDPR", status: "Ready" },
  ],
  healthcare: [
    { label: "HIPAA-aware delivery", status: "In progress" },
    { label: "PHI redaction pipeline", status: "Ready" },
    { label: "GDPR", status: "Ready" },
  ],
  government: [
    { label: "Sovereign deployment", status: "Available" },
    { label: "Audit-trail retention", status: "Ready" },
    { label: "GDPR", status: "Ready" },
  ],
};

const defaultCompliance = [
  { label: "SOC 2 controls", status: "Mapped · In progress" },
  { label: "GDPR", status: "Ready" },
];

const nav = [
  { href: "#challenges", label: "Challenges" },
  { href: "#usecases", label: "Use cases" },
  { href: "#kpis", label: "KPIs" },
];

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const relatedStudies = caseStudies.filter((c) =>
    industry.caseStudySlugs.includes(c.slug),
  );
  const compliance = complianceByIndustry[industry.slug] ?? defaultCompliance;

  return (
    <>
      <PageHero
        eyebrow={`Industry — ${industry.title}`}
        title={`AI engineering for ${industry.title.toLowerCase()}.`}
        lead={industry.summary}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
          { name: industry.title, path: `/industries/${industry.slug}` },
        ]}
        actions={
          <Button href="/start-a-project">Discuss Your Sector</Button>
        }
      />

      <section className="section-y">
        <DetailLayout
          nav={nav}
          sidebar={
            <>
              <div className="card-surface p-6">
                <p className="eyebrow">Compliance in this sector</p>
                <ul className="mt-4 space-y-2.5">
                  {compliance.map((item) => (
                    <li key={item.label}>
                      <ComplianceStamp label={item.label} status={item.status} />
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-line pt-4 text-[11px] leading-relaxed text-faint">
                  Readiness labels, not certificates. Full posture in{" "}
                  <a href="/security" className="underline underline-offset-4 hover:text-ink">
                    security
                  </a>
                  .
                </p>
              </div>
              <IncludesCard
                title="Estimate for this sector"
                items={[
                  "Industry benchmark preset applied",
                  "Refine with your own headcount",
                  "Methodology fully documented",
                ]}
                action={
                  <Button
                    href={`/roi-calculator?industry=${industry.slug}`}
                    variant="quiet"
                  >
                    Open pre-set calculator
                  </Button>
                }
              />
              {relatedStudies.length > 0 && (
                <div className="card-surface p-6">
                  <p className="eyebrow">Related architecture</p>
                  <ul className="mt-4 space-y-2">
                    {relatedStudies.map((study) => (
                      <li key={study.slug}>
                        <Link
                          href={`/work/${study.slug}`}
                          className="text-sm text-accent-strong underline-offset-4 hover:underline"
                        >
                          {study.title} (example) →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          }
        >
          <div className="space-y-16">
            <section id="challenges" className="scroll-mt-28">
              <div className="grid gap-10 md:grid-cols-2">
                <Reveal>
                  <h2 className="mono-label uppercase text-warn">Sector challenges</h2>
                  <ul className="mt-5 space-y-3">
                    {industry.challenges.map((challenge) => (
                      <li key={challenge} className="flex gap-3 leading-relaxed text-muted">
                        <span aria-hidden="true" className="text-warn">—</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={0.08}>
                  <h2 className="mono-label uppercase text-ok">AI opportunities</h2>
                  <ul className="mt-5 space-y-3">
                    {industry.opportunities.map((opportunity) => (
                      <li key={opportunity} className="flex gap-3 leading-relaxed text-muted">
                        <span aria-hidden="true" className="text-ok">→</span>
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>

            <section id="usecases" className="scroll-mt-28">
              <SectionHeader eyebrow="Use cases" title="Where AI earns its keep here." />
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {industry.useCases.map((useCase, i) => (
                  <Reveal key={useCase.title} delay={i * 0.06}>
                    <div className="card-surface h-full p-6">
                      <h3 className="h-card">{useCase.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {useCase.description}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal className="mt-8">
                <div className="card-surface p-6 md:p-7">
                  <h3 className="mono-label uppercase text-faint">
                    Architecture considerations in this sector
                  </h3>
                  <ul className="mt-4 grid gap-3 md:grid-cols-3">
                    {industry.architectureNotes.map((note) => (
                      <li key={note} className="text-sm leading-relaxed text-muted">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </section>

            <section id="kpis" className="scroll-mt-28">
              <SectionHeader
                eyebrow="KPIs to track"
                title="The metrics that prove it worked."
                lead="These are the measures we baseline and instrument — not results we claim."
              />
              <ul className="mt-8 flex flex-wrap gap-2">
                {industry.kpis.map((kpi) => (
                  <li key={kpi} className="mono-label rounded border border-accent/30 bg-accent/10 px-3 py-1.5 text-accent-strong">
                    {kpi}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </DetailLayout>
      </section>

      <CtaSection />
    </>
  );
}
