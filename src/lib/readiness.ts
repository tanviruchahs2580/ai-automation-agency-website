/**
 * AI readiness scoring — pure functions, unit-tested.
 *
 * Scores are indicative estimates derived from self-reported answers.
 */

export type ReadinessCategoryKey =
  | "process"
  | "data"
  | "infrastructure"
  | "opportunity"
  | "governance";

export interface ReadinessCategory {
  key: ReadinessCategoryKey;
  label: string;
}

export const readinessCategories: ReadinessCategory[] = [
  { key: "process", label: "Process readiness" },
  { key: "data", label: "Data readiness" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "opportunity", label: "AI opportunity" },
  { key: "governance", label: "Governance" },
];

/** Answer scale: 0 = not at all … 4 = fully in place. */
export const answerScale = [
  "Not at all",
  "Partially",
  "Moderately",
  "Largely",
  "Fully",
] as const;

export function categoryLabel(key: ReadinessCategoryKey): string {
  return (
    readinessCategories.find((c) => c.key === key)?.label ?? key
  );
}

export interface CategoryScore {
  key: ReadinessCategoryKey;
  label: string;
  score: number; // 0–100
}

export interface ReadinessResult {
  categories: CategoryScore[];
  overall: number; // 0–100
  recommendation: string;
  recommendedNextStep: string;
}

const RECOMMENDATIONS: Array<{
  min: number;
  recommendation: string;
  nextStep: string;
}> = [
  {
    min: 70,
    recommendation:
      "Your foundations look strong enough to move straight into architecture and a production pilot.",
    nextStep: "Scope a pilot with our AI engineering team",
  },
  {
    min: 40,
    recommendation:
      "You have real opportunity, but data or governance gaps should be closed before scaling AI.",
    nextStep: "Run an AI opportunity discovery workshop",
  },
  {
    min: 0,
    recommendation:
      "The priority is process and data groundwork — deploying AI before this usually fails in production.",
    nextStep: "Start with an AI readiness roadmap",
  },
];

export function scoreReadiness(
  answers: Record<string, number>,
): ReadinessResult {
  const categories: CategoryScore[] = readinessCategories.map((category) => {
    const values = Object.entries(answers)
      .filter(([id]) => id.endsWith(`:${category.key}`))
      .map(([, v]) => v);
    const max = values.length * 4;
    const sum = values.reduce((acc, v) => acc + v, 0);
    const score = max === 0 ? 0 : Math.round((sum / max) * 100);
    return { key: category.key, label: category.label, score };
  });

  const overall = Math.round(
    categories.reduce((acc, c) => acc + c.score, 0) / categories.length,
  );

  const tier =
    RECOMMENDATIONS.find((r) => overall >= r.min) ?? RECOMMENDATIONS[2];

  return {
    categories,
    overall,
    recommendation: tier.recommendation,
    recommendedNextStep: tier.nextStep,
  };
}
