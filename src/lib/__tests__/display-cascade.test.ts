import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { relativeToSrc, sourceFiles, stripComments } from "./source-scan";

/**
 * `display` must be settable by a Tailwind utility on every component.
 *
 * Six project classes (`.btn`, `.chip`, `.marquee-track`, `.service-row-grid`,
 * `.signal-dot`, `.signal-loader`) declared `display` in *unlayered* CSS. Since
 * unlayered CSS outranks every Tailwind layer, a display utility on the same
 * element silently did nothing — so `lg:hidden` on a `.btn` rendered that button
 * at every width, and the header ended up showing "Start" beside the desktop
 * cluster's "Start a Project".
 *
 * That hazard had already produced one bug of exactly this shape in this
 * codebase (`.h-card` silently beating `font-editorial` and `text-xl` on the
 * insight cards, so the editorial typeface never rendered). Two instances is a
 * pattern, so the fix was structural — those classes now declare `display` inside
 * `@layer components` — and these tests keep it structural.
 */

const CSS = readFileSync("src/app/globals.css", "utf8");

/** Project classes whose display value lives in the components layer. */
const LAYERED_DISPLAY_CLASSES = [
  "chip",
  "marquee-track",
  "service-row-grid",
  "signal-dot",
  "signal-loader",
  "btn",
];

const DISPLAY_UTILITY =
  /^(?:sm:|md:|lg:|xl:|2xl:|focus:|hover:|group-hover:|max-\[[^\]]+\]:)*(?:hidden|flex|inline-flex|block|inline-block|grid|inline-grid|contents)$/;

describe("display cascade", () => {
  it("declares display for these classes inside @layer components", () => {
    const layerStart = CSS.indexOf("@layer components {");
    expect(layerStart, "no @layer components block in globals.css").toBeGreaterThan(-1);
    const layered = CSS.slice(layerStart, CSS.indexOf("\n}", layerStart));

    for (const name of LAYERED_DISPLAY_CLASSES) {
      const escaped = name.replace("-", "\\-");
      expect(layered, `no @layer components rule for .${name}`).toMatch(
        new RegExp(`\\.${escaped}\\s*\\{[^}]*display:`),
      );
    }
  });

  it("declares display nowhere else for those classes", () => {
    /*
      A second, unlayered `display` would win again and silently restore the bug.
      This walks the stylesheet rule by rule, tracking whether the current rule
      sits inside a layer, and fails on any unlayered declaration for these
      classes.
    */
    let depth = 0;
    let inLayer = false;
    let selector = "";
    const offenders: string[] = [];

    for (const rawLine of CSS.split("\n")) {
      const line = rawLine.trim();
      if (line.startsWith("@layer")) inLayer = true;
      if (line.endsWith("{") && !line.startsWith("@")) selector = line.replace("{", "").trim();
      if (line.endsWith("{")) depth += 1;

      if (!inLayer && line.startsWith("display:")) {
        for (const name of LAYERED_DISPLAY_CLASSES) {
          const escaped = name.replace("-", "\\-");
          if (new RegExp(`\\.${escaped}(?![a-z-])`).test(selector)) {
            offenders.push(`${selector} { ${line} }`);
          }
        }
      }

      if (line === "}") {
        depth -= 1;
        if (depth <= 0) {
          inLayer = false;
          selector = "";
        }
      }
    }

    expect(
      offenders,
      `Unlayered display declaration — no utility could override it:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("has no class list that hides a layered-display element by accident", () => {
    /*
      Every string literal is scanned, not just `className="..."` attributes.

      The first version of this test scanned attributes only, and it passed while
      `lg:hidden` sat on the `.btn` base class list in `Button.tsx` — because that
      list is a const string composed with `cn(base, variants[kind], className)`,
      which is how most buttons here are built. It was caught by deliberately
      reintroducing the defect and watching the test stay green, which is the only
      way to know a scanner is looking at the right thing.

      Comments are stripped first and tokens are matched exactly, so prose that
      mentions a class name is not a hit.
    */
    const combos: string[] = [];

    for (const file of sourceFiles()) {
      const relative = relativeToSrc(file);
      if (relative.includes("__tests__")) continue;

      const source = stripComments(readFileSync(file, "utf8"));
      const literals = [...source.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g)].map(
        (match) => match[1] ?? match[2] ?? match[3] ?? "",
      );

      for (const value of literals) {
        const tokens = value.split(/\s+/).filter(Boolean);
        const project = tokens.filter((token) => LAYERED_DISPLAY_CLASSES.includes(token));
        if (project.length === 0) continue;
        const utilities = tokens.filter((token) => DISPLAY_UTILITY.test(token));
        if (utilities.length === 0) continue;

        combos.push(`${relative}  [${project.join(", ")}]  ${utilities.join(", ")}`);
      }
    }

    /* Nothing relies on a display utility overriding a project class today. If
       this list grows, read each entry: the utility is now what decides, so it is
       either deliberate or the original bug returning. */
    expect(
      [...new Set(combos)],
      `Display utility combined with a project display class:\n${combos.join("\n")}`,
    ).toEqual([]);
  });
});
