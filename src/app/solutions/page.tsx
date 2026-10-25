import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { CtaSection } from "@/components/layout/CtaSection";
import { CapabilityCard } from "@/components/ui/Card";
import { Spotlight } from "@/components/ui/Spotlight";
import { chipFor } from "@/components/ui/Chip";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { OpportunityFinder } from "@/components/home/OpportunityFinder";
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
        actions={<Button href="/start-a-project">Start a Project</Button>}
      />

      <section className="section-y" aria-labelledby="solutions-heading">
        <div className="container-x">
          {/*
            A visible section heading between the page h1 and the card grid.

            The grid *is* this page's content, and every card title is an h3, so
            without an h2 the document outline ran h1 → h3 on five index routes.
            Heading-based navigation (the H key in NVDA/JAWS, the VoiceOver
            rotor) therefore jumped from the page title straight to the footer
            CTA and the content was unreachable that way. axe flags this as
            `heading-order`, and the CI scan was filtering that rule out.
          */}
          <h2 id="solutions-heading" className="h-section">
            All solutions
          </h2>
          <RevealStagger className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution, i) => {
              const { icon, hue } = chipFor(solution.slug, i);
              return (
                <RevealStaggerItem key={solution.slug}>
                  <Spotlight className="h-full">
                    <CapabilityCard
                      eyebrow="Solution"
                      index={String(i + 1).padStart(2, "0")}
                      icon={icon}
                      hue={hue}
                      title={solution.title}
                      description={solution.summary}
                      meta={solution.meta}
                      href={`/solutions/${solution.slug}`}
                    />
                  </Spotlight>
                </RevealStaggerItem>
              );
            })}
          </RevealStagger>
        </div>
      </section>

      <section
        className="section-y border-t border-line bg-surface/30"
        aria-labelledby="finder-heading"
      >
        <div className="container-x">
          <SectionHeader
            eyebrow="AI opportunity finder"
            title="What are you trying to improve?"
            lead="Pick a goal and see the system we would engineer for it — architecture included, buzzwords excluded."
            id="finder-heading"
          />
          <div className="mt-12">
            <OpportunityFinder />
          </div>
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
