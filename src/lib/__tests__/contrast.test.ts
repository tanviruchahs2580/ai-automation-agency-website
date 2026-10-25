import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Machine-checked colour contrast.
 *
 * Two of the audit's highest-impact accessibility defects were structurally
 * invisible to the existing axe gate:
 *
 *  1. `.btn-primary` — the primary call to action on every page — painted white
 *     label text on a *gradient*, topmost stop `rgb(103,148,255)` = 2.89:1. axe
 *     cannot evaluate gradient backgrounds; it reports them as "incomplete",
 *     never as a violation, so the scan was clean while the text was unreadable.
 *  2. Form fields were identified only by a 9%-alpha hairline, about 1.2:1
 *     against their own fill. axe does not implement WCAG 1.4.11 (non-text
 *     contrast) at all.
 *
 * This file reads `globals.css` — the stylesheet that actually ships — resolves
 * the custom properties and `color-mix()` values, and computes real WCAG 2.2
 * ratios. It is deliberately the authoritative record of contrast: the numbers
 * are not duplicated into prose documentation, where they went stale.
 */

const CSS = readFileSync(
  path.join(process.cwd(), "src", "app", "globals.css"),
  "utf8",
);

type Rgb = { r: number; g: number; b: number; a: number };

/* ---------- colour parsing ---------- */

function parseColour(value: string): Rgb {
  const text = value.trim();

  const hex = /^#([0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const n = parseInt(hex[1]!, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }

  const shortHex = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(text);
  if (shortHex) {
    return {
      r: parseInt(shortHex[1]! + shortHex[1]!, 16),
      g: parseInt(shortHex[2]! + shortHex[2]!, 16),
      b: parseInt(shortHex[3]! + shortHex[3]!, 16),
      a: 1,
    };
  }

  const rgba = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/i.exec(
    text,
  );
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }

  throw new Error(`Unsupported colour value in test parser: "${value}"`);
}

/** `color-mix(in srgb, A p%, B)` — component-wise sRGB interpolation. */
function parseColorMix(value: string, themeVariables: TokenMap): Rgb {
  const match = /^color-mix\(\s*in srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+?)\s*\)$/.exec(
    value.trim(),
  );
  if (!match) throw new Error(`Unsupported color-mix: "${value}"`);
  const [, rawA, rawPercent, rawB] = match;
  const a = parseColourValue(rawA!, themeVariables);
  const b = parseColourValue(rawB!, themeVariables);
  const p = Number(rawPercent) / 100;
  return {
    r: a.r * p + b.r * (1 - p),
    g: a.g * p + b.g * (1 - p),
    b: a.b * p + b.b * (1 - p),
    a: 1,
  };
}

function parseColourValue(value: string, themeVariables?: TokenMap): Rgb {
  const text = value.trim();
  const varRef = /^var\((--[a-z0-9-]+)\)$/i.exec(text);
  if (varRef) {
    if (!themeVariables) throw new Error(`Cannot resolve ${text} without a theme`);
    const resolved = themeVariables.get(varRef[1]!);
    if (!resolved) throw new Error(`Unknown token ${text}`);
    return parseColour(resolved);
  }
  if (text.startsWith("color-mix(")) return parseColorMix(text, themeVariables!);
  return parseColour(text);
}

