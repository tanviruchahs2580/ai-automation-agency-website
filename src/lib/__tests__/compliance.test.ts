import { describe, expect, it } from "vitest";
import {
  AFFIRMATIVE_COMPLIANCE_TERMS,
  complianceByIndustry,
  complianceLegend,
  complianceStamps,
  defaultCompliance,
  NEGATION_TERMS,
  securityPageStamps,
} from "@/data/compliance";

/**
 * Compliance language cannot drift back into a claim.
 *
 * The site states twice that it claims no certifications, and then shipped a
 * `GDPR · Ready` stamp on `/security` and on all twelve industry pages. "Ready"
 * describes a legal operating position, not engineering work — exactly the kind
 * of assertion the rest of this codebase refuses to make. It was replaced with a
 * two-part vocabulary: `Mapped · not certified` (which names what has been done
 * *and* disclaims the certificate) or a description of the approach
 * ("Minimal-data by design").
 *
 * These tests are what stop it coming back, because the pressure to write
 * "Certified" on a security page never goes away.
 */

const allStamps = [
  ...Object.entries(complianceStamps),
  ...Object.entries(complianceByIndustry).flatMap(([industry, stamps]) =>
    stamps.map((stamp) => [`${industry}: ${stamp.label}`, stamp] as const),
  ),
  ...defaultCompliance.map((stamp) => [`default: ${stamp.label}`, stamp] as const),
  ...securityPageStamps.map((stamp) => [`security: ${stamp.label}`, stamp] as const),
];

describe("compliance vocabulary", () => {
  it("never asserts a certification or a compliance status", () => {
    const offenders: string[] = [];

    for (const [where, stamp] of allStamps) {
      const status = stamp.status.toLowerCase();
      const claims = AFFIRMATIVE_COMPLIANCE_TERMS.some((term) => status.includes(term));
      const disclaims = NEGATION_TERMS.some((term) => status.includes(term));
      if (claims && !disclaims) {
        offenders.push(`${where}: status "${stamp.status}" claims without disclaiming`);
      }
    }

    expect(
      offenders,
      `Compliance status asserting a certification or operating status:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("says what it has NOT got, not only what it has", () => {
    // Every "Mapped" status must carry the disclaimer in the same string: a
    // reader should not have to reach the legend to learn there is no certificate.
    const mapped = allStamps.filter(([, stamp]) => stamp.status.includes("Mapped"));
    expect(mapped.length).toBeGreaterThan(0);
    for (const [where, stamp] of mapped) {
      expect(stamp.status, where).toMatch(/not certified|no certificate/i);
    }
  });

  it("defines every term a stamp uses", () => {
    // The legend is rendered wherever stamps are, and it has to explain "Mapped"
    // specifically — that is the only non-obvious word in the set.
    expect(complianceLegend).toContain("Mapped");
    expect(complianceLegend).toMatch(/no certificate is claimed/i);
  });

  it("gives every industry its own stamps without repeating a label", () => {
    for (const [industry, stamps] of Object.entries(complianceByIndustry)) {
      expect(stamps.length, industry).toBeGreaterThan(0);
      const labels = stamps.map((stamp) => stamp.label);
      expect(new Set(labels).size, `${industry} repeats a label`).toBe(labels.length);
    }
  });

  it("keeps the default posture identical to the sector baseline", () => {
    // The previous comment claimed the default was GDPR-only while the code also
    // emitted a SOC 2 stamp. Both are now the same list, and this pins it.
    expect(defaultCompliance).toContain(complianceStamps.gdpr);
    expect(securityPageStamps).toContain(complianceStamps.gdpr);
  });
});
