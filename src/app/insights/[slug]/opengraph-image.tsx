import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/OgCard";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/social-image";
import { getInsight, insights } from "@/data/insights";
import { siteConfig } from "@/data/site";

/**
 * Per-article social card. Generated from this site's own data — the slug is
 * resolved against the content set, so no request can put arbitrary text on a
 * card carrying the company wordmark.
 */
export const alt = `${siteConfig.name} — insight article`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return insights.map((insight) => ({ slug: insight.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = getInsight(slug);

  return new ImageResponse(
    <OgCard
      kicker={insight ? `Insights · ${insight.category}` : "Insights"}
      title={insight?.title ?? siteConfig.tagline}
      footerLeft={`${siteConfig.name} — Insights`}
      footerRight={insight ? `${insight.publishedAt.slice(0, 4)}` : "Article"}
    />,
    { ...OG_SIZE },
  );
}
