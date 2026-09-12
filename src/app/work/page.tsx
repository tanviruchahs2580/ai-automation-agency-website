import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
import { CaseStudyCard } from "@/components/ui/Card";
import { Spotlight } from "@/components/ui/Spotlight";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";
import { caseStudies } from "@/data/case-studies";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Work & Reference Architectures",
  description:
    "Reference architectures showing how we engineer AI and automation systems — clearly labelled examples until verified client results are published.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Work"
        title="Evidence over hype — including about ourselves."
        lead="We publish reference architectures instead of invented case studies. When verified client results exist, they'll appear here with permission and numbers you can audit."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ]}
      />

      <section className="section-y">
        <div className="container-x">
          <RevealStagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <RevealStaggerItem key={study.slug}>
                <Spotlight className="h-full">
                  <CaseStudyCard
                    eyebrow="Example architecture"
                    industry={study.industry}
                    title={study.title}
                    before={study.before[0] ?? "Manual process"}
                    after={study.after[0] ?? "Engineered system"}
                    meta={`${study.architecture.length} layers · ${study.security.length} controls`}
                    href={`/work/${study.slug}`}
                    diagramSeed={study.slug}
                  />
                </Spotlight>
              </RevealStaggerItem>
            ))}
          </RevealStagger>

          <Reveal className="mt-8 rounded-lg border border-dashed border-line p-6 text-sm leading-relaxed text-muted">
            More architectures are added as they&apos;re engineered. If your
            problem isn&apos;t represented, ask us directly — we&apos;ll describe
            how we would approach it before any commitment.
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
