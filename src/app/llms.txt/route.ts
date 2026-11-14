import { legalLinks, siteConfig, siteNav } from "@/data/site";
import { insights } from "@/data/insights";
import { solutions } from "@/data/solutions";
import { services } from "@/data/services";
import { industries } from "@/data/industries";
import { SITE_URL } from "@/lib/seo";

/**
 * /llms.txt — the emerging convention for pointing LLM/answer-engine crawlers
 * at a curated, markdown map of the site (AEO). Generated from the same data
 * modules as the UI so it cannot drift from the real routes; no claims are
 * added here that the pages themselves do not make. Contact channels stay
 * env-gated and are simply absent when unconfigured (same rule as the UI).
 */
export function GET() {
  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `An AI engineering and automation company: applied AI R&D, intelligent-systems`,
    `engineering and automation — from problem discovery to production operation.`,
    `All figures on labelled tools are estimates; published work items are`,
    `example architectures, not client engagements.`,
    "",
    "## Pages",
    "",
    `- [Home](${SITE_URL}): ${siteConfig.tagline}`,
    `- [Start a Project](${SITE_URL}/start-a-project): Seven-step project intake with guided scoping`,
    `- [AI Readiness Assessment](${SITE_URL}/ai-readiness): Ten-question self-assessment with an indicative score`,
    `- [ROI Calculator](${SITE_URL}/roi-calculator): Estimate manual-work cost and automation return from your inputs`,
    `- [Our Approach](${SITE_URL}/approach): Architecture-first delivery method`,
    "",
    "## Solutions",
    "",
    ...solutions.map(
      (s) => `- [${s.title}](${SITE_URL}/solutions/${s.slug}): ${s.summary}`,
    ),
    "",
    "## Services",
    "",
    ...services.map(
      (s) => `- [${s.title}](${SITE_URL}/services/${s.slug}): ${s.summary}`,
    ),
    "",
    "## Industries",
    "",
    ...industries.map(
      (i) =>
        `- [${i.title}](${SITE_URL}/industries/${i.slug}): AI use cases and constraints for ${i.title.toLowerCase()}`,
    ),
    "",
    "## Insights (engineering notes)",
    "",
    ...insights.map(
      (a) => `- [${a.title}](${SITE_URL}/insights/${a.slug}): ${a.category} · ${a.publishedAt}`,
    ),
    "",
    "## Navigation",
    "",
    ...siteNav
      .filter((item) => !item.children)
      .map((item) => `- [${item.label}](${SITE_URL}${item.href})`),
    "",
    "## Legal and feeds",
    "",
    ...legalLinks.map(
      (item) => `- [${item.label}](${SITE_URL}${item.href})`,
    ),
    `- [RSS feed](${SITE_URL}/feed.xml)`,
    "",
  ];

  const seen = new Set<string>();
  const body = lines.filter((line) => {
    if (!line.startsWith("- [")) return true;
    const url = line.match(/\(([^)]+)\)/)?.[1] ?? "";
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  return new Response(body.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  });
}
