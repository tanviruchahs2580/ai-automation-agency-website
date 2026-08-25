import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
import { insightCategories, insights, readingTimeMinutes } from "@/data/insights";
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

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, i) => (
              <Reveal key={insight.slug} delay={(i % 3) * 0.05}>
                <Link
                  href={`/insights/${insight.slug}`}
                  className="card-surface group flex h-full flex-col p-6 transition-colors hover:border-accent/40"
                >
                  <p className="mono-label uppercase text-faint">{insight.category}</p>
                  <h2 className="h-card mt-3">{insight.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {insight.excerpt}
                  </p>
                  <p className="mono-label mt-6 flex items-center justify-between text-faint">
                    <time dateTime={insight.publishedAt}>
                      {new Date(insight.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span>{readingTimeMinutes(insight)} min read</span>
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 rounded-lg border border-dashed border-line p-5 text-xs leading-relaxed text-faint">
            Authorship shown as the engineering team pending verified individual
            profiles. Articles will move to MDX/CMS with named authors as
            publication ramps up.
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
