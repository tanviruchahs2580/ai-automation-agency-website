import { describe, expect, it } from "vitest";
import { projectBriefSchema, recommendedNextStep } from "@/lib/validation";

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

  it("rejects honeypot-filled submissions", () => {
    const parsed = projectBriefSchema.safeParse({
      ...validBrief,
      companyWebsite: "spam.example",
    });
    expect(parsed.success).toBe(false);
  });

  it("strips control characters from input (sanitisation)", () => {
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
      desiredOutcome: "A prioritised readiness plan.",
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
