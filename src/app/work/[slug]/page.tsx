import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { ExampleBadge } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { caseStudies, getCaseStudy } from "@/data/case-studies";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return buildMetadata({
    title: `${study.title} — Reference Architecture`,
    description: study.challenge.slice(0, 155),
    path: `/work/${study.slug}`,
  });
}

function Block({
  heading,
  items,
  mono,
}: {
  heading: string;
  items: string[];
  mono?: boolean;
}) {
  return (
    <Reveal>
      <section>
        <h2 className="mono-label uppercase text-faint">{heading}</h2>
        <ul className="mt-4 space-y-2.5">
          {items.map((item) => (
            <li
              key={item}
              className={
                mono
                  ? "font-mono text-sm leading-relaxed text-muted"
                  : "flex gap-3 text-sm leading-relaxed text-muted"
              }
            >
              {!mono && <span aria-hidden="true" className="text-accent-strong">·</span>}
              {item}
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <>
      <PageHero
        eyebrow={`Work — ${study.industry}`}
        title={study.title}
        lead={study.challenge}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: study.title, path: `/work/${study.slug}` },
        ]}
        actions={<ExampleBadge />}
      />

      <article className="container-x section-y max-w-5xl">
        <div className="grid gap-x-14 gap-y-14 md:grid-cols-2">
          <Block heading="Before" items={study.before} />
          <Block heading="After" items={study.after} />
        </div>

        <div className="divider-top mt-16 pt-16">
          <Block heading="Intervention" items={study.intervention} />
        </div>

        <div className="divider-top mt-16 pt-16">
          <Reveal>
            <section>
              <h2 className="mono-label uppercase text-faint">System architecture</h2>
              <ol className="mt-4 space-y-px overflow-hidden rounded-lg border border-line">
                {study.architecture.map((layer, i) => (
                  <li key={layer} className="flex items-center gap-4 bg-surface px-5 py-3.5">
                    <span className="mono-label w-8 shrink-0 text-accent-strong">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm">{layer}</span>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>
        </div>

        <div className="divider-top mt-16 grid gap-x-14 gap-y-14 pt-16 md:grid-cols-2">
          <Block heading="Technology" items={study.technology} mono />
          <Block heading="Security controls" items={study.security} />
        </div>

        <div className="divider-top mt-16 pt-16">
          <Block heading="Monitoring & evaluation" items={study.monitoring} />
        </div>

        <div className="divider-top mt-16 rounded-lg border border-accent/30 bg-accent/5 p-6 pt-6">
          <p className="text-sm leading-relaxed text-muted">
            <strong className="text-ink">Honesty note:</strong> this is an example
            architecture demonstrating our engineering method. Outcome metrics are
            deliberately omitted — published results will only ever come from
            verifiable engagements.
          </p>
        </div>
      </article>

      <CtaSection
        eyebrow="Next step"
        title="Build something similar."
        primaryLabel="Start a Project"
        secondaryHref="/technology"
        secondaryLabel="See Our Technology Approach"
      />
    </>
  );
}
