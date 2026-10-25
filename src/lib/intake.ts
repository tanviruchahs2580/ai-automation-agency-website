/**
 * Framework-free intake vocabulary.
 *
 * These values are imported by the client wizard (`ProjectIntake`) as well as
 * by the server schema in `validation.ts`. They deliberately live in their own
 * module with **no zod import**: the wizard only needs the option arrays and
 * the next-step heuristic, and pulling them from `validation.ts` dragged the
 * whole zod runtime into the browser bundle for four constants.
 *
 * Anything here must stay dependency-free and side-effect-free.
 */

export const budgetRanges = [
  "Under $25k",
  "$25k – $75k",
  "$75k – $200k",
  "$200k+",
  "Not sure yet",
] as const;

export const timelines = [
  "Immediately",
  "Within 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "Exploring options",
] as const;

export const companySizes = [
  "1 – 50",
  "51 – 250",
  "251 – 1,000",
  "1,000 – 5,000",
  "5,000+",
] as const;

/**
 * Enum values use typographic en-dashes (e.g. "51 – 250"). Browser clients
 * submit them verbatim, but API integrations commonly send ASCII hyphens.
 * Normalise before validation so both forms are accepted without loosening
 * the allowed value set.
 */
export const normalizeDash = (value: unknown) =>
  typeof value === "string" ? value.replace(/-/g, "\u2013").trim() : value;

/**
 * The intake wizard's step sequence.
 *
 * Lives here rather than inside `ProjectIntake.tsx` so the page that hosts the
 * wizard can state the step count from the same source the wizard renders from.
 * It used to say "Seven short steps." next to a hard-coded seven in the
 * component — two numbers that had to be kept in agreement by hand.
 */
export interface IntakeStep {
  title: string;
  /** Form fields validated on this step, in display order. */
  fields: readonly string[];
}

export const intakeSteps: readonly IntakeStep[] = [
  { title: "Business", fields: ["companyName", "companySize", "industry", "country"] },
  { title: "Problem", fields: ["problem"] },
  { title: "Current Workflow", fields: ["currentWorkflow"] },
  { title: "Existing Software", fields: ["existingSoftware"] },
  { title: "Desired Outcome", fields: ["desiredOutcome"] },
  { title: "Budget Range", fields: ["budgetRange"] },
  {
    title: "Timeline & Contact",
    fields: ["timeline", "contactName", "contactEmail", "contactRole", "consent"],
  },
];

/**
 * Maps the free-text problem statement onto the engagement that best fits it.
 * Intentionally a small keyword heuristic: it produces one sentence shown on
 * the receipt, and never gates what happens next.
 */
export function recommendedNextStep(brief: {
  problem: string;
  desiredOutcome: string;
}): string {
  const text = `${brief.problem} ${brief.desiredOutcome}`.toLowerCase();
  if (/agent|copilot|assistant/.test(text)) {
    return "A scoped AI agent architecture session with our engineering team.";
  }
  if (/automat|manual|repetitive|workflow/.test(text)) {
    return "A workflow automation assessment to map your highest-value processes.";
  }
  if (/data|infrastructur|platform|rag|private/.test(text)) {
    return "A data & AI infrastructure review with our architects.";
  }
  if (/strateg|roadmap|readiness|transformation/.test(text)) {
    return "An AI strategy discovery workshop with leadership.";
  }
  return "A technical discovery call with a senior AI engineer.";
}
