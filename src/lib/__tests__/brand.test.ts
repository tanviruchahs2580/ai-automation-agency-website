import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { deriveBrandForms, siteConfig, teamByline } from "@/data/site";

/**
 * Brand single-source-of-truth.
 *
 * The audit found the placeholder name written out longhand in ten non-test
 * files, in three different capitalisations, with no rule saying which belonged
 * where. It was retired on 2026-11 when the owner confirmed `ARKYON` as the
 * public brand (a rename that had to preserve visitor state — storage keys
 * gained legacy read-fallbacks — while removing every active brand literal).
 *
 * These tests make the config module the only permitted home for the name, so
 * that stays true after the rename, keep the three forms consistent with each
 * other so one cannot be changed without the others, and keep the retired
 * placeholder name out of active source (it survives only in dated historical
 * records and these fixtures).
 */

/**
 * The active brand, matched case-sensitively as a word so namespaced
 * localStorage / DOM keys (`arkyon-theme`, `arkyon:intake-draft:v1`) are not
 * flagged: they are behavioural keys, not user-facing brand copy.
 */
const ACTIVE_BRAND_PATTERN = /\b(?:ARKYON|Arkyon)\b/;
/**
 * The retired placeholder, same word-boundary logic. Lower-case legacy storage
 * keys (`vantiq-theme`, read once as a fallback) are deliberately still
 * permitted — they exist so visitor state survives the rename.
 */
const RETIRED_BRAND_PATTERN = /\b(?:VANTIQ|Vantiq)\b/;

const SRC = path.join(process.cwd(), "src");
const BRAND_MODULE = path.join("data", "site.ts");

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...sourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      found.push(full);
    }
  }
  return found;
}

/**
 * Removes comments while preserving line numbering.
 *
 * The invariant is about strings that reach a visitor, so a comment naming the
 * brand is fine — and useful, as it is how the placeholder is documented at the
 * call sites. A naive `.replace(/\/\/.*$/gm, "")` would also eat the `//` in
 * `"https://example.com"` and silently stop scanning the rest of that line, so
 * this walks the source as a tiny state machine instead: quotes and template
 * literals are tracked, escapes are honoured, and newlines are kept so reported
 * line numbers still point at the right place.
 */
function stripComments(source: string): string {
  let out = "";
  let index = 0;
  let state: "code" | "line" | "block" | "single" | "double" | "template" = "code";

  while (index < source.length) {
    const char = source[index]!;
    const next = source[index + 1];

    if (state === "code") {
      if (char === "/" && next === "/") {
        state = "line";
        index += 2;
        continue;
      }
      if (char === "/" && next === "*") {
        state = "block";
        index += 2;
        continue;
      }
      if (char === "'") state = "single";
      else if (char === '"') state = "double";
      else if (char === "`") state = "template";
      out += char;
      index += 1;
      continue;
    }

    if (state === "line") {
      if (char === "\n") {
        state = "code";
        out += char;
      }
      index += 1;
      continue;
    }

    if (state === "block") {
      if (char === "*" && next === "/") {
        state = "code";
        out += " ";
        index += 2;
        continue;
      }
      if (char === "\n") out += char;
      index += 1;
      continue;
    }

    /* Inside a string literal: copy verbatim, honouring escapes. */
    if (char === "\\") {
      out += char + (next ?? "");
      index += 2;
      continue;
    }
    const closing = { single: "'", double: '"', template: "`" }[state];
    if (char === closing) state = "code";
    out += char;
    index += 1;
  }

  return out;
}

describe("brand name has one home", () => {
  it("no literal brand name outside the config module", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles(SRC)) {
      const relative = path.relative(SRC, file);
      if (relative === BRAND_MODULE) continue;
      /* Tests may assert against the configured value; they must not retype it. */
      if (relative.includes("__tests__")) continue;

      const contents = stripComments(readFileSync(file, "utf8"));
      contents.split("\n").forEach((line, index) => {
        if (ACTIVE_BRAND_PATTERN.test(line)) {
          offenders.push(`${relative}:${index + 1}: ${line.trim()}`);
        }
      });
    }

    expect(
      offenders,
      `Brand name written literally. Import siteConfig from "@/data/site" instead:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("the retired placeholder name does not return to active source", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles(SRC)) {
      const relative = path.relative(SRC, file);
      if (relative === BRAND_MODULE) continue;
      /* Fixtures asserting the retirement itself are the legitimate home. */
      if (relative.includes("__tests__")) continue;

      const contents = stripComments(readFileSync(file, "utf8"));
      contents.split("\n").forEach((line, index) => {
        if (RETIRED_BRAND_PATTERN.test(line)) {
          offenders.push(`${relative}:${index + 1}: ${line.trim()}`);
        }
      });
    }

    expect(
      offenders,
      `Retired brand name found in active source (legacy storage keys stay allowed):\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("the public brand is exactly ARKYON", () => {
    // The test environment never sets NEXT_PUBLIC_BRAND_NAME, so this asserts
    // the shipped default. A future env-configured rename must update this
    // fixture deliberately rather than silently.
    //
    // For a single-word brand every derived form is the exact name: the
    // derivation deliberately never title-cases the head token (an acronym
    // brand must not become "Arkyon" in prose), so the exact-name rule holds
    // in every surface, including sentences.
    expect(siteConfig.name).toBe("ARKYON");
    expect(siteConfig.proseName).toBe("ARKYON");
    expect(siteConfig.shortName).toBe("ARKYON");
  });

  it("the three forms agree with the configured name", () => {
    const tokens = siteConfig.name.split(/\s+/);

    // shortName is what page titles suffix with ("— VANTIQ"), so it must be the
    // brand's leading token and not a stale string left behind by a rename.
    expect(siteConfig.shortName).toBe(tokens[0]);

    // proseName is the sentence form, so it must carry the same words.
    expect(siteConfig.proseName.toLowerCase()).toBe(siteConfig.name.toLowerCase());
  });

  it("derives all three forms from one value", () => {
    /*
      Exercises the derivation directly. The previous version of this test was
      tautological — its guard (`token.length <= 3 && /^[A-Z]+$/.test(token)`)
      was identical to its assertion, so it could not fail — and it asserted
      against whichever value the environment happened to hold, which is why a
      hard-coded `shortName` went unnoticed until someone set the env var.
    */
    expect(deriveBrandForms("ACME ROBOTICS")).toEqual({
      name: "ACME ROBOTICS",
      proseName: "ACME Robotics",
      shortName: "ACME",
    });
    expect(deriveBrandForms("NORTHWIND LABS")).toEqual({
      name: "NORTHWIND LABS",
      proseName: "NORTHWIND Labs",
      shortName: "NORTHWIND",
    });
    // Acronyms in the tail survive: "ABC AI Ltd" must not become "ABC Ai Ltd".
    expect(deriveBrandForms("ABC AI Ltd").proseName).toBe("ABC AI Ltd");
    // A single-word brand does not produce an empty suffix.
    expect(deriveBrandForms("Northwind")).toEqual({
      name: "Northwind",
      proseName: "Northwind",
      shortName: "Northwind",
    });
  });

  it("production config is internally consistent", () => {
    expect(siteConfig.name.length).toBeGreaterThan(1);
    expect(siteConfig.shortName).toBe(siteConfig.name.split(/\s+/)[0]);
    expect(siteConfig.proseName.toLowerCase()).toBe(siteConfig.name.toLowerCase());
  });

  it("team byline is derived from the prose name", () => {
    expect(teamByline).toContain(siteConfig.proseName);
    expect(teamByline).toMatch(/Engineering Team$/);
  });
});
