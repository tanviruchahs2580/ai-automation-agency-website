export interface LinkItem {
  label: string;
  href: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Solution {
  slug: string;
  title: string;
  summary: string;
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
}
