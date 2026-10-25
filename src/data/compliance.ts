/**
 * Compliance posture vocabulary.
 *
 * The site says in two places that it claims no certifications, and then
 * labelled a framework "Ready" — on `/security` and again on twelve industry
 * pages. "Ready" reads as a status a reader would take to mean *operating in
 * compliance*, which is a claim about a legal position rather than about
 * engineering work, and it sat one line below the sentence "we claim no
 * compliance certifications (SOC 2, ISO 27001, HIPAA attestation) until they are
 * actually held and verifiable."
 *
 * The fix is a vocabulary with exactly two kinds of statement, both about work
 * we control rather than status we cannot:
 *
 *   - **Mapped** — our delivery controls are mapped to that framework's control
 *     set. It says what has been done, and says explicitly that no certificate
 *     is held.
 *   - **a description of the approach** — "minimal-data by design", "delivery
 *     patterns, not an attestation". These describe how work is done and make no
 *     assertion about a third-party audit.
 *
 * `compliance.test.ts` fails the build when a status uses affirmative
 * certification language ("Ready", "Certified", "Compliant", "Attested") without
 * a negation, so this cannot drift back. `complianceLegend` is rendered beneath
 * every stamp group, because a one-word label is only honest if its meaning is
 * stated on the page.
 */

export interface ComplianceStampDefinition {
  label: string;
  status: string;
}

/** "Mapped" means this — shown wherever stamps appear. */
export const complianceLegend =
  "“Mapped” means our delivery controls are mapped to that framework's control set. No certificate is claimed for any framework, and none is held today.";

/** Framework-level stamps offered. Referenced by key, never retyped. */
export const complianceStamps = {
  soc2: { label: "SOC 2 controls", status: "Mapped · not certified" },
  iso27001: { label: "ISO 27001", status: "Mapped · not certified" },
  gdpr: { label: "GDPR", status: "Minimal-data by design" },
} as const satisfies Record<string, ComplianceStampDefinition>;

/**
 * Per-industry additions. Only sectors whose delivery genuinely differs get an
 * entry; everything else uses `defaultCompliance` below, which is the GDPR
 * baseline plus the same SOC 2 statement as every other page — the previous
 * comment claimed the default was GDPR-only while the code also emitted a SOC 2
 * stamp, so the comment and the behaviour had drifted apart.
 */
export const complianceByIndustry: Record<string, ComplianceStampDefinition[]> = {
  "financial-services": [
    complianceStamps.soc2,
    { label: "Financial data handling", status: "Reviewed methods" },
    complianceStamps.gdpr,
  ],
  healthcare: [
    { label: "HIPAA-aware delivery", status: "Delivery patterns, not an attestation" },
    { label: "PHI redaction pipeline", status: "Design intent" },
    complianceStamps.gdpr,
  ],
  government: [
    { label: "Sovereign deployment", status: "Available on request" },
    { label: "Audit-trail retention", status: "Design intent" },
    complianceStamps.gdpr,
  ],
};

export const defaultCompliance: ComplianceStampDefinition[] = [
  complianceStamps.soc2,
  complianceStamps.gdpr,
];

/** Stamps shown on `/security`, in display order. */
export const securityPageStamps: ComplianceStampDefinition[] = [
  complianceStamps.soc2,
  complianceStamps.iso27001,
  complianceStamps.gdpr,
];

/**
 * Words that assert a certification or an operating compliance status. A status
 * containing one of them must also contain a negation ("not certified") to be
 * allowed — see the test.
 */
export const AFFIRMATIVE_COMPLIANCE_TERMS = [
  "ready",
  "certified",
  "certification",
  "compliant",
  "compliance",
  "attested",
  "accredited",
  "audited",
] as const;

export const NEGATION_TERMS = ["not", "no ", "never", "without"] as const;
