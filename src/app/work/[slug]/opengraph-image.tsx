import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/OgCard";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/social-image";
import { caseStudies, getCaseStudy } from "@/data/case-studies";
import { siteConfig } from "@/data/site";

/** Per-case-study social card, generated from this site's own data. */
export const alt = `${siteConfig.name} — reference architecture`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  return new ImageResponse(
    <OgCard
      kicker={study ? `Work · ${study.industry}` : "Work"}
      title={study?.title ?? siteConfig.tagline}
      footerLeft={`${siteConfig.name} — Reference architecture`}
      footerRight={study ? `${study.architecture.length} layers` : "Work"}
    />,
    { ...OG_SIZE },
  );
}
