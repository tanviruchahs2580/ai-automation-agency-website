import { siteConfig } from "@/data/site";
import { ScrollDepthTracker } from "@/components/ui/ScrollDepthTracker";
import { ArchitecturalSections } from "@/components/home/ArchitecturalSections";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Engineering & Automation for the Enterprise",
  description:
    `${siteConfig.proseName} engineers the autonomous operations layer for enterprises that cannot afford guesswork — from first architecture to production.`,
  path: "/",
});

/**
 * Homepage — "Architectural Night" composition (owner-approved reference):
 * header → architectural hero → industry strip → six grouped services →
 * Proven Approach banner → footer.
 *
 * Homepage teasers from the previous composition (trust strip, problem grid,
 * service rows, industries grid, case-study preview, trust/governance, ROI
 * teaser, final CTA) are intentionally absent: each one's content remains
 * available on its dedicated route (docs/redesign/DECISIONS.md records the
 * mapping). ScrollDepthTracker stays mounted — FC-21 requires the home
 * scroll-depth events.
 */
export default function HomePage() {
  return (
    <>
      <ScrollDepthTracker />
      <ArchitecturalSections />
    </>
  );
}
