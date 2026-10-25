import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/OgCard";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/social-image";
import { getIndustry, industries } from "@/data/industries";
import { siteConfig } from "@/data/site";

/** Per-industry social card, generated from this site's own data. */
export const alt = `${siteConfig.name} — industry`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);

  return new ImageResponse(
    <OgCard
      kicker="Industries"
      title={industry?.title ?? siteConfig.tagline}
      footerLeft={`${siteConfig.name} — Industries`}
      footerRight={industry ? `${industry.useCases.length} use cases` : "Industry"}
    />,
    { ...OG_SIZE },
  );
}
