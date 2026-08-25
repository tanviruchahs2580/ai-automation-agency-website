import type { Industry } from "@/types/content";

/**
 * KPI lists describe metrics an organisation should track — they never
 * claim results we have not verified.
 */

export const industries: Industry[] = [
  {
    slug: "financial-services",
    title: "Financial Services",
    summary:
      "Automation and AI for banking, insurance, fintech and investment firms — where accuracy and auditability are non-negotiable.",
    challenges: [
      "Manual document review slows underwriting and onboarding",
      "Regulatory reporting consumes specialist time",
      "Fraud patterns evolve faster than rule updates",
      "Client expectations for instant, accurate responses",
    ],
    opportunities: [
      "KYC/AML document processing with human review queues",
      "Regulatory change monitoring and impact mapping",
      "Anomaly detection supporting fraud teams",
      "Advisory copilots grounded in approved research",
    ],
    useCases: [
      {
        title: "Onboarding document automation",
        description:
          "Extract, validate and route client documentation with complete audit trails.",
      },
      {
        title: "Regulatory intelligence",
        description:
          "Track regulatory publications and map them to internal policies automatically.",
      },
    ],
    architectureNotes: [
      "Private model deployment for client-confidential data",
      "Immutable audit logs aligned to financial record-keeping rules",
      "Human approval mandatory for client-affecting actions",
    ],
    kpis: [
      "Onboarding cycle time",
      "Straight-through processing rate",
      "Exception rate and ageing",
      "Audit finding remediation time",
    ],
    caseStudySlugs: ["invoice-processing-operations"],
  },
  {
    slug: "healthcare",
    title: "Healthcare",
    summary:
      "Administrative automation for providers and health-tech companies — reducing paperwork burden while protecting patient privacy.",
    challenges: [
      "Clinical staff lose hours to documentation",
      "Scheduling and referral coordination is manual",
      "Strict privacy rules constrain tooling choices",
      "Interoperability between fragmented systems",
    ],
    opportunities: [
      "Referral and intake workflow automation",
      "Medical coding assistance with verification workflows",
      "Appointment coordination across departments",
      "Knowledge assistants over clinical guidelines (non-diagnostic)",
    ],
    useCases: [
      {
        title: "Patient intake digitisation",
        description:
          "Forms, documents and eligibility checks processed before the appointment.",
      },
      {
        title: "Administrative copilots",
        description:
          "Draft correspondence and summaries for staff review — never autonomous clinical decisions.",
      },
    ],
    architectureNotes: [
      "PHI isolated within compliant infrastructure",
      "No patient data sent to external model endpoints",
      "Clinical decision support clearly separated from administrative automation",
    ],
    kpis: [
      "Referral processing time",
      "Documentation minutes per encounter",
      "No-show rate",
      "Claim denial rate",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    summary:
      "AI for production planning, quality and maintenance coordination across plants, ERPs and shop floors.",
    challenges: [
      "Unplanned downtime cascades through schedules",
      "Quality inspection is sampling-based and late",
      "Tribal knowledge leaves with experienced staff",
      "Supplier communication runs on email chains",
    ],
    opportunities: [
      "Predictive maintenance coordination with ERP work orders",
      "Visual quality inspection integrated into lines",
      "Supplier document and quote processing",
      "Shift-handover and SOP knowledge assistants",
    ],
    useCases: [
      {
        title: "Maintenance workflow automation",
        description:
          "Sensor alerts become prioritised, parts-checked work orders automatically.",
      },
      {
        title: "Supplier communication agents",
        description:
          "Quotes, confirmations and exceptions extracted and reconciled against ERP data.",
      },
    ],
    architectureNotes: [
      "Edge-tolerant designs for unreliable shop-floor connectivity",
      "OT/IT segmentation respected in all integrations",
      "ERP remains the system of record",
    ],
    kpis: [
      "Overall equipment effectiveness (OEE)",
      "Mean time to repair",
      "First-pass yield",
      "Purchase order cycle time",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "retail",
    title: "Retail & E-commerce",
    summary:
      "Demand-responsive operations for retail: support, merchandising content, inventory coordination and customer journeys.",
    challenges: [
      "Support volumes spike unpredictably",
      "Product content operations lag catalogue growth",
      "Returns and exchanges handled manually",
      "Promotions require cross-team manual effort",
    ],
    opportunities: [
      "Tiered customer support with agent handoffs",
      "Product description and localisation pipelines with brand review",
      "Returns triage and refund decisioning with approval limits",
      "Competitive monitoring digests for merchandising",
    ],
    useCases: [
      {
        title: "Support deflection with quality control",
        description:
          "Routine inquiries resolved automatically; sentiment and complexity route the rest to humans.",
      },
      {
        title: "Catalogue enrichment",
        description:
          "Attributes, descriptions and translations generated then sampled for editorial QA.",
      },
    ],
    architectureNotes: [
      "Brand voice encoded as evaluable guidelines, not vibes",
      "Order systems accessed read-only by default",
      "Peak-season load tested before deployment",
    ],
    kpis: [
      "First response time",
      "Self-service resolution rate",
      "Content throughput per editor",
      "Return processing time",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "logistics",
    title: "Logistics & Supply Chain",
    summary:
      "Coordinate shipments, documents and exceptions across carriers, customs and customers — automatically.",
    challenges: [
      "Shipment exceptions discovered by customers first",
      "Customs paperwork is repetitive and error-prone",
      "Carrier rate comparison is manual",
      "ETAs unreliable, driving service complaints",
    ],
    opportunities: [
      "Exception detection with proactive customer notification",
      "Customs documentation generation with compliance review",
      "Rate benchmarking and carrier selection support",
      "ETA prediction feeding customer promises",
    ],
    useCases: [
      {
        title: "Exception management agents",
        description:
          "Delays detected from carrier feeds; customers informed and alternatives prepared.",
      },
      {
        title: "Document automation",
        description:
          "Bills of lading and customs forms assembled from shipment data with validation.",
      },
    ],
    architectureNotes: [
      "Carrier API variability absorbed by an adapter layer",
      "Customer communications templated and logged",
      "Time-zone-aware scheduling throughout",
    ],
    kpis: [
      "On-time delivery rate",
      "Exception resolution time",
      "Documents processed per FTE",
      "Customer notification latency",
    ],
    caseStudySlugs: ["invoice-processing-operations"],
  },
  {
    slug: "agriculture",
    title: "Agriculture",
    summary:
      "Practical AI for agribusiness: crop intelligence, supply coordination and market operations under real-world connectivity constraints.",
    challenges: [
      "Field data arrives fragmented and delayed",
      "Yield planning relies on experience alone",
      "Buyer/seller coordination via phone and spreadsheets",
      "Connectivity gaps break typical SaaS assumptions",
    ],
    opportunities: [
      "Satellite and sensor digest reports for agronomists",
      "Harvest logistics coordination across sites",
      "Market price monitoring with alerting",
      "Offline-tolerant field data capture apps",
    ],
    useCases: [
      {
        title: "Crop monitoring digests",
        description:
          "Imagery and weather fused into prioritised scouting recommendations.",
      },
      {
        title: "Procurement coordination",
        description:
          "Offers, contracts and logistics confirmed automatically with human sign-off on terms.",
      },
    ],
    architectureNotes: [
      "Store-and-forward sync for low-connectivity sites",
      "Simple interfaces usable in gloves, sun and dust",
      "Data ownership retained by the farm enterprise",
    ],
    kpis: [
      "Scouting coverage per agronomist",
      "Order confirmation cycle time",
      "Post-harvest loss rate",
      "Forecast accuracy trend",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "education",
    title: "Education",
    summary:
      "Administrative relief for institutions: admissions, student services and content operations — with academic integrity preserved.",
    challenges: [
      "Admissions volumes overwhelm small teams seasonally",
      "Student questions repeat across channels",
      "Course content maintenance is laborious",
      "Privacy rules apply to student records",
    ],
    opportunities: [
      "Application completeness checking and routing",
      "Student service assistants grounded in official policies",
      "Curriculum material versioning assistance",
      "Alumni communications personalisation with approval",
    ],
    useCases: [
      {
        title: "Admissions pipeline automation",
        description:
          "Documents validated, missing items flagged, reviewers get complete files.",
      },
      {
        title: "Policy-grounded student assistant",
        description:
          "Answers cite official sources; anything ambiguous routes to staff.",
      },
    ],
    architectureNotes: [
      "Student PII segregated with strict retention rules",
      "Assistant answers always linked to source policies",
      "Academic integrity boundaries documented openly",
    ],
    kpis: [
      "Application processing time",
      "Student query deflection rate",
      "Enrollment conversion",
      "Staff overtime hours",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "real-estate",
    title: "Real Estate",
    summary:
      "Transaction-heavy workflows made fluid: listings, leasing, due diligence and tenant operations.",
    challenges: [
      "Listing content production is slow and inconsistent",
      "Lease abstraction requires senior attention",
      "Tenant maintenance requests arrive everywhere",
      "Due diligence document reviews pile up",
    ],
    opportunities: [
      "Listing generation from property data with broker review",
      "Lease abstraction pipelines with clause-level validation",
      "Maintenance request triage to vendors",
      "Due-diligence summarisation with source citations",
    ],
    useCases: [
      {
        title: "Lease intelligence",
        description:
          "Critical dates, clauses and obligations extracted into searchable registers.",
      },
      {
        title: "Maintenance dispatch",
        description:
          "Requests classified, vendor-assigned and tracked to resolution automatically.",
      },
    ],
    architectureNotes: [
      "Financial figures double-validated against source scans",
      "Vendor communications logged for dispute protection",
      "Portfolio data stays within client tenancy",
    ],
    kpis: [
      "Days-to-list",
      "Lease abstraction turnaround",
      "Maintenance resolution time",
      "Tenant satisfaction score",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "professional-services",
    title: "Professional Services",
    summary:
      "Firms selling expertise reclaim billable hours from non-billable work — research, drafting, coordination and compliance.",
    challenges: [
      "Junior hours consumed by routine research and formatting",
      "Knowledge locked in silos and departed minds",
      "Engagement admin repeats every client",
      "Confidentiality obligations constrain tooling",
    ],
    opportunities: [
      "Research assistants citing firm-approved sources",
      "First-draft document generation with partner review",
      "Engagement setup automation (conflicts, letters, folders)",
      "Proposal assembly from past performance data",
    ],
    useCases: [
      {
        title: "Cited research copilots",
        description:
          "Every claim traceable to an approved source; hallucinations structurally discouraged.",
      },
      {
        title: "Engagement operations automation",
        description:
          "Standard documents generated, tracked and filed per firm templates.",
      },
    ],
    architectureNotes: [
      "Private deployment available for client confidentiality",
      "Output always marked draft until professional review",
      "Per-client information barriers enforced",
    ],
    kpis: [
      "Billable ratio",
      "Turnaround on standard deliverables",
      "Realisation rate",
      "Knowledge reuse rate",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "saas-technology",
    title: "SaaS & Technology",
    summary:
      "For software companies: ship AI features users trust, run AI-enabled GTM and support, keep unit economics sane.",
    challenges: [
      "AI feature roadmap outpaces platform readiness",
      "Token and inference costs erode margins",
      "Support volume grows with product complexity",
      "Enterprise buyers demand AI governance answers",
    ],
    opportunities: [
      "In-product copilots with evaluation infrastructure",
      "Support automation integrated with your own stack",
      "Cost-aware model routing per feature tier",
      "SOC-2-friendly AI governance artefacts",
    ],
    useCases: [
      {
        title: "Product copilot engineering",
        description:
          "Feature-grade assistants with guardrails, evals and cost controls built in.",
      },
      {
        title: "GTM workflow automation",
        description:
          "Lead research, enrichment and outreach preparation with human send-gates.",
      },
    ],
    architectureNotes: [
      "Multi-tenant data isolation verified by tests",
      "Per-tenant usage metering from day one",
      "Provider abstraction to survive vendor churn",
    ],
    kpis: [
      "Feature adoption rate",
      "Inference cost per active user",
      "Support ticket deflection",
      "Enterprise deal cycle length",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "government",
    title: "Government & Public Sector",
    summary:
      "Transparent, auditable automation for public institutions — service delivery and casework under strict accountability.",
    challenges: [
      "Case backlogs grow faster than hiring",
      "Citizen expectations shaped by private-sector UX",
      "Procurement demands extensive justification",
      "Data sovereignty often mandated by law",
    ],
    opportunities: [
      "Casework summarisation with full citation trails",
      "Citizen enquiry routing in multiple languages",
      "Document classification for records management",
      " FOI/request processing support",
    ],
    useCases: [
      {
        title: "Casework assistant",
        description:
          "Officers see drafts with references; every acceptance recorded for audit.",
      },
      {
        title: "Multilingual enquiry triage",
        description:
          "Requests categorised and routed; sensitive cases escalated immediately.",
      },
    ],
    architectureNotes: [
      "Deployment within national borders required",
      "Decision logs exportable for oversight bodies",
      "Accessibility standards applied to all citizen-facing surfaces",
    ],
    kpis: [
      "Backlog reduction",
      "Average case handling time",
      "Citizen satisfaction (CSAT)",
      "Escalation accuracy",
    ],
    caseStudySlugs: [],
  },
  {
    slug: "energy",
    title: "Energy & Utilities",
    summary:
      "AI for asset-intensive operations: maintenance planning, field service coordination and market/regulatory monitoring.",
    challenges: [
      "Asset fleets age while expertise retires",
      "Outage coordination spans many systems",
      "Compliance reporting is periodic and painful",
      "Field crews dispatched with incomplete context",
    ],
    opportunities: [
      "Inspection report processing and defect tracking",
      "Outage communication automation to stakeholders",
      "Regulatory filing assembly with expert review",
      "Work-order intelligence for field technicians",
    ],
    useCases: [
      {
        title: "Asset health digests",
        description:
          "Inspections, sensors and history condensed into prioritised action lists.",
      },
      {
        title: "Field service enablement",
        description:
          "Technicians get relevant schematics, history and steps before arrival.",
      },
    ],
    architectureNotes: [
      "Safety-critical decisions remain strictly human",
      "Integration respects EMS/SCADA segmentation",
      "Reports retained per regulatory schedules",
    ],
    kpis: [
      "Unplanned outage frequency",
      "Work order completion rate",
      "Report preparation hours",
      "Safety observation closure time",
    ],
    caseStudySlugs: [],
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}
