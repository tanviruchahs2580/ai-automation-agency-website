import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
          <Link
            href="/start-a-project"
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Discuss Your Sector
          </Link>
        }
      />

      <section className="section-y" aria-labelledby="challenges-heading">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 id="challenges-heading" className="mono-label uppercase text-warn">
              Sector challenges
            </h2>
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

      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="usecases-heading">
        <div className="container-x">
          <SectionHeader eyebrow="Use cases" title="Where AI earns its keep here." id="usecases-heading" />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
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

          <Reveal className="mt-10">
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
        </div>
      </section>

      <section className="section-y border-t border-line" aria-labelledby="kpis-heading">
        <div className="container-x max-w-3xl">
          <SectionHeader
            eyebrow="KPIs to track"
            title="The metrics that prove it worked."
            lead="These are the measures we baseline and instrument — not results we claim."
            id="kpis-heading"
          />
          <ul className="mt-8 flex flex-wrap gap-2">
            {industry.kpis.map((kpi) => (
              <li key={kpi} className="mono-label rounded border border-accent/30 bg-accent/10 px-3 py-1.5 text-accent-strong">
                {kpi}
              </li>
            ))}
          </ul>

          {relatedStudies.length > 0 && (
            <div className="mt-12">
              <p className="mono-label uppercase text-faint">Related architecture</p>
              <ul className="mt-4 space-y-2">
                {relatedStudies.map((study) => (
                  <li key={study.slug}>
                    <Link
                      href={`/work/${study.slug}`}
                      className="text-sm text-accent-strong underline-offset-4 hover:underline"
                    >
                      {study.title} (example architecture) →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
