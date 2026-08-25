export interface Opportunity {
  id: string;
  label: string;
  recommendedSystem: string;
  summary: string;
  flow: string[];
  solutionSlug: string;
  serviceSlug: string;
}

export const opportunities: Opportunity[] = [
  {
    id: "automate-repetitive",
    label: "Automate repetitive work",
    recommendedSystem: "Workflow Automation System",
    summary:
      "High-volume manual tasks converted into validated, monitored pipelines that feed your systems directly.",
    flow: ["Business Process", "Data Layer", "Rules Engine", "System APIs", "Exception Queue", "Dashboards"],
    solutionSlug: "workflow-automation",
    serviceSlug: "automation",
  },
  {
    id: "reduce-cost",
    label: "Reduce operational cost",
    recommendedSystem: "Process Automation + AI Operations",
    summary:
      "Cost reduction engineered from measurement: baseline metrics, automated processing, then continuous optimisation.",
    flow: ["Baseline Metrics", "Process Automation", "Quality Gates", "Cost Monitoring", "Optimisation Loop"],
    solutionSlug: "ai-transformation",
    serviceSlug: "automation",
  },
  {
    id: "build-agents",
    label: "Build AI agents",
    recommendedSystem: "Agentic Automation Platform",
    summary:
      "Scoped autonomous workers that plan, use tools and escalate — operating inside your governance boundaries.",
    flow: ["Business Process", "Orchestrator", "Agent Layer", "Tool Registry", "Human Approval", "Audit Log"],
    solutionSlug: "ai-agents",
    serviceSlug: "ai-engineering",
  },
  {
    id: "customer-support",
    label: "Automate customer support",
    recommendedSystem: "Tiered Support Automation",
    summary:
      "Instant grounded answers for routine questions, prepared context for humans, and quality sampling throughout.",
    flow: ["Customer Channels", "Intent Router", "Knowledge Layer", "Auto-Resolve", "Agent Assist", "Escalation"],
    solutionSlug: "ai-agents",
    serviceSlug: "automation",
  },
  {
    id: "increase-sales",
    label: "Increase sales output",
    recommendedSystem: "Revenue Workflow Agents",
    summary:
      "Research, enrichment and follow-up preparation automated — sellers keep every final send decision.",
    flow: ["Lead Signals", "Enrichment Pipeline", "Research Agent", "Draft Generation", "Seller Approval", "CRM Sync"],
    solutionSlug: "ai-agents",
    serviceSlug: "automation",
  },
  {
    id: "process-documents",
    label: "Process documents",
    recommendedSystem: "Document Intelligence Pipeline",
    summary:
      "Any-format documents become validated structured data with confidence scoring and exception handling.",
    flow: ["Document Intake", "Classification", "Extraction", "Validation Rules", "Review Queue", "System of Record"],
    solutionSlug: "workflow-automation",
    serviceSlug: "data-ai-infrastructure",
  },
  {
    id: "internal-ai",
    label: "Build internal AI",
    recommendedSystem: "Enterprise Knowledge Platform",
    summary:
      "A grounded assistant over your policies, documents and history — with citations staff can verify.",
    flow: ["Content Sources", "Permission-Aware Index", "RAG Pipeline", "Assistant Interface", "Feedback Capture"],
    solutionSlug: "enterprise-ai",
    serviceSlug: "data-ai-infrastructure",
  },
  {
    id: "modernize-legacy",
    label: "Modernize legacy systems",
    recommendedSystem: "Modernisation Program",
    summary:
      "Strangler-pattern modernisation that adds APIs and automation around legacy cores without big-bang risk.",
    flow: ["Legacy Audit", "Interface Layer", "Automated Workflows", "Data Sync", "Incremental Cutover"],
    solutionSlug: "ai-software",
    serviceSlug: "software-engineering",
  },
  {
    id: "new-ai-product",
    label: "Build a new AI product",
    recommendedSystem: "AI Product Engineering",
    summary:
      "From product discovery to production SaaS: evaluation infrastructure and cost controls built in from day one.",
    flow: ["Product Discovery", "Architecture", "MVP Build", "Evaluation Harness", "Staged Launch", "Operations"],
    solutionSlug: "ai-software",
    serviceSlug: "software-engineering",
  },
  {
    id: "private-ai",
    label: "Deploy private AI",
    recommendedSystem: "Private AI Deployment",
    summary:
      "Open-weight models served inside your perimeter — cloud VPC or air-gapped — benchmarked before cutover.",
    flow: ["Sensitivity Classification", "Model Selection", "Inference Cluster", "Private RAG", "Hardening", "Operations"],
    solutionSlug: "private-ai",
    serviceSlug: "data-ai-infrastructure",
  },
  {
    id: "need-strategy",
    label: "Need AI strategy",
    recommendedSystem: "AI Strategy & Roadmap",
    summary:
      "Opportunity mapping, feasibility verdicts and a sequenced roadmap your board can fund with confidence.",
    flow: ["Executive Alignment", "Readiness Assessment", "Opportunity Scoring", "Architecture Direction", "Funded Roadmap"],
    solutionSlug: "enterprise-ai",
    serviceSlug: "ai-strategy",
  },
];

export function getOpportunity(id: string): Opportunity | undefined {
  return opportunities.find((o) => o.id === id);
}
