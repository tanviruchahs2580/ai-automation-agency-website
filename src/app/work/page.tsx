import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { ExampleBadge } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
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
        <div className="container-x space-y-6">
          {caseStudies.map((study, i) => (
            <Reveal key={study.slug} delay={i * 0.05}>
              <Link
                href={`/work/${study.slug}`}
                className="card-surface group grid gap-6 p-7 transition-colors hover:border-accent/40 md:grid-cols-12 md:p-8"
              >
                <div className="md:col-span-8">
                  <ExampleBadge />
                  <h2 className="h-card mt-4">{study.title}</h2>
                  <p className="mono-label mt-2 text-faint">{study.industry}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {study.challenge}
                  </p>
                </div>
                <div className="flex flex-col justify-between gap-4 border-t border-line pt-4 md:col-span-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <div>
                    <p className="mono-label uppercase text-faint">Architecture layers</p>
                    <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
                      {study.architecture.length} components ·{" "}
                      {study.security.length} security controls
                    </p>
                  </div>
                  <span className="mono-label text-faint group-hover:text-accent-strong">
                    Read the walkthrough →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}

          <Reveal className="rounded-lg border border-dashed border-line p-6 text-sm leading-relaxed text-muted">
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
