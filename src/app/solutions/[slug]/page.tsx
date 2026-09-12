import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Accordion, JsonLd } from "@/components/ui/Accordion";
import { DetailLayout, IncludesCard } from "@/components/layout/DetailLayout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
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

const nav = [
  { href: "#problem", label: "Problem" },
  { href: "#architecture", label: "Architecture" },
  { href: "#workflow", label: "Workflow" },
  { href: "#details", label: "Details" },
  { href: "#faq", label: "FAQ" },
];

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
          <Button href="/start-a-project">Discuss This Solution</Button>
        }
      />

      <section className="section-y">
        <DetailLayout
          nav={nav}
          sidebar={
            <>
              <IncludesCard
                title="What this includes"
                items={[
                  `${solution.architecture.length}-layer reference architecture`,
                  `${solution.workflow.length}-step delivery workflow`,
                  `${solution.implementation.length}-phase implementation plan`,
                  "Security controls + technology choices",
                ]}
                action={
                  <div className="flex flex-col gap-2">
                    <Button href="/roi-calculator" variant="quiet">
                      Estimate ROI for this
                    </Button>
                    <Button href="/start-a-project" variant="link">
                      Scope it with us
                    </Button>
                  </div>
                }
              />
            </>
          }
        >
          <div className="space-y-16">
            <Reveal>
              <section id="problem" className="scroll-mt-28">
                <p className="eyebrow mb-3">The problem</p>
                <h2 className="h-section">{solution.problem}</h2>
                <p className="eyebrow mb-4 mt-8">Business impact</p>
                <ul className="space-y-3">
                  {solution.businessImpact.map((impact) => (
                    <li key={impact} className="flex gap-3 text-muted">
                      <span aria-hidden="true" className="mt-1 text-ok">✓</span>
                      <span className="leading-relaxed">{impact}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section id="architecture" className="scroll-mt-28">
                <p className="eyebrow mb-3">How we build it</p>
                <h2 className="h-section">Architecture before code.</h2>
                <h3 className="mono-label mt-8 uppercase text-faint">
                  Engineering approach
                </h3>
                <ol className="mt-4 space-y-3">
                  {solution.approach.map((item, i) => (
                    <li key={item} className="flex gap-4">
                      <span className="font-mono text-sm text-accent-bright">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-relaxed text-muted">{item}</span>
                    </li>
                  ))}
                </ol>
                <h3 className="mono-label mt-8 uppercase text-faint">
                  Reference architecture
                </h3>
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
              </section>
            </Reveal>

            <section id="workflow" className="scroll-mt-28">
              <SectionHeader
                eyebrow="Workflow"
                title="How work flows through the system."
              />
              <ol className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] md:grid-cols-2">
                {solution.workflow.map((step, i) => (
                  <li key={step.step} className="bg-canvas p-6">
                    <p className="mono-label text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mono-label mt-2 text-accent-strong">{step.step}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{step.detail}</p>
                  </li>
                ))}
              </ol>
            </section>

            <Reveal>
              <section id="details" className="scroll-mt-28">
                <div className="grid gap-8 md:grid-cols-3">
                  <div>
                    <h3 className="mono-label uppercase text-faint">Technology</h3>
                    <ul className="mt-4 space-y-2 font-mono text-sm text-muted">
                      {solution.technologies.map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mono-label uppercase text-faint">Security</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                      {solution.security.map((sec) => (
                        <li key={sec} className="flex gap-2">
                          <span aria-hidden="true" className="text-accent-strong">·</span>
                          {sec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mono-label uppercase text-faint">Implementation</h3>
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
                  </div>
                </div>
              </section>
            </Reveal>

            <section id="faq" className="scroll-mt-28">
              <SectionHeader eyebrow="FAQ" title="Common questions, answered directly." />
              <div className="mt-8">
                <Accordion items={solution.faq} />
              </div>
            </section>
          </div>
        </DetailLayout>
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
