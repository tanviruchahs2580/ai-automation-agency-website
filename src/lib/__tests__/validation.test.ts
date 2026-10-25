import { describe, expect, it } from "vitest";
import { recommendedNextStep } from "@/lib/intake";
import {
  MAX_BRIEF_BYTES,
  MAX_FIELD_LENGTH,
  projectBriefSchema,
} from "@/lib/validation";

const validBrief = {
  companyName: "Acme Manufacturing",
  companySize: "51 – 250",
  industry: "Manufacturing",
  country: "Germany",
  contactName: "Jane Smith",
  contactEmail: "jane@acme.example",
  contactRole: "COO",
  problem:
    "Supplier invoices are keyed manually into SAP and approvals stall for days.",
  currentWorkflow: "Email intake, Excel matching, reply-all approval chains.",
  existingSoftware: "SAP, Outlook",
  desiredOutcome:
    "Straight-through processing of matched invoices with human review only on exceptions.",
  budgetRange: "$75k – $200k",
  timeline: "Within 3 months",
  consent: true,
};

describe("projectBriefSchema", () => {
  it("accepts a complete valid brief", () => {
    const parsed = projectBriefSchema.safeParse(validBrief);
    expect(parsed.success).toBe(true);
  });

  it("rejects when consent is missing", () => {
    const parsed = projectBriefSchema.safeParse({ ...validBrief, consent: false });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      contactEmail: "not-an-email",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects short problem descriptions", () => {
    const parsed = projectBriefSchema.safeParse({ ...validBrief, problem: "too short" });
    expect(parsed.success).toBe(false);
  });

  it("accepts a filled honeypot at the schema layer", () => {
    /*
      Changed deliberately. Constraining this field to `max(0)` rejected bots
      with a 422 whose `issues` named the field and echoed Zod's own message
      ("Too big: expected string to have <=0 characters") — telling a script
      exactly which trap it hit, on an endpoint whose every other error was
      rewritten into plain prose. The schema now accepts any value and the route
      returns an ordinary receipt without notifying anyone, so a bot learns
      nothing. The rejection behaviour is asserted at the route level, in
      `api-project-brief.test.ts`.
    */
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      companyWebsite: "spam.example",
    });
    expect(parsed.success).toBe(true);
  });

  it("strips control characters from input (sanitization)", () => {
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      problem: `Valid problem statement with control char\u0007 embedded inside.`,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.problem).not.toContain("\u0007");
    }
  });

  it("rejects unknown enum values", () => {
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      timeline: "Yesterday",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts ASCII hyphens in enum fields (API integration robustness)", () => {
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      companySize: "51 - 250",
      budgetRange: "$25k - $75k",
      timeline: "6 - 12 months",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.companySize).toBe("51 – 250");
      expect(parsed.data.budgetRange).toBe("$25k – $75k");
    }
  });

  it("still rejects invalid strings inside enum fields after normalisation", () => {
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      companySize: "51 to 250",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts the largest brief the field limits allow", () => {
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      problem: "p".repeat(MAX_FIELD_LENGTH),
      currentWorkflow: "w".repeat(MAX_FIELD_LENGTH),
      desiredOutcome: "o".repeat(2000),
      existingSoftware: "s".repeat(500),
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a field one character over its limit", () => {
    // Expressed against the constant rather than a literal, so raising the limit
    // cannot leave the boundary untested.
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      problem: "p".repeat(MAX_FIELD_LENGTH + 1),
    });
    expect(parsed.success).toBe(false);
  });

  it("bounds every field at or below the transport cap", () => {
    /*
      The API rejects bodies larger than MAX_BRIEF_BYTES before parsing, so the
      cap has to be above the largest brief the schema will ever accept —
      otherwise a legitimate submission at the field limits would be refused by
      the transport before validation could run. Both numbers are asserted so
      changing either one alone fails here rather than in production.
    */
    const largest = {
      ...validBrief,
      problem: "p".repeat(MAX_FIELD_LENGTH),
      currentWorkflow: "w".repeat(MAX_FIELD_LENGTH),
      desiredOutcome: "o".repeat(2000),
      existingSoftware: "s".repeat(500),
    };
    const bytes = new TextEncoder().encode(JSON.stringify(largest)).byteLength;
    expect(bytes).toBeLessThan(MAX_BRIEF_BYTES);
    // Pinned, because the figure is quoted in LAUNCH-CHECKLIST.md and a bare
    // lower bound ("≥16 KiB") would keep passing if the cap were raised tenfold.
    expect(MAX_BRIEF_BYTES).toBe(64 * 1024);
  });
});

describe("recommendedNextStep", () => {
  it("recommends agent architecture for agent-related briefs", () => {
    const step = recommendedNextStep({
      ...validBrief,
      problem:
        "We want an AI copilot assistant agent to handle customer questions end to end.",
    });
    expect(step).toContain("agent");
  });

  it("recommends strategy workshop for strategy briefs", () => {
    const step = recommendedNextStep({
      ...validBrief,
      problem: "Leadership wants an enterprise AI transformation roadmap strategy.",
      desiredOutcome: "A prioritized readiness plan.",
    });
    expect(step).toContain("strategy");
  });

  it("falls back to discovery call for unmatched briefs", () => {
    const step = recommendedNextStep({
      ...validBrief,
      problem:
        "Our office espresso machine breaks down weekly and staff morale suffers badly.",
      desiredOutcome: "Reliable caffeine availability for the whole team.",
    });
    expect(step).toContain("discovery call");
  });
});
