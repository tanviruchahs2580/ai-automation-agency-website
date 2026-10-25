import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { JsonLd } from "@/components/ui/JsonLd";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { QuoteRail } from "@/components/scenes/QuoteRail";
import { getInsight, insights, readingTimeMinutes } from "@/data/insights";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { cardPath } from "@/lib/social-image";
import { formatDate } from "@/lib/i18n";

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
    cardPath: cardPath("insights", insight.slug),
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
          /* Team byline — an Organization, not a Person. */
          authorType: "Organization",
          publishedAt: insight.publishedAt,
          cardPath: cardPath("insights", insight.slug),
        })}
      />

      <PageHero
        eyebrow={`Insight — ${insight.category}`}
        title={insight.title}
        lead={insight.excerpt}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
          /*
            The full title, not a 40-character slice. The slice cut the visible
            crumb mid-word — "Why most AI pilots never reach productio" — and it
            propagated into BreadcrumbList structured data as well. The eyebrow
            now renders on its own line, so a long crumb can no longer collide
            with it, and the label is wrapped rather than truncated.
          */
          { name: insight.title, path: `/insights/${insight.slug}` },
        ]}
      />

      <article className="container-x section-y max-prose">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-8 text-sm text-muted">
          <span>
            By{" "}
            <Link
              href="/team"
              className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:text-accent-strong"
            >
              {insight.author}
            </Link>
            {/*
              The role used to be authored in the data and never rendered — one
              of two fields (`Insight.authorRole`, `CaseStudy.
              isExampleArchitecture`) that the content layer maintained but no
              component read, so the data and the page could disagree silently.
            */}
            <span className="text-faint"> · {insight.authorRole}</span>
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={insight.publishedAt}>
            {formatDate(insight.publishedAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{readingTimeMinutes(insight)} min read</span>
        </header>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="mt-8 rounded-lg border border-line bg-surface p-5">
          <p className="mono-label uppercase text-faint">Contents</p>
          {/*
            `list-none`: the manual "01 ·" index is the numbering. As an
            ordinary `<ol>` the browser also drew its own markers, so every row
            read "01 · 1. No definition of 'working'".
          */}
          <ol className="mt-2 list-none space-y-1 text-sm">
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
              <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                {section.heading}
              </h2>
              <div className="prose-editorial mt-4 space-y-4 text-muted">
                {section.paragraphs.map((paragraph, j) => (
                  <p key={j}>{paragraph}</p>
                ))}
              </div>
              {/*
                The pull quote is authored per article (see Insight.pullQuote)
                rather than sliced out of the second section's first sentence,
                which could not be the strongest line and could dangle: one
                article rendered "First, capability limits: ..." with no
                "Second" to follow. Rendering it after the first section also
                means it no longer depends on a second section existing.
              */}
              {i === 0 && (
                <QuoteRail
                  quote={insight.pullQuote}
                  attribution={`${insight.author} — ${insight.category}`}
                />
              )}
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
