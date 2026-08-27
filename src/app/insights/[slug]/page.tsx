import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { JsonLd } from "@/components/ui/Accordion";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { getInsight, insights, readingTimeMinutes } from "@/data/insights";
import { articleJsonLd, buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) return {};
  return buildMetadata({
    title: insight.title,
    description: insight.excerpt,
    path: `/insights/${insight.slug}`,
    ogType: "article",
    publishedTime: insight.publishedAt,
  });
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) notFound();

  const related = insights
    .filter(
      (i) =>
        i.slug !== insight.slug &&
        (i.category === insight.category ||
          i.tags.some((tag) => insight.tags.includes(tag))),
    )
    .slice(0, 2);

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={articleJsonLd({
          title: insight.title,
          description: insight.excerpt,
          path: `/insights/${insight.slug}`,
          author: insight.author,
          publishedAt: insight.publishedAt,
        })}
      />

      <PageHero
        eyebrow={`Insight — ${insight.category}`}
        title={insight.title}
        lead={insight.excerpt}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
          { name: insight.title.slice(0, 40), path: `/insights/${insight.slug}` },
        ]}
      />

      <article className="container-x section-y max-w-3xl">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-8 text-sm text-muted">
          <span>
            By <strong className="font-medium text-ink">{insight.author}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={insight.publishedAt}>
            {new Date(insight.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span aria-hidden="true">·</span>
          <span>{readingTimeMinutes(insight)} min read</span>
        </header>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="mt-8 rounded-lg border border-line bg-surface p-5">
          <p className="mono-label uppercase text-faint">Contents</p>
          <ol className="mt-2 space-y-1 text-sm">
            {insight.sections.map((section, i) => (
              <li key={section.heading}>
                <a href={`#s-${i + 1}`} className="text-muted hover:text-accent-strong">
                  {String(i + 1).padStart(2, "0")} · {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-12">
          {insight.sections.map((section, i) => (
            <section key={section.heading} id={`s-${i + 1}`} className="scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                {section.heading}
              </h2>
              <div className="prose-body mt-4 space-y-4 leading-relaxed text-muted">
                {section.paragraphs.map((paragraph, j) => (
                  <p key={j}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="divider-top mt-14 pt-8">
          <ul className="flex flex-wrap gap-2">
            {insight.tags.map((tag) => (
              <li key={tag} className="mono-label rounded border border-line px-2.5 py-1 text-faint">
                #{tag}
              </li>
            ))}
          </ul>
        </footer>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-surface/30" aria-labelledby="related-heading">
          <div className="container-x py-14">
            <p id="related-heading" className="eyebrow mb-6">Related reading</p>
            <div className="grid gap-5 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/insights/${item.slug}`}
                  className="card-surface p-6 transition-colors hover:border-accent/40"
                >
                  <p className="mono-label uppercase text-faint">{item.category}</p>
                  <h3 className="h-card mt-2">{item.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection />
    </>
  );
}
