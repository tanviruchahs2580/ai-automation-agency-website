import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { ReadinessAssessment } from "@/components/calculators/ReadinessAssessment";
import { Reveal } from "@/components/ui/Reveal";
import { readinessCategories } from "@/lib/readiness";
import { readinessQuestions } from "@/data/readiness-questions";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Readiness Assessment",
  description:
    "Free ten-question assessment scoring your process, data, infrastructure, opportunity and governance readiness for AI — with a recommended next step.",
  path: "/ai-readiness",
});

export default function AiReadinessPage() {
  return (
    <>
      <PageHero
        eyebrow="AI readiness"
        title="Get your AI readiness score."
        lead="Ten questions across five dimensions of readiness. Two minutes, no personal data collected, honest output — including when you're not ready yet."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "AI Readiness", path: "/ai-readiness" },
        ]}
      />

      <section className="section-y">
        <div className="container-x">
          <ReadinessAssessment />
        </div>
      </section>

      <section className="border-t border-line bg-surface/30" aria-labelledby="method-heading">
        <div className="container-x py-14 lg:py-20 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 id="method-heading" className="text-xl font-bold tracking-tight md:text-2xl">
              What we measure
            </h2>
            <dl className="mt-6 space-y-4">
              {readinessCategories.map((category) => (
                <div key={category.key} className="flex gap-4">
                  <dt className="w-44 shrink-0 text-sm font-medium">{category.label}</dt>
                  <dd className="text-sm text-muted">
                    {
                      readinessQuestions.filter((q) => q.category === category.key)
                        .length
                    }{" "}
                    questions · scored 0–100
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 rounded border border-warn/30 bg-warn/5 px-4 py-3 text-xs leading-relaxed text-warn/90">
              Indicative estimates based on self-reported answers — not an audited
              methodology. A validated assessment requires workshops with your
              teams, which is exactly what we do first on real engagements.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              What happens next
            </h2>
            <ol className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <li className="flex gap-3">
                <span className="font-mono text-accent-strong">01</span>
                Your score maps to one of three recommended paths: roadmap,
                discovery workshop, or pilot scoping.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent-strong">02</span>
                Bring the result to a discovery call — we&apos;ll stress-test it
                against your actual constraints, free of charge.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent-strong">03</span>
                If there&apos;s genuine fit, we scope a first engagement sized to
                prove value within weeks, not quarters.
              </li>
            </ol>
          </Reveal>
        </div>
      </section>

      <CtaSection
        eyebrow="Next step"
        title="Discuss my result."
        primaryLabel="Start a Project"
        secondaryLabel="Estimate My ROI First"
        secondaryHref="/roi-calculator"
      />
    </>
  );
}
