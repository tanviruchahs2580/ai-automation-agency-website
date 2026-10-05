import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
import { InsightsExplorer } from "@/components/insights/InsightsExplorer";
import { insightCategories, insights } from "@/data/insights";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Insights",
  description:
    "Engineering notes on AI systems: production lessons, agent architecture, RAG, security and AI economics — written by engineers who ship.",
  path: "/insights",
});

export default function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Notes from inside the engineering."
        lead="What we learn building production AI systems — including what breaks. No thought leadership, just working knowledge."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
        ]}
      />

      <section className="section-y">
        <div className="container-x">
          <InsightsExplorer insights={insights} categories={insightCategories} />

          <Reveal className="mt-12 rounded-lg border border-dashed border-line p-5 text-xs leading-relaxed text-faint">
            Authorship shown as the engineering team pending verified individual
            profiles. Articles will move to named authors as publication ramps
            up — see <a href="/team" className="underline underline-offset-4 hover:text-ink">the team page</a>.
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
