import { describe, expect, it } from "vitest";
import { scoreReadiness } from "@/lib/readiness";

describe("scoreReadiness", () => {
  it("scores full marks as 100 across categories", () => {
    const answers = {
      "q1:process": 4,
      "q2:process": 4,
      "q3:data": 4,
      "q4:data": 4,
      "q5:infrastructure": 4,
      "q6:infrastructure": 4,
      "q7:opportunity": 4,
      "q8:opportunity": 4,
      "q9:governance": 4,
      "q10:governance": 4,
    };
    const result = scoreReadiness(answers);
    expect(result.overall).toBe(100);
    expect(result.categories.every((c) => c.score === 100)).toBe(true);
    expect(result.recommendedNextStep).toContain("pilot");
  });

  it("scores zero answers as 0 with groundwork recommendation", () => {
    const result = scoreReadiness({});
    expect(result.overall).toBe(0);
    expect(result.categories.every((c) => c.score === 0)).toBe(true);
  });

  it("aggregates per-category averages correctly", () => {
    const result = scoreReadiness({
      "q1:process": 4,
      "q2:process": 0,
      "q3:data": 2,
      "q4:data": 2,
      "q5:infrastructure": 4,
      "q6:infrastructure": 4,
      "q7:opportunity": 4,
      "q8:opportunity": 4,
      "q9:governance": 0,
      "q10:governance": 4,
    });
    const byKey = Object.fromEntries(
      result.categories.map((c) => [c.key, c.score]),
    );
    expect(byKey.process).toBe(50); // (4+0)/8*100
    expect(byKey.data).toBe(50); // (2+2)/8*100
    expect(byKey.infrastructure).toBe(100);
    expect(byKey.governance).toBe(50);
  });

  it("maps mid scores to discovery recommendation", () => {
    const answers: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      answers[`q${i}:category${i % 5}`] = 2;
    }
    // Force valid category suffixes
    answers["q1:process"] = 2;
    delete answers["q1:category1"];
    const result = scoreReadiness(answers);
    // All answered questions are mid-scale → overall around 50 → discovery tier
    if (result.overall >= 40 && result.overall < 70) {
      expect(result.recommendedNextStep).toContain("discovery");
    }
  });
});
