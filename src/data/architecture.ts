export interface ArchitectureNode {
  id: string;
  label: string;
  role: string;
  business: string;
  technical: string;
}

/** Interactive system diagram — order matters (top → bottom flow). */
export const architectureNodes: ArchitectureNode[] = [
  {
    id: "goal",
    label: "Business Goal",
    role: "The outcome everything serves",
    business:
      "Every layer below exists to move a named business metric — cycle time, cost, quality or capacity.",
    technical:
      "Encoded as measurable objectives that evaluation suites assert against on every release.",
  },
  {
    id: "orchestration",
    label: "Orchestration",
    role: "Routes work and enforces process",
    business:
      "Keeps automation aligned with how your operation actually runs, not how a demo flows.",
    technical:
      "State machines coordinating agents, retries, timeouts and escalation paths.",
  },
  {
    id: "agents",
    label: "AI Agents",
    role: "Do the cognitive work",
    business:
      "Handle judgment-heavy steps — classification, drafting, decision support — around the clock.",
    technical:
      "Specialised agents with scoped prompts, memory policies and model routing per task.",
  },
  {
    id: "models",
    label: "Models",
    role: "The reasoning engines",
    business:
      "Vendor choice becomes an economic decision, not an architectural lock-in.",
    technical:
      "Gateway routing across OpenAI, Anthropic, Google and open-weight models with fallbacks.",
  },
  {
    id: "tools",
    label: "Tools",
    role: "Hands on your systems",
    business:
      "Agents act where work lives: CRM, ERP, ticketing, documents — safely and logged.",
    technical:
      "Schema-validated tool registry with least-privilege credentials and approval gates.",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    role: "Grounded, cited context",
    business:
      "Answers reference your approved content — never invented facts.",
    technical:
      "RAG pipeline over permission-aware vector and keyword retrieval.",
  },
  {
    id: "data",
    label: "Data / Memory",
    role: "State across time",
    business:
      "Workflows survive restarts; customers aren't asked twice.",
    technical:
      "PostgreSQL systems of record plus task-scoped memory with retention rules.",
  },
  {
    id: "governance",
    label: "Governance & Security",
    role: "Rules enforced by architecture",
    business:
      "Policy compliance is structural, not aspirational — auditable by design.",
    technical:
      "Guardrails, PII redaction, RBAC and policy-as-code applied at runtime.",
  },
  {
    id: "human",
    label: "Human Approval",
    role: "Judgment where it matters",
    business:
      "People stay accountable for consequential decisions; machines handle the rest.",
    technical:
      "Risk-tiered approval queues integrated into Slack/Teams/email.",
  },
  {
    id: "systems",
    label: "Business Systems",
    role: "Systems of record",
    business:
      "Your existing platforms remain the source of truth — AI works through them.",
    technical:
      "Governed API integrations with write auditing and rollback procedures.",
  },
  {
    id: "observability",
    label: "Observability",
    role: "See everything running",
    business:
      "Operational confidence: costs, quality and throughput visible in real time.",
    technical:
      "Traces of every prompt/tool/output; metrics and alerting on SLOs.",
  },
  {
    id: "qa",
    label: "Continuous QA",
    role: "Quality that doesn't decay",
    business:
      "Improvements compound because regressions are caught before customers notice.",
    technical:
      "Golden datasets, scheduled evaluations and regression gates in CI/CD.",
  },
];

export interface AgentStage {
  index: string;
  name: string;
  plain: string;
  example: string;
  layer: string;
  implication: string;
}

export const agentStages: AgentStage[] = [
  {
    index: "01",
    name: "Observe",
    plain: "The agent notices something new arrived.",
    example: "A supplier email lands with an attached invoice.",
    layer: "Event intake & channel adapters",
    implication: "Work enters the system instantly — no waiting for someone to check a shared inbox.",
  },
  {
    index: "02",
    name: "Understand",
    plain: "It figures out what the thing is and what it needs.",
    example: "Extracts supplier, amounts, line items and due date from the PDF.",
    layer: "Extraction & entity resolution",
    implication: "Unstructured input becomes structured data you can act on.",
  },
  {
    index: "03",
    name: "Reason",
    plain: "It decides what should happen next.",
    example: "Matches invoice against PO #4471; totals differ by $12.50.",
    layer: "Planning & policy evaluation",
    implication: "Judgment follows encoded business policy, not improvisation.",
  },
  {
    index: "04",
    name: "Plan",
    plain: "It lays out the steps required.",
    example: "Flag mismatch → request credit note → schedule payment for matched lines.",
    layer: "Task decomposition & tool selection",
    implication: "Complex processes decompose without human coordination overhead.",
  },
  {
    index: "05",
    name: "Execute",
    plain: "It does the safe parts automatically.",
    example: "Posts matched lines to the ERP via its governed API.",
    layer: "Tool execution with scoped credentials",
    implication: "Routine work completes in seconds instead of days.",
  },
  {
    index: "06",
    name: "Verify",
    plain: "It checks its own work against the rules.",
    example: "Confirms ERP acknowledgement matches expected ledger state.",
    layer: "Output validation & evaluation checks",
    implication: "Errors are caught at machine speed, not at month-end reconciliation.",
  },
  {
    index: "07",
    name: "Escalate",
    plain: "When unsure or when stakes are high, it asks a person.",
    example: "$12.50 mismatch routed to AP lead with both documents side-by-side.",
    layer: "Approval queues & notification",
    implication: "Humans spend attention only where judgment genuinely adds value.",
  },
  {
    index: "08",
    name: "Learn",
    plain: "Every case makes the next one better.",
    example: "AP lead's resolution becomes a policy rule for future mismatches.",
    layer: "Feedback capture & evaluation updates",
    implication: "The system compounds in value as it operates.",
  },
];

