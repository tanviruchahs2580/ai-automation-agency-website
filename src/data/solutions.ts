import type { Solution } from "@/types/content";

export const solutions: Solution[] = [
  {
    slug: "ai-agents",
    title: "AI Agents",
    summary:
      "Autonomous and semi-autonomous agents that execute operational work inside your systems — with human approval exactly where it matters.",
    problem:
      "Teams lose hours every week coordinating work between email, spreadsheets, ERPs and CRMs. Hiring doesn't scale that coordination, and generic chatbots can't be trusted with it either.",
    businessImpact: [
      "Repetitive coordination work is executed by agents instead of people",
      "Response times drop from hours to seconds on routine requests",
      "Staff attention shifts to exceptions and judgment calls",
      "Every action is logged, auditable and reversible",
    ],
    approach: [
      "Map the workflow end-to-end before any model is chosen",
      "Classify actions by risk: auto-execute, monitored, human-approved",
      "Give agents narrowly scoped tools — never unrestricted system access",
      "Evaluate agent behaviour continuously against golden test sets",
    ],
    architecture: [
      "Business goal & policy definition",
      "Orchestrator routing work across specialised agents",
      "Tool layer connected to CRM, ERP, ticketing and documents",
      "Knowledge layer with retrieval over your approved sources",
      "Human approval checkpoints for high-risk actions",
      "Audit log and observability across every decision",
    ],
    workflow: [
      {
        step: "Observe",
        detail: "Agent receives an event — an email, ticket, form or record.",
      },
      {
        step: "Understand",
        detail: "Intent, entities and context are extracted and validated.",
      },
      {
        step: "Reason",
        detail: "The agent plans which tools and knowledge to use.",
      },
      {
        step: "Execute",
        detail: "Scoped tool calls update systems of record.",
      },
      {
        step: "Verify",
        detail: "Outputs are checked against policies and evaluation suites.",
      },
      {
        step: "Escalate",
        detail: "Uncertain or high-risk cases go to a human queue.",
      },
    ],
    technologies: [
      "Model router (OpenAI, Anthropic, Google, open-source)",
      "Agent orchestration framework",
      "MCP-compatible tool registry",
      "Vector database + RAG",
      "Evaluation & tracing stack",
    ],
    security: [
      "Per-tool permission scopes and read/write separation",
      "Prompt-injection screening on untrusted input",
      "Full audit trail of prompts, tools and outputs",
      "PII redaction before data reaches any external model",
    ],
    implementation: [
      "Workflow discovery and risk classification",
      "Pilot agent on one constrained process",
      "Evaluation harness and approval flows",
      "Production hardening and rollout",
      "Ongoing operations and tuning",
    ],
    faq: [
      {
        question: "Will agents act without human oversight?",
        answer:
          "Only where you allow it. Actions are classified by risk: low-risk steps can run automatically, medium-risk runs with monitoring, high-risk requires explicit human approval.",
      },
      {
        question: "Which model do agents use?",
        answer:
          "Whichever fits each task best. Our orchestration layer is model-agnostic, so agents route between providers and open-source models without rewrites.",
      },
    ],
  },
  {
    slug: "workflow-automation",
    title: "Workflow Automation",
    summary:
      "End-to-end automation of business processes — documents, approvals, data entry and reporting — connected directly to the systems you already run.",
    problem:
      "Critical processes still run through inboxes and spreadsheets. Work stalls waiting for reviews, data gets retyped between systems, and nobody has a reliable view of where items actually are.",
    businessImpact: [
      "Cycle times shrink because handoffs stop waiting on humans",
      "Data quality improves as re-typing disappears",
      "Process status becomes visible instead of tribal knowledge",
      "Capacity grows without proportional headcount growth",
    ],
    approach: [
      "Document the current process with the people who run it",
      "Automate the highest-volume, lowest-judgment segments first",
      "Keep humans at decision points that require context",
      "Instrument everything so improvements are measurable",
    ],
    architecture: [
      "Intake layer (email, forms, EDI, APIs)",
      "Validation & enrichment services",
      "Rules engine plus AI classification where structure is missing",
      "Approval queues integrated with Slack / Teams / email",
      "System-of-record writes via governed APIs",
      "Dashboards for throughput, exceptions and SLAs",
    ],
    workflow: [
      {
        step: "Capture",
        detail: "Documents and events enter through validated intake channels.",
      },
      {
        step: "Extract",
        detail: "Structured data is pulled from unstructured inputs.",
      },
      {
        step: "Validate",
        detail: "Business rules check completeness and consistency.",
      },
      {
        step: "Route",
        detail: "Items move to the right queue — automated or human.",
      },
      {
        step: "Post",
        detail: "Approved results are written back to systems of record.",
      },
      {
        step: "Report",
        detail: "Live metrics replace manual status meetings.",
      },
    ],
    technologies: [
      "Document processing (OCR + layout-aware extraction)",
      "Node.js / Python automation services",
      "Queue-based processing (Redis / cloud queues)",
      "ERP, CRM and HRIS integrations",
      "Observability dashboards",
    ],
    security: [
      "Least-privilege integration credentials",
      "Encrypted document storage with retention policies",
      "Immutable audit logs of every automated action",
      "Environment isolation between test and production",
    ],
    implementation: [
      "Process inventory and prioritisation",
      "Automation design per process segment",
      "Iterative delivery with operator feedback",
      "Parallel-run validation against manual output",
      "Cutover, training and hypercare",
    ],
    faq: [
      {
        question: "Do we have to replace our existing software?",
        answer:
          "No. Automation connects to your existing systems through their APIs. We replace copy-paste between them, not the systems themselves.",
      },
      {
        question: "How do you handle exceptions?",
        answer:
          "Every flow defines an exception path: items the system cannot confidently handle are routed to a human review queue with full context attached.",
      },
    ],
  },
  {
    slug: "ai-software",
    title: "AI Software",
    summary:
      "Custom AI products and internal platforms — SaaS applications, copilots and intelligent tools engineered to production standards.",
    problem:
      "Off-the-shelf AI features rarely fit regulated processes, proprietary data or real workflows. But building custom software with AI inside demands engineering discipline most teams are still staffing for.",
    businessImpact: [
      "Software that encodes how your business actually works",
      "AI features your customers and staff can rely on daily",
      "One platform instead of fragmented point solutions",
      "You own the code, data and roadmap",
    ],
    approach: [
      "Product discovery grounded in user workflows, not demos",
      "Architecture designed for model changes over time",
      "Typed, tested codebases with CI from day one",
      "Ship thin slices to real users early and iterate",
    ],
    architecture: [
      "Next.js / React application layer",
      "API services with schema validation",
      "PostgreSQL system of record",
      "AI service layer with model abstraction",
      "Background workers for long-running tasks",
      "Feature flags and staged rollout infrastructure",
    ],
    workflow: [
      {
        step: "Discover",
        detail: "User research and technical feasibility in one sprint.",
      },
      {
        step: "Architect",
        detail: "System design reviewed against scale and security needs.",
      },
      {
        step: "Build",
        detail: "Two-week increments, each shippable and demoable.",
      },
      {
        step: "Validate",
        detail: "Automated tests plus structured AI evaluations.",
      },
      {
        step: "Release",
        detail: "Staged rollouts behind flags with rollback paths.",
      },
      {
        step: "Operate",
        detail: "Monitoring, support SLAs and continuous optimisation.",
      },
    ],
    technologies: [
      "TypeScript end-to-end",
      "Next.js, Node.js, FastAPI where Python fits better",
      "PostgreSQL, Redis",
      "Vitest / Playwright test stacks",
      "Cloud or on-premise deployment targets",
    ],
    security: [
      "Secure SDLC: dependency scanning, secret management, code review",
      "Role-based access control built into the product",
      "Tenant data isolation by design",
      "Security review gate before every major release",
    ],
    implementation: [
      "Discovery and product architecture",
      "Foundation sprint (CI/CD, environments, auth)",
      "Core feature increments",
      "Beta with controlled user group",
      "General availability and ongoing product operations",
    ],
    faq: [
      {
        question: "Who owns the intellectual property?",
        answer:
          "You do. Code, infrastructure definitions and documentation are delivered into repositories you control.",
      },
      {
        question: "Can you take over an existing codebase?",
        answer:
          "Yes. Engagements often start with a technical audit that produces a stabilisation plan before new feature work begins.",
      },
    ],
  },
  {
    slug: "enterprise-ai",
    title: "Enterprise AI",
    summary:
      "Organisation-scale AI programs: portfolio strategy, shared platforms, governance and the operating model that takes AI from experiments to production.",
    problem:
      "Enterprises accumulate disconnected AI experiments — pilots that never reach production, shadow tools with uncontrolled data access, and no shared foundation to build on.",
    businessImpact: [
      "A prioritised AI portfolio tied to business cases",
      "Shared infrastructure reused across initiatives",
      "Consistent governance instead of per-project improvisation",
      "Faster delivery as patterns and platforms mature",
    ],
    approach: [
      "Assess readiness across process, data, technology and people",
      "Define reference architectures and paved-road platforms",
      "Establish evaluation and risk frameworks centrally",
      "Deliver flagship projects alongside platform build-out",
    ],
    architecture: [
      "Central model gateway with usage controls",
      "Shared retrieval and knowledge infrastructure",
      "Reusable agent and tool components",
      "Org-wide observability and evaluation baselines",
      "Policy-as-code guardrails applied at deploy time",
      "Enablement program for internal teams",
    ],
    workflow: [
      {
        step: "Assess",
        detail: "Readiness across domains with quantified gaps.",
      },
      {
        step: "Prioritise",
        detail: "Use-cases ranked by value and feasibility.",
      },
      {
        step: "Found",
        detail: "Platform foundations and governance baseline.",
      },
      {
        step: "Prove",
        detail: "Flagship use-case delivered to production.",
      },
      {
        step: "Scale",
        detail: "Patterns packaged for team self-service.",
      },
      {
        step: "Operate",
        detail: "Portfolio-level monitoring and optimisation.",
      },
    ],
    technologies: [
      "Cloud landing zones (AWS, Azure, GCP)",
      "Private model serving options",
      "Enterprise identity (SSO, RBAC)",
      "Data platforms and warehouses",
      "Evaluation and compliance reporting tooling",
    ],
    security: [
      "Data classification driving model routing rules",
      "Central secrets and key management",
      "Regulatory mapping (GDPR, EU AI Act readiness)",
      "Vendor exit strategies documented per component",
    ],
    implementation: [
      "Executive alignment and scope definition",
      "Readiness assessment (6–8 weeks)",
      "Target architecture and operating model",
      "Flagship delivery with embedded enablement",
      "Quarterly portfolio reviews",
    ],
    faq: [
      {
        question: "We already have an IT team. How do you work with them?",
        answer:
          "As an extension of it. Your engineers get access to everything we build, paired during delivery, and trained on the platforms — so capability stays in-house.",
      },
      {
        question: "How is this different from buying an AI platform?",
        answer:
          "Platforms provide components; they don't decide architecture, integrate your processes or take responsibility for production outcomes. We do the engineering around the platform.",
      },
    ],
  },
  {
    slug: "private-ai",
    title: "Private AI",
    summary:
      "Deploy open-source and hosted models inside your own perimeter — cloud VPC or on-premise — so sensitive data never leaves your control.",
    problem:
      "Regulated data, client confidentiality and sovereignty requirements rule out sending everything to public AI endpoints. Yet most private deployments fail on cost, quality or operability when attempted alone.",
    businessImpact: [
      "Sensitive data stays within your security boundary",
      "Predictable costs without per-token vendor lock-in",
      "Independence from single-vendor pricing and policy changes",
      "Deployment patterns auditable for regulators and clients",
    ],
    approach: [
      "Classify workloads by data sensitivity first",
      "Match model size to task — not to marketing benchmarks",
      "Engineer for GPU efficiency and batching economics",
      "Prove parity against hosted baselines before cutover",
    ],
    architecture: [
      "Inference cluster (Kubernetes or dedicated GPU hosts)",
      "Open-weight models: Llama, Qwen, Mistral families",
      "Embedding and reranking pipeline on private vectors",
      "Gateway enforcing authentication, quotas and logging",
      "Air-gapped option with local artifact registries",
      "Drift detection and scheduled model refresh",
    ],
    workflow: [
      {
        step: "Classify",
        detail: "Data and workflows mapped to sensitivity tiers.",
      },
      {
        step: "Select",
        detail: "Candidate models benchmarked on your tasks.",
      },
      {
        step: "Deploy",
        detail: "Infrastructure provisioned inside your perimeter.",
      },
      {
        step: "Validate",
        detail: "Quality compared against hosted references.",
      },
      {
        step: "Harden",
        detail: "Access, monitoring and backup controls applied.",
      },
      {
        step: "Operate",
        detail: "Capacity, cost and drift managed continuously.",
      },
    ],
    technologies: [
      "vLLM / TGI inference servers",
      "Llama, Qwen, Mistral, embedding models",
      "Self-hosted vector databases",
      "On-prem Kubernetes or bare-metal GPU",
      "Optional hybrid routing to hosted APIs for low-sensitivity work",
    ],
    security: [
      "No external egress for classified workloads",
      "Customer-managed encryption keys",
      "Network segmentation and private endpoints",
      "Supply-chain verification of all model artifacts",
    ],
    implementation: [
      "Sensitivity and workload assessment",
      "Reference deployment in your environment",
      "Benchmark and parity validation",
      "Production hardening and handover",
      "Managed operation or team enablement",
    ],
    faq: [
      {
        question: "Are open-weight models good enough for production?",
        answer:
          "For many workloads — classification, extraction, summarisation, retrieval-grounded answers — yes. We validate against your tasks before committing, and keep hybrid routing where hosted models genuinely win.",
      },
      {
        question: "Can this run fully air-gapped?",
        answer:
          "Yes. With locally hosted models, vector stores and artifact registries, no traffic leaves your network.",
      },
    ],
  },
  {
    slug: "ai-transformation",
    title: "AI Transformation",
    summary:
      "Multi-quarter programs that rewire how a business operates with AI — strategy, delivery and change management under one accountable plan.",
    problem:
      "Transformation efforts stall when strategy decks meet organisational reality: unclear ownership, legacy integration debt and staff who don't trust the new tooling.",
    businessImpact: [
      "Sequenced roadmap with owned, funded initiatives",
      "Measurable process changes, not slideware",
      "Workforce adoption built into delivery",
      "Compounding capability as each release lands",
    ],
    approach: [
      "Anchor every initiative to a named operational metric",
      "Sequence by dependency, not enthusiasm",
      "Build change management into every rollout",
      "Report progress in business terms monthly",
    ],
    architecture: [
      "Value-stream map across departments",
      "Integration backbone connecting legacy and modern systems",
      "Shared AI services consumed by multiple initiatives",
      "Data quality program feeding all downstream use-cases",
      "Governance board with defined decision rights",
      "Benefits-tracking dashboard owned by the business",
    ],
    workflow: [
      {
        step: "Align",
        detail: "Leadership agrees outcomes and investment envelope.",
      },
      {
        step: "Map",
        detail: "Value streams and pain points documented together.",
      },
      {
        step: "Sequence",
        detail: "Initiatives ordered by impact and readiness.",
      },
      {
        step: "Deliver",
        detail: "First releases land with training and support.",
      },
      {
        step: "Adopt",
        detail: "Usage measured; resistance addressed directly.",
      },
      {
        step: "Compound",
        detail: "Learnings accelerate subsequent waves.",
      },
    ],
    technologies: [
      "Portfolio and benefits tracking",
      "Integration platform (iPaaS or custom APIs)",
      "Master data management",
      "Change-enablement tooling and analytics",
      "Program-level observability",
    ],
    security: [
      "Security architecture reviewed at program start",
      "Data-handling standards enforced across vendors",
      "Access certification cycles",
      "Audit-ready documentation of every system touched",
    ],
    implementation: [
      "Discovery and baseline metrics (4–6 weeks)",
      "Roadmap and governance setup",
      "Wave 1 delivery (highest-confidence wins)",
      "Wave 2+ scaling with platform reuse",
      "Continuous benefits reporting",
    ],
    faq: [
      {
        question: "How long before results are visible?",
        answer:
          "First wave initiatives are scoped to show operational movement within one quarter; structural benefits compound over 12–24 months.",
      },
      {
        question: "What does success look like?",
        answer:
          "Named processes running measurably faster with fewer errors, staff using new tooling by choice, and an internal team able to extend what we built.",
      },
    ],
  },
];

export function getSolution(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}
