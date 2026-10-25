import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/OgCard";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/social-image";
import { getService, services } from "@/data/services";
import { siteConfig } from "@/data/site";

/** Per-service social card, generated from this site's own data. */
export const alt = `${siteConfig.name} — service`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);

  return new ImageResponse(
    <OgCard
      kicker="Services"
      title={service?.title ?? siteConfig.tagline}
      footerLeft={`${siteConfig.name} — Services`}
      footerRight={service?.engagementShape.label ?? "Service"}
    />,
    { ...OG_SIZE },
  );
}
