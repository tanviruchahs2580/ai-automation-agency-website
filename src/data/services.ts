import type { Service } from "@/types/content";

export const services: Service[] = [
  {
    slug: "ai-strategy",
    title: "AI Strategy",
    summary:
      "Decide where AI creates value in your business — and in what order — before spending on technology.",
    problem:
      "Most AI initiatives fail before any code is written: use-cases are chosen by hype, feasibility is untested, and nobody owns the outcome.",
    deliverables: [
      "AI opportunity map scored by value and feasibility",
      "Readiness assessment across process, data and governance",
      "Reference architecture for priority use-cases",
      "Sequenced roadmap with investment estimates",
    ],
    engagement: [
      "Executive interviews to define business objectives",
      "Process walkthroughs with operational teams",
      "Technical feasibility spikes on candidate use-cases",
      "Roadmap presentation with named owners and metrics",
    ],
    capabilities: [
      "Opportunity mapping",
      "Feasibility analysis",
      "Build-vs-buy evaluation",
      "Risk & governance framework design",
      "Transformation roadmap",
    ],
    technologies: [
      "Assessment frameworks",
      "Cost modelling tools",
      "Reference architectures",
      "Evaluation benchmarks",
    ],
    faq: [
      {
        question: "How long does a strategy engagement take?",
        answer:
          "Typically 4–8 weeks depending on organisational scope, ending in decisions you can act on immediately.",
      },
    ],
  },
  {
    slug: "ai-engineering",
    title: "AI Engineering",
    summary:
      "Production-grade engineering of AI systems: agents, RAG pipelines, copilots and the evaluation harnesses that keep them reliable.",
    problem:
      "Prototypes are easy; production is hard. Teams struggle with reliability, evaluation, cost control and safety once AI leaves the demo stage.",
    deliverables: [
      "Agent and RAG systems running in production",
      "Evaluation suites with regression gates",
      "Model routing and cost optimisation layer",
      "Prompt, context and memory architecture",
    ],
    engagement: [
      "Architecture design with your engineers present",
      "Iterative delivery in two-week increments",
      "Evaluation-driven acceptance criteria",
      "Handover documentation and pairing",
    ],
    capabilities: [
      "Autonomous agents & multi-agent orchestration",
      "RAG and knowledge systems",
      "Copilots embedded into existing products",
      "Model routing & abstraction",
      "Evaluation and observability",
    ],
    technologies: [
      "OpenAI, Anthropic, Google, open-weight models",
      "Vector databases and retrieval infrastructure",
      "MCP tool protocols",
      "Tracing and evaluation platforms",
    ],
    faq: [
      {
        question: "Do you lock us into one model provider?",
        answer:
          "No. Model access sits behind an internal gateway so providers can be swapped per task as pricing and capability change.",
      },
    ],
  },
  {
    slug: "automation",
    title: "Automation Engineering",
    summary:
      "Business processes automated end-to-end — document processing, approvals, data flows and reporting connected across your systems.",
    problem:
      "Manual coordination between systems consumes skilled staff time and produces inconsistent data, yet each individual task seems too small to fix.",
    deliverables: [
      "Automated workflows across email, ERP, CRM and HRIS",
      "Document intake and extraction pipelines",
      "Approval and exception handling queues",
      "Operational dashboards replacing status meetings",
    ],
    engagement: [
      "Process discovery with the operators themselves",
      "Segment-by-segment automation design",
      "Parallel-run validation before cutover",
      "Hypercare after go-live",
    ],
    capabilities: [
      "Business process automation",
      "Intelligent document processing",
      "System integration (ERP, CRM, HRIS)",
      "Customer-facing workflow automation",
      "Reporting automation",
    ],
    technologies: [
      "Node.js / Python services",
      "Message queues and schedulers",
      "OCR + layout-aware extraction",
      "iPaaS and native APIs",
    ],
    faq: [
      {
        question: "What if our process changes after you automate it?",
        answer:
          "Flows are versioned and configurable by your team where practical; structural changes are handled through a lightweight change process.",
      },
    ],
  },
  {
    slug: "software-engineering",
    title: "Software Engineering",
    summary:
      "Custom web platforms, SaaS products and system modernisation built to production standards — typed, tested, observable.",
    problem:
      "Legacy systems block every AI ambition. And new software built without engineering discipline becomes tomorrow's legacy.",
    deliverables: [
      "New products from discovery through GA",
      "Modernisation of critical legacy applications",
      "API platforms and integration layers",
      "Internal tools your teams actually adopt",
    ],
    engagement: [
      "Technical audit before committing to change",
      "Two-week increments with working software",
      "CI/CD, tests and monitoring as standard scope",
      "Full IP transfer on completion",
    ],
    capabilities: [
      "Greenfield product development",
      "Legacy modernisation & replatforming",
      "API and integration engineering",
      "Performance and scalability work",
      "Engineering enablement for in-house teams",
    ],
    technologies: [
      "TypeScript, Next.js, Node.js",
      "PostgreSQL, Redis",
      "Playwright end-to-end testing",
      "Docker, cloud or on-prem targets",
    ],
    faq: [
      {
        question: "Can you work alongside our existing development team?",
        answer:
          "Yes — embedding with your team is our default delivery model, with shared repos, reviews and standards.",
      },
    ],
  },
  {
    slug: "data-ai-infrastructure",
    title: "Data & AI Infrastructure",
    summary:
      "The foundation AI runs on: data pipelines, vector stores, private inference clusters and the observability that proves they're healthy.",
    problem:
      "AI quality is capped by data and infrastructure quality. Without governed pipelines and observable serving, models degrade silently.",
    deliverables: [
      "Data pipelines feeding AI systems reliably",
      "Vector and knowledge infrastructure",
      "Private model serving environments",
      "Observability covering cost, latency and quality",
    ],
    engagement: [
      "Infrastructure audit against target workload",
      "Environment provisioning (cloud or on-premise)",
      "Load, cost and failure-mode testing",
      "Runbooks and team training",
    ],
    capabilities: [
      "RAG infrastructure",
      "Vector database selection & operation",
      "GPU cluster economics and scheduling",
      "Model routing gateways",
      "Monitoring, logging, tracing",
    ],
    technologies: [
      "PostgreSQL, Redis, object storage",
      "vLLM / TGI for self-hosted inference",
      "Kubernetes, Terraform",
      "OpenTelemetry-compatible stacks",
    ],
    faq: [
      {
        question: "Cloud or on-premise?",
        answer:
          "Whichever your data policy and cost profile demand — we operate both and hybrid patterns combining them.",
      },
    ],
  },
  {
    slug: "security",
    title: "AI Security",
    summary:
      "Security engineering for AI systems: isolation, access control, prompt-injection defence, secrets management and audit readiness.",
    problem:
      "AI widens the attack surface: untrusted input reaches powerful tools, sensitive data reaches third-party endpoints, and actions happen at machine speed.",
    deliverables: [
      "Threat model for your specific AI systems",
      "Guardrails: input screening, output filtering, tool scoping",
      "Secrets and key management architecture",
      "Audit logging satisfying client and regulator requests",
    ],
    engagement: [
      "Security review of existing AI usage (including shadow AI)",
      "Controls designed with your security team",
      "Penetration-style testing of agent boundaries",
      "Incident response playbooks for AI-specific failures",
    ],
    capabilities: [
      "Prompt injection mitigation",
      "PII detection and redaction pipelines",
      "RBAC and least-privilege tool access",
      "Vendor/model governance",
      "Compliance-aligned documentation",
    ],
    technologies: [
      "Policy engines and guardrail libraries",
      "Secret managers (Vault / cloud KMS)",
      "SIEM integration for AI events",
      "Dependency and container scanning",
    ],
    faq: [
      {
        question: "Can you guarantee prompt injection is impossible?",
        answer:
          "No honest engineer can. We reduce exposure architecturally — scoping tools, validating outputs, requiring approvals — and monitor for attempts continuously.",
      },
    ],
  },
  {
    slug: "ai-operations",
    title: "AI Operations",
    summary:
      "Your AI systems operated like production infrastructure: monitored, evaluated, tuned and improved — month after month.",
    problem:
      "AI systems drift. Models get deprecated, data shifts, costs creep, quality decays — usually noticed only after customers complain.",
    deliverables: [
      "24/7 monitoring of quality, latency and spend",
      "Scheduled evaluations against golden datasets",
      "Model upgrade management with regression gates",
      "Monthly optimisation reports in business language",
    ],
    engagement: [
      "Defined SLAs and escalation paths",
      "Change windows and rollback procedures",
      "Quarterly roadmap reviews",
      "Transparent incident postmortems",
    ],
    capabilities: [
      "Continuous evaluation",
      "Drift detection & retraining triggers",
      "Cost optimisation",
      "Incident response",
      "Lifecycle management",
    ],
    technologies: [
      "Evaluation harnesses",
      "Metrics and alerting stacks",
      "Versioned prompt & model registries",
      "Usage and cost analytics",
    ],
    faq: [
      {
        question: "Why do AI systems need ongoing operations?",
        answer:
          "Unlike traditional software, behaviour depends on external models and live data. Both change underneath you — operations is how quality stays deliberate instead of accidental.",
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
