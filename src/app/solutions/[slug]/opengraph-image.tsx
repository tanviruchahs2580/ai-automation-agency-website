import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/OgCard";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/social-image";
import { getSolution, solutions } from "@/data/solutions";
import { siteConfig } from "@/data/site";

/** Per-solution social card, generated from this site's own data. */
export const alt = `${siteConfig.name} — solution`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolution(slug);

  return new ImageResponse(
    <OgCard
      kicker="Solutions"
      title={solution?.title ?? siteConfig.tagline}
      footerLeft={`${siteConfig.name} — Solutions`}
      footerRight={solution?.meta ?? "Solution"}
    />,
    { ...OG_SIZE },
  );
}
