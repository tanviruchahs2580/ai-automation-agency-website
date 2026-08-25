import type { CaseStudy } from "@/types/content";

/**
 * These entries describe EXAMPLE ARCHITECTURES — reference implementations
 * showing how we approach a problem class. They are NOT claims of client
 * engagements and are labelled as such everywhere they appear.
 */

export const caseStudies: CaseStudy[] = [
  {
    slug: "invoice-processing-operations",
    title: "Invoice Processing Operations",
    industry: "Cross-industry · Finance operations",
    isExampleArchitecture: true,
    challenge:
      "Accounts payable teams manually key supplier invoices from email into ERP systems, check them line-by-line against purchase orders, and chase approvals across time zones. Processing cost per invoice stays high and payment terms are missed.",
    before: [
      "Invoices arrive via email in any format",
      "Manual data entry into the ERP",
      "Two-way match performed by eye",
      "Approvals chased by reply-all email",
      "Status visible only by asking AP staff",
    ],
    intervention: [
      "Shared intake mailbox with automatic attachment capture",
      "Document extraction pipeline with confidence thresholds",
      "Rules engine performing two/three-way matching",
      "Approval workflow integrated into Teams and email",
      "Exception queue for low-confidence or mismatched items",
    ],
    architecture: [
      "Intake service (mailbox + API)",
      "Extraction pipeline (OCR + layout model)",
      "Validation rules engine",
      "ERP integration via governed APIs",
      "Human approval queue",
      "Audit log & metrics store",
    ],
    technology: [
      "Python extraction services",
      "Node.js orchestration APIs",
      "PostgreSQL processing ledger",
      "Redis-backed job queues",
      "ERP connector layer",
      "Grafana-style operational dashboards",
    ],
    security: [
      "Supplier PII redacted from analytics",
      "Least-privilege ERP credentials per function",
      "Every write traceable to source document and rule version",
      "Encrypted document retention with defined lifecycle",
    ],
    monitoring: [
      "Extraction confidence tracked per supplier",
      "Match rate and exception ageing dashboards",
      "Alerting on queue backlog growth",
      "Weekly evaluation against sampled manual reviews",
    ],
    after: [
      "Straight-through processing for high-confidence invoices",
      "AP staff review only genuine exceptions",
      "Approval status visible to all stakeholders in real time",
      "Processing ledger supports audit on demand",
    ],
  },
  {
    slug: "support-triage-agents",
    title: "Customer Support Triage Agents",
    industry: "SaaS & Technology · Customer operations",
    isExampleArchitecture: true,
    challenge:
      "A growing product team faces rising support volume across chat, email and in-app messages. Response quality varies by agent, first response times slip during peaks, and engineers are interrupted constantly for reproducible questions.",
    before: [
      "Tickets triaged manually across three channels",
      "Answers inconsistent between agents",
      "Engineering pulled into repetitive questions",
      "Peak periods create multi-day backlogs",
    ],
    intervention: [
      "Tiered automation: instant answers, assisted replies, human routing",
      "Knowledge assistant grounded in documentation and changelogs",
      "Sentiment and complexity scoring driving escalation",
      "Draft replies prepared for agents instead of full autonomy",
    ],
    architecture: [
      "Channel adapters (chat, email, in-app)",
      "Intent classification service",
      "RAG knowledge layer over docs & tickets",
      "Agent assist workspace",
      "Escalation router to humans",
      "Quality sampling dashboard",
    ],
    technology: [
      "Model-routed generation (hosted APIs)",
      "Vector database over curated content",
      "Ticketing system bidirectional sync",
      "Evaluation harness with golden Q&A sets",
    ],
    security: [
      "Customer PII excluded from prompts where not required",
      "No autonomous account changes — read-only tool access",
      "Conversation logs access-controlled internally",
    ],
    monitoring: [
      "Answer groundedness sampled daily",
      "Deflection vs satisfaction tracked together (never deflection alone)",
      "Cost per resolution trended monthly",
    ],
    after: [
      "Routine questions resolved instantly with cited sources",
      "Agents handle complex cases with prepared context",
      "Engineers interrupted only for true defects",
      "Backlog absorbed during peaks without hiring spikes",
    ],
  },
  {
    slug: "private-knowledge-platform",
    title: "Private Knowledge Platform",
    industry: "Professional Services · Knowledge management",
    isExampleArchitecture: true,
    challenge:
      "A consultancy's project knowledge sits in document shares nobody can search effectively. Staff rebuild the same analysis repeatedly, and client confidentiality rules prohibit cloud AI tools.",
    before: [
      "Knowledge scattered across drives and inboxes",
      "Search returns filenames, not answers",
      "Repeated research billed to multiple clients",
      "Public AI tools prohibited by confidentiality policy",
    ],
    intervention: [
      "Self-hosted retrieval platform inside the firm's VPC",
      "Open-weight models served on private infrastructure",
      "Citation-first answer interface",
      "Information barriers enforced per engagement",
    ],
    architecture: [
      "Document ingestion & OCR pipeline",
      "Private embedding + vector store",
      "Self-hosted inference cluster (vLLM)",
      "Access-control-aware retrieval",
      "Answer UI with mandatory citations",
      "Usage audit reporting",
    ],
    technology: [
      "Llama / Qwen open-weight models",
      "vLLM inference servers",
      "Self-hosted vector database",
      "SSO-integrated gateway",
    ],
    security: [
      "Zero external egress for classified content",
      "Per-engagement information barriers tested in CI",
      "Query logs retained for compliance review",
      "Customer-managed encryption keys",
    ],
    monitoring: [
      "Retrieval precision reviewed weekly",
      "Model drift checks against benchmark set",
      "GPU utilisation and cost per query tracked",
    ],
    after: [
      "Staff ask questions instead of guessing filenames",
      "Prior work resurfaces automatically",
      "Confidentiality policy fully preserved",
      "Infrastructure owned by the firm, not a vendor",
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
