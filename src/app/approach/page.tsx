import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { engineeringPrinciples } from "@/data/architecture";
import { buildMetadata } from "@/lib/seo";
import { capitalize, countWord } from "@/lib/text";

export const metadata = buildMetadata({
  title: "Our Approach",
  description:
    "How we engineer AI systems: business before technology, architecture before code, evaluation-driven delivery and human oversight where it matters.",
  path: "/approach",
});

const standards = [
  {
    title: "Definition of done",
    detail:
      "Code reviewed, tested, documented and observable. For AI behavior: evaluated against golden sets with agreed pass thresholds.",
  },
  {
    title: "Evaluation-driven acceptance",
    detail:
      "We agree on measurable quality criteria before building — then prove them in CI on every change.",
  },
  {
    title: "Risk-tiered autonomy",
    detail:
      "Every automated action is classified: auto-execute, monitored or human-approved. Nothing consequential runs unattended by default.",
  },
  {
    title: "Transparent handover",
    detail:
      "Your engineers work in our repositories throughout. At the end there is no black box — only your system.",
  },
];

export default function ApproachPage() {
  return (
    <>
      <PageHero
        eyebrow="Approach"
        title="Engineering discipline, applied to intelligent systems."
        lead="AI doesn't remove the need for engineering rigor — it raises the price of lacking it. This is how we work."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Approach", path: "/approach" },
        ]}
      />

      <section className="section-y" aria-labelledby="principles-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="Principles"
            title={`${capitalize(countWord(engineeringPrinciples.length))} commitments we can be measured against.`}
            id="principles-heading"
          />
          <ol className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {engineeringPrinciples.map((principle, i) => (
              <li key={principle.title} className="flex gap-5 border-b border-line pb-8">
                <span className="font-mono text-sm text-accent-strong">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {principle.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Delivery process */}
      <ProcessTimeline />

      <section
        className="section-y border-t border-line bg-surface/30"
        aria-labelledby="beforeafter-heading"
      >
        <div className="container-x max-w-4xl">
          <SectionHeader
            eyebrow="Before → After"
            title="What actually changes."
            lead="A typical process transformation we engineer — compare the states directly."
            id="beforeafter-heading"
          />
          <div className="mt-10">
            <BeforeAfter />
          </div>
        </div>
      </section>

      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="standards-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="Delivery standards"
            title="What 'finished' means here."
            id="standards-heading"
          />
          {/*
            Each <div> under a <dl> must contain its <dt>/<dd> directly. This
            used to nest an extra wrapper — <Reveal> as the dl child, then a
            card <div> inside it — giving `dl > div > div > dt`, which the HTML
            spec forbids and axe flags as "dlitem" / "definition-list".
            Passing the card styling to <Reveal> removes the stray wrapper.
          */}
          <dl className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {standards.map((standard) => (
              <Reveal key={standard.title} className="card-surface h-full p-6">
                <dt className="font-semibold">{standard.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  {standard.detail}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <CtaSection
        eyebrow="Experience it"
        title="Work with engineers who show their reasoning."
        primaryLabel="Start a Project"
        secondaryLabel="Explore Our Technology"
        secondaryHref="/technology"
      />
    </>
  );
}
