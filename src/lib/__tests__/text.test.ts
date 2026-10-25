import { describe, expect, it } from "vitest";
import { capitalize, collapseWhitespace, countWord, truncateAtWord } from "@/lib/text";

/**
 * Text shaping used by metadata and headings.
 *
 * Meta descriptions were produced with a raw `slice(0, 155)`, which cut mid-word
 * ("…read the field guide to evaluating anc") and propagated into the search
 * result. Several headings hard-coded a count next to the array they described,
 * which is correct only until the array changes.
 */

describe("truncateAtWord", () => {
  it("returns short text unchanged", () => {
    expect(truncateAtWord("Short enough.", 40)).toBe("Short enough.");
  });

  it("never splits a word", () => {
    const value = "Automation assessment and workflow mapping for regulated enterprises";
    for (let max = 20; max <= value.length; max += 1) {
      const result = truncateAtWord(value, max);
      expect(result.length, `max=${max}`).toBeLessThanOrEqual(max);
      const lastWord = result.replace(/…$/, "").split(" ").pop() ?? "";
      expect(value, `max=${max} cut mid-word: "${result}"`).toContain(lastWord);
    }
  });

  it("prefers to end on a sentence when most of the budget is used", () => {
    const value =
      "Invoices arrive by email. Matching is manual. Approvals stall for days and nobody owns the exception path.";
    const result = truncateAtWord(value, 60);
    expect(result).toBe("Invoices arrive by email. Matching is manual.");
  });

  it("adds an ellipsis when it has to cut mid-sentence", () => {
    const value = "Automation assessment and workflow mapping across every regulated line of business";
    const result = truncateAtWord(value, 40);
    expect(result.endsWith("…")).toBe(true);
  });

  it("does not leave a dangling separator before the ellipsis", () => {
    const value = "Design, build, operate, and support production systems of record";
    const result = truncateAtWord(value, 22);
    expect(result).not.toMatch(/[,;:.\-–—]…$/);
  });

  it("collapses newlines so a multi-line string cannot break a meta tag", () => {
    expect(collapseWhitespace("line one\n  line two")).toBe("line one line two");
  });
});

describe("countWord", () => {
  it("spells out small counts so headings keep their typography", () => {
    expect(countWord(4)).toBe("four");
    expect(countWord(7)).toBe("seven");
    expect(countWord(10)).toBe("ten");
    expect(countWord(12)).toBe("twelve");
  });

  it("falls back to digits beyond the table rather than returning undefined", () => {
    expect(countWord(13)).toBe("13");
    expect(countWord(0)).toBe("zero");
  });

  it("capitalises a derived count for the start of a sentence", () => {
    // A written number beginning a sentence is capitalised. Without this the
    // derived headings read "ten commitments we can be measured against."
    expect(capitalize(countWord(10))).toBe("Ten");
    expect(capitalize(countWord(4))).toBe("Four");
    expect(capitalize("already Here")).toBe("Already Here");
  });
});
