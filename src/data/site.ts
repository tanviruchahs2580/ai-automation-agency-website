import type { LinkItem } from "@/types/content";

/**
 * PLACEHOLDER BRAND DATA.
 *
 * The brand/legal entity form and any real contact channels must be supplied
 * before launch — see LAUNCH-CHECKLIST.md §1. Contact values are env-driven so
 * launch configuration never requires a code change.
 *
 * ⚠ The name below is a placeholder. "Vantiq" is also an existing enterprise AI
 * vendor, so shipping under it unmodified carries a trademark and credibility
 * risk. Set `NEXT_PUBLIC_BRAND_NAME` at deploy time to replace it everywhere.
 *
 * "Everywhere" means every user-facing string in `src/`: this module is the only
 * source for the name in application code, `brand.test.ts` fails if a literal
 * reappears, and the three forms are derived from one value so a rename cannot
 * leave a stale suffix on page titles. It does not include files that are not
 * application copy — `LICENSE` names the copyright holder, and the E2E suite
 * asserts the site title against this config. `next.config.ts` prints a build
 * warning when a production build still has the placeholder in place.
 *
 * Three forms exist, each with exactly one role. Using the right one
 * deliberately is what keeps them from drifting into accidental variants, which
 * is what the audit found (three capitalizations across ten hard-coded files):
 *
 *   name       — the lockup: logo, copyright line, structured data, image alt
 *   proseName  — the brand inside a sentence, where all-caps reads as shouting
 *   shortName  — tight spaces: the " — VANTIQ" suffix on page titles
 *
 * `src/lib/__tests__/brand.test.ts` fails if a literal brand string appears
 * anywhere in `src/` outside this module.
 */
const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "VANTIQ SYSTEMS";

/**
 * Title-cases the tail of a brand name for use in a sentence.
 *
 * `"VANTIQ SYSTEMS"` → `"VANTIQ Systems"`, so the lockup can stay set in caps
 * while prose does not shout. Tokens of three characters or fewer that are
 * already all-caps are left alone, because those are acronyms: an "ABC AI Ltd"
 * brand must not become "ABC Ai Ltd".
 */
function proseToken(token: string): string {
  if (token.length <= 3 && token === token.toUpperCase()) return token;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

/**
 * Derives the three brand forms from one value.
 *
 * Exported so `brand.test.ts` can exercise the derivation directly instead of
 * asserting against whichever value the environment happens to hold — the
 * previous version had `shortName: "VANTIQ"` hard-coded beside two env-driven
 * fields, so setting `NEXT_PUBLIC_BRAND_NAME` to anything else produced
 * "Acme Robotics" in the lockup with "VANTIQ" still suffixed to every page
 * title, and failed the brand test suite.
 */
export function deriveBrandForms(rawName: string) {
  const tokens = rawName.trim().split(/\s+/);
  const [head = "", ...tail] = tokens;
  return {
    name: rawName.trim(),
    proseName: [head, ...tail.map(proseToken)].join(" "),
    shortName: head,
  };
}

const brandForms = deriveBrandForms(BRAND_NAME);

export const siteConfig = {
  ...brandForms,
  tagline: "AI Engineering & Automation for the Enterprise",
  description:
    "We design, engineer and operate intelligent automation systems that connect your people, software, data and workflows — from first architecture to production.",
  locale: "en_US",
} as const;

/**
 * Shared byline for every article published under the engineering team rather
 * than a named individual. Derived rather than retyped, so the six article
 * records cannot drift from the team page.
 */
export const teamByline = `${siteConfig.proseName} Engineering Team`;

/**
 * Primary navigation, in display order.
 *
 * One ordered array (rather than "dropdowns + links + a filter") keeps the
 * desktop and mobile menus in the same sequence as the IA. `children` renders
 * as a disclosure dropdown; a bare item renders as a plain link.
 *
 * Deliberately seven items: eight top-level links plus search/theme/CTA
 * measured 195px of horizontal overflow at the 1024px breakpoint, so Approach
 * and About now live inside Company (they remain in the footer and sitemap).
 */
export interface NavItem extends LinkItem {
  children?: NavChild[];
}

/** Nav dropdown child with the one-line descriptor shown in the desktop menu. */
export interface NavChild extends LinkItem {
  description: string;
}

export const siteNav: NavItem[] = [
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      {
        label: "AI Agents",
        href: "/solutions/ai-agents",
        description: "Autonomous execution with human approval gates",
      },
      {
        label: "Workflow Automation",
        href: "/solutions/workflow-automation",
        description: "End-to-end process and document automation",
      },
      {
        label: "AI Software",
        href: "/solutions/ai-software",
        description: "Custom platforms, SaaS and copilots",
      },
      {
        label: "Enterprise AI",
        href: "/solutions/enterprise-ai",
        description: "Portfolio-scale programs and governance",
      },
      {
        label: "Private AI",
        href: "/solutions/private-ai",
        description: "Models inside your own perimeter",
      },
      {
        label: "AI Transformation",
        href: "/solutions/ai-transformation",
        description: "Multi-quarter operating-model change",
      },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "AI Strategy",
        href: "/services/ai-strategy",
        description: "Decide where AI creates value first",
      },
      {
        label: "AI Engineering",
        href: "/services/ai-engineering",
        description: "Agents, RAG pipelines, copilots",
      },
      {
        label: "Automation Engineering",
        href: "/services/automation",
        description: "Document, approval and data flows",
      },
      {
        label: "Software Engineering",
        href: "/services/software-engineering",
        description: "Platforms, SaaS, modernization",
      },
      {
        label: "Data & AI Infrastructure",
        href: "/services/data-ai-infrastructure",
        description: "Pipelines, vector stores, observability",
      },
      {
        label: "AI Security",
        href: "/services/security",
        description: "Isolation, auditability, governance",
      },
      {
        label: "AI Operations",
        href: "/services/ai-operations",
        description: "Monitored, evaluated, improved",
      },
    ],
  },
  {
    label: "Industries",
    href: "/industries",
    children: [
      {
        label: "Financial Services",
        href: "/industries/financial-services",
        description: "Accuracy and auditability first",
      },
      {
        label: "Healthcare",
        href: "/industries/healthcare",
        description: "Privacy-first administrative automation",
      },
      {
        label: "Manufacturing",
        href: "/industries/manufacturing",
        description: "Planning, quality and maintenance",
      },
      {
        label: "Retail & E-commerce",
        href: "/industries/retail",
        description: "Support and merchandising operations",
      },
      {
        label: "Logistics & Supply Chain",
        href: "/industries/logistics",
        description: "Shipments, documents, exceptions",
      },
      {
        label: "SaaS & Technology",
        href: "/industries/saas-technology",
        description: "Customer operations at scale",
      },
    ],
  },
  { label: "Work", href: "/work" },
  { label: "Technology", href: "/technology" },
  { label: "Insights", href: "/insights" },
  {
    label: "Company",
    href: "/about",
    children: [
      {
        label: "About",
        href: "/about",
        description: "Who we are and how we operate",
      },
      {
        label: "Team",
        href: "/team",
        description: "The engineers accountable for delivery",
      },
      {
        label: "Approach",
        href: "/approach",
        description: "Architecture-first delivery method",
      },
      {
        label: "Security",
        href: "/security",
        description: "Governance model and controls",
      },
    ],
  },
];

