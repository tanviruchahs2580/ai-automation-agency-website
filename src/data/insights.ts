import { slugify } from "@/lib/utils";
import type { Insight } from "@/types/content";

const raw: Array<Omit<Insight, "slug">> = [
  {
    title: "Why most AI pilots never reach production",
    excerpt:
      "The gap between demo and production is architectural, not intellectual. Here are the five failure modes we see most often — and what closes each one.",
    author: "VANTIQ Systems Engineering Team", // PLACEHOLDER authorship
    authorRole: "AI Engineering",
    category: "Enterprise AI",
    tags: ["production", "architecture", "evaluation"],
    publishedAt: "2026-07-14",
    sections: [
      {
        heading: "1. No definition of 'working'",
        paragraphs: [
          "A pilot succeeds when it impresses a person; a system succeeds when it meets a measurable standard continuously. Without an evaluation set and acceptance thresholds, there is no way to know whether the AI is improving or degrading.",
          "Before writing code, we define golden test cases drawn from real work, agree on pass rates, and wire them into CI. This turns vague optimism into an engineering target.",
        ],
      },
      {
        heading: "2. The demo path is the only path",
        paragraphs: [
          "Demos show the happy path. Production traffic contains malformed inputs, adversarial phrasing, missing context and edge cases nobody anticipated. Systems need explicit handling for every failure mode: retry, degrade, escalate.",
          "Our architecture standard includes an escalation route for uncertainty — because a system that admits doubt is more trustworthy than one that guesses confidently.",
        ],
      },
      {
        heading: "3. Data access was never actually solved",
        paragraphs: [
          "The model is rarely the bottleneck; retrieval is. If the right document isn't in the vector store, has stale permissions, or can't be cited, output quality caps out regardless of which model you pay for.",
          "We treat ingestion pipelines, permission mirrors and freshness SLAs as first-class engineering deliverables, equal to the application itself.",
        ],
      },
      {
        heading: "4. Nobody owns it after launch",
        paragraphs: [
          "AI systems drift as models get deprecated, data shifts, and usage patterns change. Assigning ownership, monitoring and a tuning budget after go-live is what separates deployed from maintained.",
          "This is why every build engagement includes an operations plan — monitored metrics, alert thresholds, and a named team responsible for both.",
        ],
      },
      {
        heading: "5. Risk wasn't classified up front",
        paragraphs: [
          "When every action needs approval, automation saves nothing; when nothing does, someone eventually gets hurt. Classifying actions by risk at design time lets low-risk steps run freely while high-risk ones keep humans in charge.",
          "Risk classification is cheap early and expensive late. It belongs in week one.",
        ],
      },
    ],
  },
  {
    title: "Designing agent tools: least privilege in practice",
    excerpt:
      "An agent is only as safe as the tools it can reach. A practical framework for scoping, validating and monitoring tool access.",
    author: "VANTIQ Systems Engineering Team",
    authorRole: "AI Security",
    category: "Agentic Systems",
    tags: ["agents", "security", "tools"],
    publishedAt: "2026-06-30",
    sections: [
      {
        heading: "Tools are permissions",
        paragraphs: [
          "Every tool you register with an agent is an API key with a personality. Treating tool definitions as security objects — with owners, scopes and audit trails — prevents the most common agent incidents.",
          "Start by separating read tools from write tools. Most agent value comes from reading and drafting; writes deserve their own review gates.",
        ],
      },
      {
        heading: "Validate inputs like an API boundary",
        paragraphs: [
          "LLMs produce plausible but wrong arguments. Every tool should validate its inputs with schemas, reject unknown fields, and enforce range checks — exactly as you would for a public endpoint.",
          "Where a wrong value could cause damage (payments, deletions, external emails), require confirmation tokens issued through the approval flow rather than trusting the model's plan.",
        ],
      },
      {
        heading: "Log the loop, not just the action",
        paragraphs: [
          "Auditing only executed actions misses the reasoning that led there. Capture the prompt, retrieved context, plan, tool calls and outputs — then you can reconstruct any decision when a client, auditor or engineer asks why.",
          "Structured traces also power evaluation: replaying historical decisions against new models is how you upgrade safely.",
        ],
      },
    ],
  },
  {
    title: "RAG without the hype: what retrieval actually fixes",
    excerpt:
      "Retrieval-augmented generation grounds models in your content. It doesn't fix reasoning, freshness or permissions by itself. An honest breakdown.",
    author: "VANTIQ Systems Engineering Team",
    authorRole: "AI Engineering",
    category: "AI Engineering",
    tags: ["rag", "retrieval", "knowledge"],
    publishedAt: "2026-06-12",
    sections: [
      {
        heading: "What RAG genuinely solves",
        paragraphs: [
          "Grounding: answers based on documents that exist, with citations users can verify. For enterprise knowledge, this alone justifies the infrastructure.",
          "It also reduces memorisation pressure on the model — factual accuracy shifts from weights to retrievable evidence that can be audited and corrected.",
        ],
      },
      {
        heading: "What RAG does not solve",
        paragraphs: [
          "Permissions: if your vector store ignores ACLs, RAG becomes an exfiltration channel. Retrieval must mirror source-system permissions at query time.",
          "Reasoning: retrieval supplies evidence, not logic. Multi-step analytical questions need orchestration and verification layers beyond simple top-k lookup.",
        ],
      },
      {
        heading: "The unglamorous parts that matter",
        paragraphs: [
          "Chunking strategy, metadata hygiene, re-ranking and evaluation sets determine most of the quality difference between disappointing and excellent systems.",
          "Budget accordingly: in our builds, retrieval engineering typically outweighs prompt engineering several times over — and pays for itself in reliability.",
        ],
      },
    ],
  },
  {
    title: "The economics of model routing",
    excerpt:
      "Sending every token to the most capable model is the most expensive way to run AI. Routing by task changes unit economics dramatically.",
    author: "VANTIQ Systems Engineering Team",
    authorRole: "AI Economics",
    category: "AI Economics",
    tags: ["cost", "routing", "models"],
    publishedAt: "2026-05-21",
    sections: [
      {
        heading: "Not every task needs the frontier",
        paragraphs: [
          "Classification, extraction and formatting tasks are routinely handled by small, fast models at a fraction of the cost. Reserving flagship models for planning and complex judgement keeps quality where it matters.",
          "The pattern: measure task difficulty signals at runtime, route accordingly, and sample outputs for continuous comparison.",
        ],
      },
      {
        heading: "Routing is an architecture, not a config flag",
        paragraphs: [
          "Effective routing needs a gateway that understands per-task budgets, fallbacks, caching and provider health. Building it once serves every future feature.",
          "It also hedges vendor risk: when providers change pricing or policies, your products adapt in configuration rather than code rewrites.",
        ],
      },
      {
        heading: "Measure cost per outcome",
        paragraphs: [
          "Token prices mislead; cost per resolved ticket, processed document or completed workflow is what finance cares about. Instrument outcomes, not usage.",
          "Teams that track cost-per-outcome typically find double-digit percentage savings within the first quarter of routing discipline — savings that scale with success rather than being capped by it.",
        ],
      },
    ],
  },
  {
    title: "Prompt injection: honest threats, honest defences",
    excerpt:
      "You cannot fully prevent prompt injection today. You can architect systems where attempts fail safely. Here's our control hierarchy.",
    author: "VANTIQ Systems Engineering Team",
    authorRole: "AI Security",
    category: "AI Security",
    tags: ["security", "prompt-injection"],
    publishedAt: "2026-05-02",
    sections: [
      {
        heading: "Assume the injection arrives",
        paragraphs: [
          "Untrusted text — emails, web pages, documents, tickets — will eventually contain instructions aimed at your model. Screening helps; architecture decides whether an attempt matters.",
          "The question is not 'can we detect malicious input?' but 'what can the agent do if detection fails?'",
        ],
      },
      {
        heading: "Defence in depth, ordered by reliability",
        paragraphs: [
          "First, capability limits: agents hold no standing credentials, so stolen instructions have nothing to steal. Second, tool validation: even convincing instructions cannot bypass schema checks. Third, human gates: consequential actions queue for approval regardless of confidence.",
          "Screening classifiers sit at the edge as an early filter — valuable, but treated as one layer among four.",
        ],
      },
      {
        heading: "Prove it with tests",
        paragraphs: [
          "We maintain adversarial corpora targeting each system's tools and run them in CI like regression suites. New guardrails must demonstrate measurable resistance, not intent.",
          "Security claims without test evidence are marketing. Ask any vendor — including us — how injection attempts are measured, not merely prevented.",
        ],
      },
    ],
  },
  {
    title: "Choosing what to automate first",
    excerpt:
      "A sequencing method for automation roadmaps: volume × variance × verifiability. Why boring processes make the best first projects.",
    author: "VANTIQ Systems Engineering Team",
    authorRole: "Automation",
    category: "Automation",
    tags: ["roadmap", "strategy", "process"],
    publishedAt: "2026-04-10",
    sections: [
      {
        heading: "Score candidates on three axes",
        paragraphs: [
          "Volume: hours consumed per month. Variance: how differently each instance behaves. Verifiability: can a correct result be checked mechanically?",
          "High volume, low variance, high verifiability is the sweet spot — invoice matching beats executive email triage every time.",
        ],
      },
      {
        heading: "Respect the trust curve",
        paragraphs: [
          "Early wins fund later ambition. A first automation that quietly works for ninety days earns adoption that no launch campaign can buy.",
          "Ambitious-but-risky ideas belong third or fourth in the roadmap, after the organisation has seen automation behave predictably.",
        ],
      },
      {
        heading: "Instrument before you automate",
        paragraphs: [
          "If cycle time, error rate and volume aren't measured today, add measurement first. Automating an unmeasured process makes benefits unfalsifiable.",
          "Baselines turn stakeholder conversations from opinion battles into arithmetic — and they tell you when the automation has paid for itself.",
        ],
      },
    ],
  },
];

export const insights: Insight[] = raw.map((item) => ({
  ...item,
  slug: slugify(item.title),
}));

export const insightCategories = Array.from(
  new Set(insights.map((i) => i.category)),
);

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}

export function readingTimeMinutes(insight: Insight): number {
  const words = insight.sections
    .flatMap((s) => s.paragraphs)
    .join(" ")
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}
