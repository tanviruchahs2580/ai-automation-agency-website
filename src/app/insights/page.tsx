import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
import { InsightCard } from "@/components/ui/Card";
import { Spotlight } from "@/components/ui/Spotlight";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";
import { insightCategories, insights, readingTimeMinutes } from "@/data/insights";
import { formatDate } from "@/lib/i18n";
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
          <div className="mb-10 flex flex-wrap gap-2" aria-label="Categories">
            {insightCategories.map((category) => (
              <span
                key={category}
                className="mono-label rounded border border-line px-3 py-1.5 text-muted"
              >
                {category}
              </span>
            ))}
          </div>

          <RevealStagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <RevealStaggerItem key={insight.slug}>
                <Spotlight className="h-full">
                  <InsightCard
                    eyebrow={insight.category}
                    title={insight.title}
                    dek={insight.excerpt}
                    byline={insight.author}
                    readTime={`${formatDate(insight.publishedAt, "en-US", { year: "numeric", month: "short", day: "numeric" })} · ${readingTimeMinutes(insight)} min read`}
                    href={`/insights/${insight.slug}`}
                    patternSeed={insight.category}
                    patternHue={
                      (["brass", "signal", "sky", "amber", "accent"] as const)[
                        [...insight.category].reduce((a, c) => a + c.charCodeAt(0), 0) % 5
                      ]
                    }
                  />
                </Spotlight>
              </RevealStaggerItem>
            ))}
          </RevealStagger>

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