/**
 * Footer columns.
 *
 * Solutions and Services are derived from `siteNav` so a link added to the
 * navigation cannot silently go missing in the footer — the two lists were
 * maintained by hand and had already drifted apart. Each derived column leads
 * with its index page, which previously had no site-wide footer link at all.
 *
 * Company and Tools carry destinations that are not in the primary navigation,
 * so they stay explicit.
 */
const FOOTER_DERIVED_SECTIONS = ["/solutions", "/services"] as const;

export const footerColumns: Array<{ heading: string; links: LinkItem[] }> = [
  ...siteNav
    .filter((item) =>
      (FOOTER_DERIVED_SECTIONS as readonly string[]).includes(item.href),
    )
    .map((item) => ({
      heading: item.label,
      links: [
        { label: `All ${item.label.toLowerCase()}`, href: item.href },
        ...(item.children ?? []).map((child) => ({
          label: child.label,
          href: child.href,
        })),
      ],
    })),
  {
    heading: "Industries",
    links: [
      { label: "All industries", href: "/industries" },
      {
        label: "Financial Services",
        href: "/industries/financial-services",
      },
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "Manufacturing", href: "/industries/manufacturing" },
      { label: "Retail & E-commerce", href: "/industries/retail" },
      {
        label: "Logistics & Supply Chain",
        href: "/industries/logistics",
      },
      { label: "SaaS & Technology", href: "/industries/saas-technology" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Approach", href: "/approach" },
      { label: "Work", href: "/work" },
      { label: "Insights", href: "/insights" },
      { label: "Technology", href: "/technology" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { label: "AI Readiness Assessment", href: "/ai-readiness" },
      { label: "ROI Calculator", href: "/roi-calculator" },
      { label: "Start a Project", href: "/start-a-project" },
    ],
  },
];

export const legalLinks: LinkItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];

/**
 * Public contact channels.
 *
 * Both are genuinely absent until NEXT_PUBLIC_CONTACT_EMAIL /
 * NEXT_PUBLIC_MEETING_LINK are set at deploy time (build-time inlined). They
 * are modelled as `null` rather than as placeholder strings because a reserved
 * `*.example` address or a `#placeholder` href is a dead end presented as a
 * live channel — visitors click it and nothing happens. Consumers omit the
 * channel when it is null and point at the intake form instead, which works
 * with no configuration at all.
 *
 * Empty values are treated as unset (`||`, not `??`), because hosting panels
 * happily save an env var with an empty value.
 */
export const contact = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
  meetingLink: process.env.NEXT_PUBLIC_MEETING_LINK?.trim() || null,
} as const;
