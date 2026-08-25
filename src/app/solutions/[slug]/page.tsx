import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Accordion, JsonLd } from "@/components/ui/Accordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getSolution, solutions } from "@/data/solutions";
import { buildMetadata, faqJsonLd, serviceJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};
  return buildMetadata({
    title: solution.title,
    description: solution.summary,
    path: `/solutions/${solution.slug}`,
  });
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  return (
    <>
      <JsonLd data={serviceJsonLd({ name: solution.title, description: solution.summary, path: `/solutions/${solution.slug}` })} />
      <JsonLd data={faqJsonLd(solution.faq)} />

      <PageHero
        eyebrow={`Solution — ${solution.title}`}
        title={solution.title}
        lead={solution.summary}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
          { name: solution.title, path: `/solutions/${solution.slug}` },
        ]}
        actions={
          <Link
            href="/start-a-project"
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Discuss This Solution
          </Link>
        }
      />

      {/* Problem */}
      <section className="section-y" aria-labelledby="problem-heading">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-3">The problem</p>
            <h2 id="problem-heading" className="h-section">{solution.problem}</h2>
          </Reveal>
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4">Business impact</p>
            <ul className="space-y-3">
              {solution.businessImpact.map((impact) => (
                <li key={impact} className="flex gap-3 text-muted">
                  <span aria-hidden="true" className="mt-1 text-ok">✓</span>
                  <span className="leading-relaxed">{impact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Approach + Architecture */}
      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="architecture-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="How we build it"
            title="Architecture before code."
            id="architecture-heading"
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <Reveal>
              <h3 className="mono-label uppercase text-faint">Engineering approach</h3>
              <ol className="mt-4 space-y-3">
                {solution.approach.map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="font-mono text-sm text-accent-strong">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed text-muted">{item}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="mono-label uppercase text-faint">Reference architecture</h3>
              <ol className="mt-4 space-y-px overflow-hidden rounded-lg border border-line">
                {solution.architecture.map((layer, i) => (
                  <li key={layer} className="flex items-center gap-3 bg-surface px-4 py-3">
                    <span className="mono-label w-8 shrink-0 text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm">{layer}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="section-y" aria-labelledby="workflow-heading">
        <div className="container-x">
          <SectionHeader eyebrow="Workflow" title="How work flows through the system." id="workflow-heading" />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] md:grid-cols-2 lg:grid-cols-3">
            {solution.workflow.map((step) => (
              <li key={step.step} className="bg-canvas p-6">
                <p className="mono-label text-accent-strong">{step.step}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tech + Security + Implementation */}
      <section className="section-y border-t border-line bg-surface/30">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          <Reveal>
            <h3 className="mono-label uppercase text-faint">Technology</h3>
            <ul className="mt-4 space-y-2 font-mono text-sm text-muted">
              {solution.technologies.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.06}>
            <h3 className="mono-label uppercase text-faint">Security</h3>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              {solution.security.map((sec) => (
                <li key={sec} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent-strong">·</span>
                  {sec}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.12}>
            <h3 className="mono-label uppercase text-faint">Implementation phases</h3>
            <ol className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              {solution.implementation.map((phase, i) => (
                <li key={phase} className="flex gap-3">
                  <span className="font-mono text-xs text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {phase}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-y border-t border-line" aria-labelledby="faq-heading">
        <div className="container-x max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Common questions, answered directly." id="faq-heading" />
          <div className="mt-8">
            <Accordion items={solution.faq} />
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow="Next step"
        title="Build something similar."
        lead={`Tell us how ${solution.title.toLowerCase()} would fit your operation — we'll scope it with real constraints included.`}
        primaryLabel="Start a Project"
        secondaryLabel="Talk to an AI Engineer"
        secondaryHref="/approach"
      />
    </>
  );
}
