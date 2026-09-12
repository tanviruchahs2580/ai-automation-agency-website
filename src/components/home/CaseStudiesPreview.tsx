import { caseStudies } from "@/data/case-studies";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CaseStudyCard } from "@/components/ui/Card";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";

export function CaseStudiesPreview() {
  return (
    <section className="section-y border-t border-line" aria-labelledby="work-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="Work & reference architectures"
          title="How we engineer, shown concretely."
          lead="Until verified client results can be published, we present reference architectures — honest engineering walkthroughs, clearly labelled as examples."
          id="work-heading"
        />

        <RevealStagger className="mt-12 grid gap-5 lg:grid-cols-3">
          {caseStudies.map((study) => (
            <RevealStaggerItem key={study.slug}>
              <CaseStudyCard
                eyebrow="Example architecture"
                industry={study.industry}
                title={study.title}
                before={study.before[0] ?? "Manual process"}
                after={study.after[0] ?? "Engineered system"}
                meta={`${study.architecture.length} layers · ${study.security.length} controls`}
                href={`/work/${study.slug}`}
              />
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
