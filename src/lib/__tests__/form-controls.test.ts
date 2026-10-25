import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { relativeToSrc, sourceFiles, stripComments } from "./source-scan";

/**
 * Interactive controls must be identified by the field token.
 *
 * WCAG 1.4.11 asks for 3:1 against the adjacent colour for anything needed to
 * identify a control. `--color-field` composites to about 3.5:1 (dark) and 3.3:1
 * (light); `--color-line` is a 9%-alpha hairline at roughly 1.2:1, intended for
 * decorative rules and card edges.
 *
 * `contrast.test.ts` proves the tokens are correct. This proves the controls
 * actually use them. That distinction matters — the first pass at this fix
 * changed only the intake wizard's shared `inputClass`, so the ROI calculator's
 * select and number fields, every input on the site's most interactive tool,
 * still shipped the hairline while the token test reported green.
 *
 * Two scanner mistakes were caught here by deliberately re-introducing the
 * defect and watching the test stay green. Both are recorded because they are
 * the failure mode to check for in any source-scanning gate:
 *
 *  1. line-based matching, when JSX routinely puts `className` on its own line;
 *  2. naive "first `>` after `<input`" tag extraction, which stops at the `=>`
 *     of an inline handler and never reaches the className at all.
 */

const CONTROL_TAG = /<(?:input|select|textarea)\b/g;

/** Decorative hairlines. `border-field`, `border-accent`, status colours are fine. */
const HAIRLINE = /border-line(?![a-z-])|border-line-strong/;

/** Give up on a pathological tag rather than scanning the rest of the file. */
const MAX_TAG_LENGTH = 1200;

/**
 * The opening tag starting at `start`.
 *
 * Brace-aware, because a JSX opening tag contains `{...}` expressions and those
 * contain `>` in arrow functions (`onChange={(e) => …}`). Returning at the first
 * bare `>` would end the tag in the middle of the handler, before `className`.
 */
function openingTag(contents: string, start: number): string {
  let depth = 0;
  const limit = Math.min(contents.length, start + MAX_TAG_LENGTH);

  for (let i = start; i < limit; i += 1) {
    const char = contents[i];
    if (char === "{") depth += 1;
    else if (char === "}") depth -= 1;
    else if (char === ">" && depth === 0) return contents.slice(start, i);
  }

  return contents.slice(start, limit);
}

/** 1-based line number of `index`, for a message a human can act on. */
function lineOf(contents: string, index: number): number {
  return contents.slice(0, index).split("\n").length;
}

describe("form control boundaries", () => {
  it("no control is outlined with a decorative hairline token", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles()) {
      const relative = relativeToSrc(file);
      if (relative.includes("__tests__")) continue;

      const contents = stripComments(readFileSync(file, "utf8"));
      for (const match of contents.matchAll(CONTROL_TAG)) {
        const start = match.index ?? 0;
        const tag = openingTag(contents, start);
        if (HAIRLINE.test(tag)) {
          offenders.push(
            `${relative}:${lineOf(contents, start)}: ${tag.replace(/\s+/g, " ").trim()}`,
          );
        }
      }
    }

    expect(
      offenders,
      `Form control outlined with a decorative hairline; use border-field:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
