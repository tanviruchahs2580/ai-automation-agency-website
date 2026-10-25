import { describe, expect, it } from "vitest";
import { DISCLAIMER_FRAGMENTS, disclaimers } from "@/data/disclaimers";
import { findLiteralOccurrences } from "./source-scan";

/**
 * Disclosures have one home.
 *
 * The site's trust position is that it states plainly what its content is and is
 * not. That only works if the same disclosure reads the same way everywhere: the
 * audit found the "example architecture" caveat in four different wordings —
 * badge, card eyebrow, the retired `messages/en.json` catalogue, and
 * `BRAND-GUIDE.md` — with the guide naming the catalogue version as approved
 * while the UI shipped a different one. A visitor meeting two of them on
 * adjacent pages concludes neither is policy.
 */

describe("disclaimer copy", () => {
  it("is written literally in only one place", () => {
    const offenders = findLiteralOccurrences(DISCLAIMER_FRAGMENTS, [
      "data/disclaimers.ts",
    ]);

    expect(
      offenders,
      `Disclosure retyped. Import \`disclaimers\` from "@/data/disclaimers" instead:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("states what something is not, next to what it is", () => {
    /*
      A caveat with no subject ("Simulated") reads as noise; naming what is
      absent is what makes it actionable. Every *disclosure* must carry a
      negative clause. `*Label` entries are exempt on purpose: a short eyebrow
      has no room for a clause, and its paired badge carries the negation —
      asserted by the next test.
    */
    const negations = [/\bnot\b/i, /\bno\b/i, /\bnever\b/i, /\bomitted\b/i, /\bdeliberately\b/i];
    for (const [key, value] of Object.entries(disclaimers)) {
      if (key.endsWith("Label")) continue;
      expect(
        negations.some((pattern) => pattern.test(value)),
        `disclaimers.${key} does not state what the content is not: "${value}"`,
      ).toBe(true);
    }
  });

  it("keeps the short label free of a dash clause", () => {
    // The label is used as a card eyebrow and a page tag; a dash clause there
    // wraps onto a second line in a 3-up grid.
    expect(disclaimers.exampleArchitectureLabel).not.toMatch(/—/);
    expect(disclaimers.exampleArchitectureBadge).toContain(
      disclaimers.exampleArchitectureLabel,
    );
  });

  it("does not repeat the same sentence across two disclosures", () => {
    /*
      The readiness caveat was printed twice on one page — once by the result
      view and once by the methodology section — and the ROI page restated the
      calculator's guarantee sentence. Both are silent duplication: updating one
      leaves the other contradicting it.
    */
    const sentences = Object.values(disclaimers)
      .flatMap((value) => value.split(/(?<=\.)\s+/))
      .map((sentence) => sentence.trim().toLowerCase())
      .filter((sentence) => sentence.length > 40);

    const duplicates = sentences.filter(
      (sentence, index) => sentences.indexOf(sentence) !== index,
    );
    expect(duplicates).toEqual([]);
  });
});
