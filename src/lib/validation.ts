import { z } from "zod";
import { budgetRanges, companySizes, normalizeDash, timelines } from "@/lib/intake";

/**
 * Server-side schema for the project intake form. The client mirrors these
 * constraints for UX, but the server never trusts client validation.
 *
 * `companyWebsite` is a honeypot field — bots fill it, humans never see it.
 *
 * Ordering note: length is bounded **before** the control-character transform,
 * so an oversized field is rejected without the sanitizer ever scanning it.
 * `cleanString` therefore reads `.trim().max().transform().refine()` rather
 * than the more obvious `.trim().transform().refine()`.
 *
 * The option arrays and `recommendedNextStep` live in `@/lib/intake` so the
 * client wizard can import them without pulling zod into the browser bundle.
 */

export const MAX_FIELD_LENGTH = 4000;

const cleanString = (min: number, max: number, label: string) =>
  z
    .string({ message: `${label} is required` })
    .trim()
    .max(max, { message: `${label} must be ${max} characters or fewer` })
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, "").trim())
    .refine((s) => s.length >= min, {
      message:
        min === 0
          ? `${label} is invalid`
          : `${label} must be at least ${min} characters`,
    });

export const projectBriefSchema = z.object({
  companyName: cleanString(2, 120, "Company name"),
  companySize: z.preprocess(normalizeDash, z.enum(companySizes)),
  industry: cleanString(2, 80, "Industry"),
  country: cleanString(2, 80, "Country"),
  contactName: cleanString(2, 120, "Contact name"),
  contactEmail: z
    .string({ message: "Work email is required" })
    .trim()
    .pipe(z.email({ message: "Enter a valid work email address" }).max(160)),
  contactRole: cleanString(2, 80, "Role"),
  problem: cleanString(30, MAX_FIELD_LENGTH, "Problem statement"),
  currentWorkflow: cleanString(10, MAX_FIELD_LENGTH, "Current workflow"),
  existingSoftware: cleanString(0, 500, "Existing software"),
  desiredOutcome: cleanString(20, 2000, "Desired outcome"),
  budgetRange: z.preprocess(normalizeDash, z.enum(budgetRanges)),
  timeline: z.preprocess(normalizeDash, z.enum(timelines)),
  consent: z.literal(true, { message: "Consent is required to submit a brief" }),
  /**
   * Honeypot: hidden from humans, so any value means a bot.
   *
   * Deliberately *not* constrained to `max(0)`. Rejecting it here produced a
   * 422 whose `issues` named the field and echoed Zod's own message ("Too big:
   * expected string to have <=0 characters") — which tells a bot exactly which
   * trap it hit, on an endpoint whose every other error was rewritten into
   * plain prose. The handler now accepts it and returns an ordinary receipt
   * without notifying anyone.
   */
  companyWebsite: z.string().optional(),
});

export type ProjectBrief = z.infer<typeof projectBriefSchema>;

/**
 * Largest JSON body the intake endpoint will read, in bytes. The schema caps
 * every field, but a hostile client can still send an arbitrarily large body
 * before validation runs, so the transport layer rejects it first. Comfortably
 * above the schema's worst case (~13 KB of field content plus JSON overhead
 * and multi-byte characters).
 */
export const MAX_BRIEF_BYTES = 64 * 1024;
