import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
import { solutions } from "@/data/solutions";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Solutions",
  description:
    "Production AI systems for the enterprise: agents, workflow automation, AI software, enterprise AI platforms, private AI and transformation programs.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Engineered systems, not experiments."
        lead="Each solution below is a complete architecture we design, build and operate — selected by the problem it solves, not by what's fashionable."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ]}
      />

      <section className="section-y">
        <div className="container-x grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, i) => (
            <Reveal key={solution.slug} delay={i * 0.05}>
              <Link
                href={`/solutions/${solution.slug}`}
                className="card-surface group flex h-full flex-col p-7 transition-colors hover:border-accent/40"
              >
                <span className="mono-label text-accent-strong">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="h-card mt-3">{solution.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {solution.summary}
                </p>
                <span className="mono-label mt-6 text-faint group-hover:text-accent-strong">
                  Architecture · Workflow · Security →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaSection
        eyebrow="Not sure which fits?"
        title="Describe the problem. We'll recommend honestly."
        lead="Including when a simpler solution — or no AI at all — is the right answer."
      />
    </>
  );
}
