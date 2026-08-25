export interface TechnologyCategory {
  heading: string;
  note: string;
  items: Array<{ name: string; detail: string }>;
}

/**
 * Technology ecosystem — capability mapping, not a partnership claim.
 * Inclusion describes what we engineer with, never vendor endorsement.
 */

export const technologyCategories: TechnologyCategory[] = [
  {
    heading: "Models",
    note: "Selected per task through our routing gateway — never hard-wired.",
    items: [
      { name: "OpenAI", detail: "Frontier reasoning & multimodal tasks" },
      { name: "Anthropic", detail: "Long-context analysis & agentic work" },
      { name: "Google", detail: "Multimodal and search-grounded use-cases" },
      { name: "Qwen", detail: "Open-weight option for private deployment" },
      { name: "Llama", detail: "Self-hosted inference inside your perimeter" },
      { name: "Mistral", detail: "Efficient European-hostable models" },
      { name: "Open-source models", detail: "Purpose-built smaller models per task" },
    ],
  },
  {
    heading: "Infrastructure",
    note: "Deployed wherever your data policy requires.",
    items: [
      { name: "AWS", detail: "Managed cloud landing zones & GPU capacity" },
      { name: "Azure", detail: "Enterprise Microsoft environments" },
      { name: "Google Cloud", detail: "Data platforms & AI tooling" },
      { name: "Private Cloud", detail: "Dedicated VPCs with customer-managed keys" },
      { name: "On-premise", detail: "Air-gapped capable deployments" },
    ],
  },
  {
    heading: "AI Stack",
    note: "The engineering layer that turns models into reliable systems.",
    items: [
      { name: "RAG", detail: "Permission-aware retrieval pipelines" },
      { name: "Vector databases", detail: "pgvector, dedicated engines as needed" },
      { name: "Agent frameworks", detail: "Orchestration with bounded autonomy" },
      { name: "MCP", detail: "Standardised tool connectivity" },
      { name: "Model routing", detail: "Cost- and capability-aware gateways" },
      { name: "Evaluation", detail: "Golden datasets & regression gates" },
      { name: "Observability", detail: "Tracing, metrics and drift detection" },
      { name: "Memory", detail: "Task-scoped state with retention rules" },
    ],
  },
  {
    heading: "Business Systems",
    note: "We integrate what you already run — through governed APIs.",
    items: [
      { name: "Salesforce", detail: "CRM workflows & data sync" },
      { name: "HubSpot", detail: "Marketing & sales automation" },
      { name: "SAP", detail: "ERP processes & master data" },
      { name: "Microsoft", detail: "Teams, SharePoint, Dynamics, Graph" },
      { name: "Google Workspace", detail: "Docs, Drive, Gmail automation" },
      { name: "Slack", detail: "Approvals, alerts & assistant surfaces" },
      { name: "WhatsApp Business", detail: "Customer-facing messaging flows" },
      { name: "ERP / CRM / Custom APIs", detail: "Whatever your operation runs on" },
    ],
  },
];

export const coreStatement = "Model-agnostic. Architecture-first.";
