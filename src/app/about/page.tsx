import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { engineeringPrinciples } from "@/data/architecture";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About",
  description:
    "We are engineers who build systems that work. Our philosophy, standards, expertise and global delivery model — stated plainly.",
  path: "/about",
});

const disciplines = [
  "AI architecture",
  "Agent & orchestration engineering",
  "Data & retrieval engineering",
  "Backend & platform engineering",
  "Automation engineering",
  "Security engineering",
  "QA & evaluation engineering",
  "Technical program management",
];

const commitments = [
  {
    title: "Client ownership",
    detail:
      "Every repository, infrastructure definition and document is transferred. You are never hostage to our tooling.",
  },
  {
    title: "Global delivery model",
    detail:
      "Distributed senior engineers with overlap hours across US, European and APAC time zones. Async-first communication with documented decisions.",
  },
  {
    title: "AI responsibility",
    detail:
      "We decline work where AI is the wrong answer, refuse to automate decisions that require human accountability, and design so every system can be explained and audited.",
  },
  {
    title: "Honest marketing",
    detail:
      "This website claims only what can be verified. Where evidence doesn't exist yet, we say so — including in our own case studies.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="We are engineers who build systems that work."
        lead="Not an AI agency chasing trends. An engineering company that treats intelligent automation as serious production infrastructure — because that's what it is."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      <section className="section-y" aria-labelledby="philosophy-heading">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-3">Philosophy</p>
            <h2 id="philosophy-heading" className="h-section">
              Business before technology. Production over prototypes.
            </h2>
          </Reveal>
          <div className="prose-body lg:col-span-7">
            <Reveal delay={0.08}>
              <p className="leading-relaxed text-muted">
                Most AI projects fail for unglamorous reasons: no measurable
                objective, no data pipeline, no failure handling, no owner after
                launch. The technology was never the hard part.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                So we start where value lives — a named process, a named metric,
                a named team — and engineer backwards from there. Models are
                chosen per task through a routing layer. Security controls are
                designed before autonomy is granted. Evaluation suites run in CI
                like any other test.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                The result is systems our clients own outright, understand fully
                and can extend without us. That&apos;s not modesty; it&apos;s the
                product working.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="expertise-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="Team expertise"
            title="Senior engineers across eight disciplines."
            lead="We staff engagements with people who have shipped production systems before — and we publish capability, not headcount vanity metrics."
            id="expertise-heading"
          />
          <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] md:grid-cols-4">
            {disciplines.map((discipline) => (
              <li key={discipline} className="bg-canvas p-5 text-sm font-medium leading-snug">
                {discipline}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y" aria-labelledby="standards-heading">
        <div className="container-x grid gap-10 md:grid-cols-2">
          {commitments.map((commitment) => (
            <Reveal key={commitment.title}>
              <div className="card-surface h-full p-7">
                <h3 className="h-card">{commitment.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {commitment.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="principles2-heading">
        <div className="container-x">
          <SectionHeader eyebrow="Operating principles" title="The short version." id="principles2-heading" />
          <ol className="mono-label mt-8 grid gap-x-8 gap-y-3 uppercase leading-loose text-muted md:grid-cols-2">
            {engineeringPrinciples.map((p, i) => (
              <li key={p.title}>
                <span className="text-accent-strong">{String(i + 1).padStart(2, "0")}</span> —{" "}
                {p.title}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
