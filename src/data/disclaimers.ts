/**
 * Shared honesty copy.
 *
 * The audit found the same disclosure written four different ways across the
 * site — "Example Architecture — not a client engagement" on the badge,
 * "Example architecture" as a card eyebrow, "Example architecture —
 * illustrative, not a client system." in the retired `messages/en.json`
 * catalogue, and a fourth phrasing in `BRAND-GUIDE.md` that named the catalogue
 * version as the approved one. A reader meeting two of them on adjacent pages
 * reasonably concludes that neither is the policy, which defeats the point of
 * disclosing anything.
 *
 * These constants are the single source. Nothing should retype them —
 * `src/lib/__tests__/disclaimers.test.ts` fails if a disclosure string appears
 * literally anywhere else in `src/`.
 *
 * Wording rule, for anyone adding one: state what the thing is **not**, in the
 * same breath as what it is. "Simulated" alone reads as a caveat; "simulated —
 * no client data is shown" tells the reader what they are looking at.
 */

export const disclaimers = {
  /** Short label for a card eyebrow. */
  exampleArchitectureLabel: "Example architecture",

  /** Badge on a reference-architecture page. */
  exampleArchitectureBadge: "Example architecture — not a client engagement",

  /** The full statement, shown at the foot of a reference architecture. */
  exampleArchitectureNote:
    "This is an example architecture demonstrating our engineering method. Outcome metrics are deliberately omitted — published results will only ever come from verifiable engagements.",

  /** Hero console telemetry, which is generated in the browser. */
  simulationLabel: "All figures simulated for illustration. No client data is shown.",

  /** Static ranges in the home ROI teaser, which are model outputs. */
  modelRangesLabel: "Illustrative model outputs — not client results",

  /** ROI calculator output, which is computed from visitor inputs. */
  estimateNote:
    "This calculator provides an indicative estimate based entirely on your inputs. It is not a financial guarantee. Assumptions: 48 working weeks, salary converted to an hourly cost over 2,080 hours.",

  /**
   * Readiness score, which is self-reported. Shown once, at the result — the
   * page's methodology section says only what is unique to it, so the same
   * caveat is not printed twice on one page.
   */
  readinessNote:
    "Scores are indicative estimates derived from self-reported answers, not an audited assessment.",
} as const;

/**
 * Methodology statements: what a real assessment involves.
 *
 * Separate from `disclaimers` because they make no claim about absence — they
 * describe work, so the "state what it is not" rule does not apply to them, and
 * the test that enforces that rule is scoped to `disclaimers` accordingly.
 * Keeping unmatching strings out of the object is better than adding an
 * exception that would let a genuine disclosure slip through unchecked.
 */
export const methodology = {
  /** What a validated readiness assessment actually involves. */
  readiness:
    "A validated assessment requires workshops with your teams, which is exactly what we do first on real engagements.",

  /** What a defensible business case for automation requires. */
  roi:
    "Real business cases require process-level measurement — which is part of every discovery we run.",
} as const;

/**
 * Phrases that must never be retyped elsewhere, checked by the disclaimers
 * test. Kept as a list of literal fragments rather than reading `disclaimers`
 * itself so that renaming a constant cannot silently disable the check.
 */
export const DISCLAIMER_FRAGMENTS = [
  "not a client engagement",
  "No client data is shown",
  "not client results",
  "not a financial guarantee",
  "not an audited assessment",
  "Outcome metrics are deliberately omitted",
] as const;
