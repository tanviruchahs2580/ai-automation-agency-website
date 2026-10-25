import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/OgCard";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/social-image";
import { siteConfig } from "@/data/site";

/**
 * Default social card for every route without its own.
 *
 * This route is what `buildMetadata` points at when a page has no per-page
 * card, which is what makes `og:image` present on all 51 indexable routes.
 */
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return new ImageResponse(
    <OgCard
      kicker="Enterprise AI engineering"
      title={siteConfig.tagline}
      footerLeft="Architecture · Agents · Automation · Operations"
      footerRight="Model-agnostic. Architecture-first."
    />,
    { ...OG_SIZE },
  );
}
