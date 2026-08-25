import { z } from "zod";

/**
 * Server-side schema for the project intake form. The client mirrors these
 * constraints for UX, but the server never trusts client validation.
 *
 * `companyWebsite` is a honeypot field — bots fill it, humans never see it.
 */

const cleanString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, ""))
    .refine((s) => s.length >= min && s.length <= max, {
      message: `Must be between ${min} and ${max} characters`,
    });

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
const normalizeDash = (value: unknown) =>
  typeof value === "string" ? value.replace(/-/g, "\u2013").trim() : value;

export const projectBriefSchema = z.object({
  companyName: cleanString(2, 120),
  companySize: z.preprocess(normalizeDash, z.enum(companySizes)),
  industry: cleanString(2, 80),
  country: cleanString(2, 80),
  contactName: cleanString(2, 120),
  contactEmail: z.string().trim().email().max(160),
  contactRole: cleanString(2, 80),
  problem: cleanString(30, 4000),
  currentWorkflow: cleanString(10, 4000),
  existingSoftware: cleanString(0, 500),
  desiredOutcome: cleanString(20, 2000),
  budgetRange: z.preprocess(normalizeDash, z.enum(budgetRanges)),
  timeline: z.preprocess(normalizeDash, z.enum(timelines)),
  consent: z.literal(true),
  companyWebsite: z.string().max(0).optional(),
});

export type ProjectBrief = z.infer<typeof projectBriefSchema>;

export function recommendedNextStep(
  brief: Pick<ProjectBrief, "problem" | "desiredOutcome">,
): string {
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
