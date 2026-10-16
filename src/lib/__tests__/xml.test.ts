import { describe, expect, it } from "vitest";
import { escapeXml } from "@/lib/xml";

/**
 * The RSS feed interpolates authored copy straight into XML. Before this
 * helper existed a title containing "&" or "<" produced malformed XML and
 * killed the feed for every reader — the site's own taxonomy already contains
 * "Data & AI Infrastructure", so it was one article away from breaking.
 */
describe("escapeXml", () => {
  it("escapes the five predefined entities", () => {
    expect(escapeXml(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&apos;");
  });

  it("escapes ampersands before the other entities (no double-escaping)", () => {
    expect(escapeXml("Data & AI")).toBe("Data &amp; AI");
    expect(escapeXml("a & b < c")).toBe("a &amp; b &lt; c");
  });

  it("escapes a string that already looks escaped exactly once", () => {
    expect(escapeXml("&amp;")).toBe("&amp;amp;");
  });

  it("leaves ordinary prose, en dashes and curly quotes untouched", () => {
    expect(escapeXml("Six layers — “zero lock-in”")).toBe(
      "Six layers — “zero lock-in”",
    );
  });

  it("handles an empty string", () => {
    expect(escapeXml("")).toBe("");
  });
});
