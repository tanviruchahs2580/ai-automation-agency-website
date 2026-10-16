export interface LinkItem {
  label: string;
  href: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/** One phase of a service's delivery shape, shown in the detail sidebar. */
export interface EngagementPhase {
  phase: string;
  /** Planned span, e.g. "Weeks 1–2", "Continuous", "Quarterly". */
  duration: string;
  detail: string;
}

export interface Solution {
  slug: string;
  title: string;
  summary: string;
  /** One-line factual descriptor for card footers — unique per solution. */
  meta: string;
  problem: string;
  businessImpact: string[];
  approach: string[];
  architecture: string[];
  workflow: Array<{ step: string; detail: string }>;
  technologies: string[];
  security: string[];
  implementation: string[];
  faq: Faq[];
}

export interface Service {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  deliverables: string[];
  engagement: string[];
  /**
   * The delivery shape for this service, shown as a sidebar card.
   *
   * Per-service rather than a shared template. One hard-coded "6-week
   * discover → architect → prototype" card used to render on every service
   * page, which contradicted AI Strategy's own FAQ ("Typically 4–8 weeks") and
   * turned the ongoing AI Operations retainer into a six-week prototype
   * project. Each shape below is derived from that service's own engagement
   * bullets and deliverables.
   */
  engagementShape: {
    /** Heading for the sidebar card, e.g. "6-week engagement shape". */
    label: string;
    phases: EngagementPhase[];
  };
  capabilities: string[];
  technologies: string[];
  faq: Faq[];
}

export interface Industry {
  slug: string;
  title: string;
  summary: string;
  challenges: string[];
  opportunities: string[];
  useCases: Array<{ title: string; description: string }>;
  architectureNotes: string[];
  kpis: string[];
  caseStudySlugs: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  industry: string;
  /** True when the study describes a reference architecture, not a verified client engagement. */
  isExampleArchitecture: boolean;
  challenge: string;
  before: string[];
  intervention: string[];
  architecture: string[];
  technology: string[];
  security: string[];
  monitoring: string[];
  after: string[];
}

export interface Insight {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  category:
    | "AI Engineering"
    | "Agentic Systems"
    | "Automation"
    | "Enterprise AI"
    | "AI Security"
    | "AI Economics";
  tags: string[];
  publishedAt: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  /**
   * Editorially chosen pull quote for the article body, lifted verbatim from
   * the prose. Authored rather than sliced out of a paragraph: the renderer
   * used to take the first sentence of the second section, which could not be
   * the strongest line and could dangle mid-argument — one article shipped
   * "First, capability limits: ..." with no "Second" to follow it.
   */
  pullQuote: string;
}
