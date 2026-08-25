import Link from "next/link";
import { caseStudies } from "@/data/case-studies";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ExampleBadge } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";

export function CaseStudiesPreview() {
  return (
    <section className="section-y border-t border-line" aria-labelledby="work-heading">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Work & reference architectures"
            title="How we engineer, shown concretely."
            lead="Until verified client results can be published, we present reference architectures — honest engineering walkthroughs, clearly labelled as examples."
            id="work-heading"
          />
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {caseStudies.map((study, i) => (
            <Reveal key={study.slug} delay={i * 0.06}>
              <Link
                href={`/work/${study.slug}`}
                className="card-surface group flex h-full flex-col p-6 transition-colors hover:border-accent/40"
              >
                <ExampleBadge />
                <h3 className="h-card mt-4">{study.title}</h3>
                <p className="mono-label mt-2 text-faint">{study.industry}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {study.challenge.slice(0, 150)}…
                </p>
                <span className="mono-label mt-5 text-accent-strong opacity-80 group-hover:opacity-100">
                  Read the architecture →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
