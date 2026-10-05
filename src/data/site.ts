import type { LinkItem } from "@/types/content";

/**
 * PLACEHOLDER BRAND & CONTACT DATA.
 * Contact details below are env-driven so launch configuration never
 * requires a code change: set NEXT_PUBLIC_CONTACT_EMAIL and
 * NEXT_PUBLIC_MEETING_LINK at deploy time (build-time inlined).
 * Fallbacks are intentional placeholders until those vars exist.
 */

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
        label: "Automation",
        href: "/services/automation",
        description: "Document, approval and data flows",
      },
      {
        label: "Software Engineering",
        href: "/services/software-engineering",
        description: "Platforms, SaaS, modernisation",
      },
      {
        label: "Data & AI Infrastructure",
        href: "/services/data-ai-infrastructure",
        description: "Pipelines, vector stores, observability",
      },
      {
        label: "Security",
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
        label: "Retail",
        href: "/industries/retail",
        description: "Support and merchandising operations",
      },
      {
        label: "Logistics",
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

export const footerColumns: Array<{ heading: string; links: LinkItem[] }> = [
  {
    heading: "Solutions",
    links: [
      { label: "AI Agents", href: "/solutions/ai-agents" },
      { label: "Workflow Automation", href: "/solutions/workflow-automation" },
      { label: "AI Software", href: "/solutions/ai-software" },
      { label: "Enterprise AI", href: "/solutions/enterprise-ai" },
      { label: "Private AI", href: "/solutions/private-ai" },
      { label: "AI Transformation", href: "/solutions/ai-transformation" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "AI Strategy", href: "/services/ai-strategy" },
      { label: "AI Engineering", href: "/services/ai-engineering" },
      { label: "Automation", href: "/services/automation" },
      { label: "Software Engineering", href: "/services/software-engineering" },
      {
        label: "Data & AI Infrastructure",
        href: "/services/data-ai-infrastructure",
      },
      { label: "Security", href: "/services/security" },
      { label: "AI Operations", href: "/services/ai-operations" },
    ],
  },
  {
    heading: "Industries",
    links: [
      { label: "Financial Services", href: "/industries/financial-services" },
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "Manufacturing", href: "/industries/manufacturing" },
      { label: "Retail", href: "/industries/retail" },
      { label: "Logistics", href: "/industries/logistics" },
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

/** PLACEHOLDER fallbacks — override via NEXT_PUBLIC_* env vars before launch.
 * Uses || (not ??) so an env var saved with an empty value still falls back. */
export const contact = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@vantiqsystems.example",
  meetingLink: process.env.NEXT_PUBLIC_MEETING_LINK || "#meeting-link-placeholder",
};