/** Flattens a translucent colour onto an opaque backdrop. */
function composite(fg: Rgb, bg: Rgb): Rgb {
  if (fg.a >= 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

/* ---------- WCAG maths ---------- */

function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(colour: Rgb): number {
  return (
    0.2126 * linearise(colour.r) +
    0.7152 * linearise(colour.g) +
    0.0722 * linearise(colour.b)
  );
}

function contrast(foreground: Rgb, background: Rgb): number {
  const l1 = luminance(composite(foreground, background));
  const l2 = luminance(background);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

/* ---------- stylesheet extraction ---------- */

type TokenMap = Map<string, string>;

function blockAfter(startIndex: number): string {
  let depth = 0;
  for (let i = startIndex; i < CSS.length; i += 1) {
    if (CSS[i] === "{") depth += 1;
    else if (CSS[i] === "}") {
      depth -= 1;
      if (depth === 0) return CSS.slice(startIndex + 1, i);
    }
  }
  throw new Error("Unbalanced braces in globals.css");
}

function tokensFrom(selector: string): TokenMap {
  const index = CSS.indexOf(selector);
  expect(index, `selector ${selector} not found in globals.css`).toBeGreaterThan(-1);
  const body = blockAfter(CSS.indexOf("{", index));

  /*
    Strip comments first: the token block is heavily commented, and prose
    containing a colon would otherwise be parsed as a declaration.
  */
  const withoutComments = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const map: TokenMap = new Map();
  for (const match of withoutComments.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    map.set(match[1]!, match[2]!.trim());
  }
  return map;
}

const darkTokens = tokensFrom("@theme {");
const lightTokens = new Map([...darkTokens, ...tokensFrom('[data-theme="light"] {')]);

/**
 * Splits a comma-separated CSS value at top level only, so commas inside
 * `color-mix(...)` or `var(...)` do not split a single stop into fragments. A
 * regex cannot do this reliably: a negative lookahead for "comma not followed
 * by a closing paren" also fires on nested parentheses, which is exactly how an
 * earlier version of this test ended up trying to parse `color-mix(in srgb`.
 */
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Every declaration of `background:` inside rules whose selector matches. */
function backgroundStops(selector: string, tokens: TokenMap): Array<{ stop: Rgb; label: string }> {
  const results: Array<{ stop: Rgb; label: string }> = [];
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ruleRegex = new RegExp(`([^{}]*${escaped}[^{}]*)\\{([^}]*)\\}`, "g");
  for (const rule of CSS.matchAll(ruleRegex)) {
    const declaration = /background:\s*linear-gradient\(([^;]+)\);/.exec(rule[2]!);
    if (!declaration) continue;
    const stops = splitTopLevel(declaration[1]!);
    // First stop is the direction ("to bottom"); the rest are colours.
    for (const stop of stops.slice(1)) {
      results.push({
        stop: parseColourValue(stop, tokens),
        label: `${rule[1]!.trim()} → ${stop}`,
      });
    }
  }
  return results;
}

const WHITE: Rgb = { r: 255, g: 255, b: 255, a: 1 };

/* ---------- assertions ---------- */

describe("primary button contrast (WCAG AA, white label text)", () => {
  const AA_NORMAL_TEXT = 4.5;

  /*
    `.btn-primary` is defined by a base rule, a `:hover` rule and two
    light-theme overrides. Each rule is evaluated against the token set of the
    theme it belongs to — evaluating a light override under dark tokens resolves
    `var(--color-accent-strong)` to the dark value (#5285ff, 3.41:1) and reports
    a failure that no browser would ever render. Every rule in its own theme is
    the complete set.
  */
  const rulesByTheme = [
    { themeName: "dark", tokens: darkTokens, isLightRule: false },
    { themeName: "light", tokens: lightTokens, isLightRule: true },
  ] as const;

  for (const { themeName, tokens, isLightRule } of rulesByTheme) {
    it(`${themeName} theme: every gradient stop clears 4.5:1 against white`, () => {
      const stops = backgroundStops("btn-primary", tokens).filter((rule) =>
        isLightRule ? rule.label.includes("data-theme") : !rule.label.includes("data-theme"),
      );

      /*
        Assert *which* rules were found, not merely that some were.

        `expect(stops.length).toBeGreaterThan(0)` passed on a mutated stylesheet
        where the resting-state declaration had been replaced with a flat red:
        the `:hover` rule alone kept the count above zero, so deleting the button's
        real gradient would have gone unnoticed. The count and the presence of an
        unsuffixed rule are both pinned now, which means removing or renaming the
        base declaration fails here.
      */
      const selectors = stops.map((rule) => rule.label.split(" → ")[0]!);
      expect(
        selectors.some((selector) => !selector.includes(":")),
        `no unsuffixed .btn-primary rule parsed for ${themeName}; got ${selectors.join(" | ")}`,
      ).toBe(true);
      expect(
        stops.length,
        `${themeName} .btn-primary gradient stops: ${selectors.join(" | ")}`,
      ).toBeGreaterThanOrEqual(2);

      for (const { stop, label } of stops) {
        const ratio = contrast(WHITE, stop);
        expect(ratio, `${label} measured ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
          AA_NORMAL_TEXT,
        );
      }
    });
  }

  it("accent-strong is not used as a solid fill behind white text", () => {
    /*
      #5285ff measures 3.41:1 against white. It is a legitimate *text* colour on
      a dark canvas (5.77:1) and the bug was using it as a background. This
      asserts the distinction holds: no dark-theme gradient stop may resolve to
      it.
    */
    const accentStrong = parseColour(darkTokens.get("--color-accent-strong")!);
    expect(contrast(WHITE, accentStrong)).toBeLessThan(AA_NORMAL_TEXT);
    const darkRulesOnly = backgroundStops("btn-primary", darkTokens).filter(
      (rule) => !rule.label.includes("data-theme"),
    );
    expect(darkRulesOnly.length).toBeGreaterThan(0);
    for (const { stop, label } of darkRulesOnly) {
      /* All three channels, not just red: comparing `r` alone let any colour
         with a different red channel through, which is nearly all of them. */
      const sameColour =
        Math.round(stop.r) === accentStrong.r &&
        Math.round(stop.g) === accentStrong.g &&
        Math.round(stop.b) === accentStrong.b;
      expect(sameColour, `${label} resolves to --color-accent-strong`).toBe(false);
    }
  });
});

describe("text token contrast", () => {
  const AA_NORMAL_TEXT = 4.5;

  const pairs: Array<[string, string, string]> = [
    ["ink", "canvas", "body text on the page background"],
    ["ink", "surface", "body text on a card"],
    ["muted", "canvas", "secondary text"],
    ["muted", "surface2", "secondary text on an inset panel"],
    ["faint", "canvas", "tertiary/label text"],
    ["faint", "surface2", "tertiary/label text on an inset panel"],
    ["accent-bright", "canvas", "accent text on dark"],
    ["accent-strong", "canvas", "links"],
  ];

  for (const [fgName, bgName, description] of pairs) {
    it(`${description} (dark)`, () => {
      const fg = parseColourValue(`var(--color-${fgName})`, darkTokens);
      const bg = parseColourValue(`var(--color-${bgName})`, darkTokens);
      const ratio = contrast(composite(fg, bg), bg);
      expect(ratio, `${fgName} on ${bgName} = ${ratio.toFixed(2)}:1`)
        .toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });
  }

  for (const [fgName, bgName, description] of pairs) {
    it(`${description} (light)`, () => {
      const fg = parseColourValue(`var(--color-${fgName})`, lightTokens);
      const bg = parseColourValue(`var(--color-${bgName})`, lightTokens);
      const ratio = contrast(composite(fg, bg), bg);
      expect(ratio, `${fgName} on ${bgName} = ${ratio.toFixed(2)}:1`)
        .toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });
  }

  it("muted and faint are distinguishable levels in both themes", () => {
    /*
      In light theme both were #374151, which collapsed the two-level hierarchy
      into one across ~30 call sites. Equal values here are a token bug, not a
      style choice.
    */
    expect(lightTokens.get("--color-muted")).not.toBe(lightTokens.get("--color-faint"));
    expect(darkTokens.get("--color-muted")).not.toBe(darkTokens.get("--color-faint"));
  });
});

describe("interactive control boundaries (WCAG 1.4.11, 3:1)", () => {
  const NON_TEXT = 3;

  for (const [themeName, tokens] of [
    ["dark", darkTokens],
    ["light", lightTokens],
  ] as const) {
    it(`field border contrasts ≥3:1 against its own fill and the page (${themeName})`, () => {
      const border = parseColourValue("var(--color-field)", tokens);
      const fill = parseColourValue("var(--color-surface2)", tokens);
      const canvas = parseColourValue("var(--color-canvas)", tokens);

      // Translucent borders are evaluated as composited over each backdrop.
      const overFill = contrast(composite(border, fill), fill);
      const overCanvas = contrast(composite(border, canvas), canvas);

      expect(overFill, `field border on surface2 = ${overFill.toFixed(2)}:1`)
        .toBeGreaterThanOrEqual(NON_TEXT);
      expect(overCanvas, `field border on canvas = ${overCanvas.toFixed(2)}:1`)
        .toBeGreaterThanOrEqual(NON_TEXT);
    });

    it(`the decorative hairline token is NOT expected to pass 1.4.11 (${themeName})`, () => {
      /*
        Guards the intent behind having two tokens: if `--color-line` ever
        reaches 3:1, the two have been conflated and the airy hairline aesthetic
        has been lost by accident; if `--color-field` falls below it, controls
        have become invisible again. Both are asserted so neither drifts.
      */
      const line = parseColourValue("var(--color-line)", tokens);
      const fill = parseColourValue("var(--color-surface2)", tokens);
      expect(contrast(composite(line, fill), fill)).toBeLessThan(NON_TEXT);
    });
  }

  it("the accent focus ring contrasts ≥3:1 against both surfaces", () => {
    for (const tokens of [darkTokens, lightTokens]) {
      const ring = parseColourValue("var(--color-accent)", tokens);
      for (const surface of ["canvas", "surface", "surface2"]) {
        const bg = parseColourValue(`var(--color-${surface})`, tokens);
        const ratio = contrast(ring, bg);
        expect(ratio, `focus ring on ${surface} = ${ratio.toFixed(2)}:1`)
          .toBeGreaterThanOrEqual(NON_TEXT);
      }
    }
  });
});
