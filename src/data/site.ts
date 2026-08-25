import type { LinkItem } from "@/types/content";

/**
 * PLACEHOLDER BRAND & CONTACT DATA.
 * Every contact detail below must be replaced with verified company
 * information before launch. No social profiles are listed until they exist.
 */

export const siteNav: LinkItem[] = [
  { label: "Solutions", href: "/solutions" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Work", href: "/work" },
  { label: "Approach", href: "/approach" },
  { label: "Technology", href: "/technology" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
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

/** PLACEHOLDER — replace with the verified VANTIQ SYSTEMS inbox before launch. */
export const contact = {
  email: "hello@vantiqsystems.example",
  meetingLink: "#meeting-link-placeholder",
};