export interface RiskTier {
  level: string;
  handling: string;
  description: string;
  examples: string;
}

export const riskTiers: RiskTier[] = [
  {
    level: "Low risk",
    handling: "AI auto-executes",
    description:
      "Reversible, internal, low-value actions run immediately. Speed is the point.",
    examples: "Tagging tickets, extracting data, preparing drafts, updating dashboards.",
  },
  {
    level: "Medium risk",
    handling: "AI + monitoring",
    description:
      "Actions execute but trigger alerts and sampled human review on outcomes.",
    examples: "Customer replies from templates, status updates, standard reports.",
  },
  {
    level: "High risk",
    handling: "AI prepares · Human approves",
    description:
      "Anything irreversible, financial or client-facing stops at a named approver.",
    examples: "Payments, contract terms, data deletion, external commitments.",
  },
];

export const governanceChain = [
  { step: "Model", control: "Approved providers & versions only" },
  { step: "Policy", control: "Business rules encoded as configuration" },
  { step: "Guardrails", control: "Input screening & output validation" },
  { step: "Agent", control: "Scoped prompts, bounded autonomy" },
  { step: "Tool", control: "Least-privilege, schema-validated access" },
  { step: "Action", control: "Risk-tiered execution path" },
  { step: "Human Approval", control: "Named sign-off above threshold" },
  { step: "Audit Log", control: "Immutable record of every decision" },
];

export const beforeAfterPairs = [
  { area: "Intake", before: "Email & phone tag", after: "Validated digital intake" },
  { area: "Processing", before: "Spreadsheet copy-paste", after: "Agent + rules engine" },
  { area: "Decisions", before: "Everything waits for review", after: "Only high-risk items do" },
  { area: "Data", before: "Retyped between systems", after: "API-synced once" },
  { area: "Reporting", before: "Manual monthly decks", after: "Live dashboards" },
  { area: "Audit", before: "Reconstructing history", after: "Complete event log" },
];

export interface ProcessPhase {
  index: string;
  name: string;
  duration: string;
  detail: string;
}

export const processPhases: ProcessPhase[] = [
  {
    index: "01",
    name: "Discover",
    duration: "1–2 weeks",
    detail:
      "Business and workflow analysis with the people who do the work. Output: prioritised opportunities with feasibility verdicts.",
  },
  {
    index: "02",
    name: "Architect",
    duration: "1–2 weeks",
    detail:
      "System design covering integration, security, risk tiers and evaluation strategy. Reviewed with your engineers.",
  },
  {
    index: "03",
    name: "Prototype",
    duration: "2–3 weeks",
    detail:
      "Rapid proof on real data inside constrained scope. Kill-or-commit decision with evidence.",
  },
  {
    index: "04",
    name: "Build",
    duration: "4–12 weeks",
    detail:
      "Production engineering in two-week increments: typed codebases, tests, CI/CD from the first commit.",
  },
  {
    index: "05",
    name: "Validate",
    duration: "1–2 weeks",
    detail:
      "QA, security review and AI evaluation against golden sets. Parallel-run where stakes demand it.",
  },
  {
    index: "06",
    name: "Deploy",
    duration: "Days",
    detail:
      "Staged rollout behind flags with monitoring live and rollback rehearsed before traffic arrives.",
  },
  {
    index: "07",
    name: "Operate",
    duration: "Ongoing",
    detail:
      "Monitoring, evaluations, incident response and tuning. Defined SLAs, named owners.",
  },
  {
    index: "08",
    name: "Optimize",
    duration: "Quarterly cycles",
    detail:
      "Cost, quality and coverage improvements driven by operational data — reported in business terms.",
  },
];

export const engineeringPrinciples = [
  {
    title: "Business before technology",
    detail: "Every engagement starts from a metric that must move, not a model to try.",
  },
  {
    title: "Production over prototypes",
    detail: "Demos persuade; systems deliver. We build for the second one.",
  },
  {
    title: "Architecture before code",
    detail: "Integration, failure modes and risk tiers are decided before implementation begins.",
  },
  {
    title: "Evidence over hype",
    detail: "Claims come from measurements. If we can't show it, we don't say it.",
  },
  {
    title: "Security by design",
    detail: "Threat models, least privilege and audit trails are part of definition-of-done.",
  },
  {
    title: "Human oversight where required",
    detail: "Autonomy is granted by risk tier, never assumed by default.",
  },
  {
    title: "Observable systems",
    detail: "If it isn't traced, evaluated and alertable, it isn't finished.",
  },
  {
    title: "Automated testing",
    detail: "Including for AI behaviour — golden sets run in CI like any other test suite.",
  },
  {
    title: "Vendor/model independence",
    detail: "Provider abstraction keeps your options open as the market shifts.",
  },
  {
    title: "Client ownership",
    detail: "Code, infrastructure definitions and knowledge transfer to you. Always.",
  },
];
