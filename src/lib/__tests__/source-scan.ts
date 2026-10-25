import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Shared source-scanning helpers for the "this string must have one home" tests
 * (`brand.test.ts`, `disclaimers.test.ts`, `form-controls.test.ts`).
 *
 * Not a test file itself: the vitest config collects files ending in
 * `.test.ts`, so this module is imported by tests rather than executed as one.
 */

export const SRC_ROOT = path.join(process.cwd(), "src");

/** Every `.ts`/`.tsx` file under `dir`, recursively. */
export function sourceFiles(dir: string = SRC_ROOT): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...sourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry)) found.push(full);
  }
  return found;
}

/** Path of a file relative to `src/`, with forward slashes on every platform. */
export function relativeToSrc(file: string): string {
  return path.relative(SRC_ROOT, file).replace(/\\/g, "/");
}

/**
 * Drops comment lines, preserving line numbering.
 *
 * The invariants these tests enforce are about strings that reach a visitor, so
 * a comment naming the brand or a disclosure is fine — and useful, since that is
 * how each placeholder is documented at its call sites.
 *
 * This is deliberately *lexical* rather than a character-level state machine.
 * An earlier version walked the source tracking quotes, which reads well for
 * TypeScript and is wrong for JSX: an apostrophe in visible prose (`the
 * calculator's output`) opened a "string" that never closed, so the rest of the
 * file was treated as string content and comments stopped being stripped. It
 * failed silently in the direction that matters — a test that cannot see the
 * code it is checking. Line-shaped comment detection cannot be derailed that
 * way, and every block comment in this codebase opens at the start of a line, so
 * its interior lines all begin with `*`.
 *
 * The cost is that a block comment opened mid-line is not removed. That only
 * raises the scanner's noise floor for that one line; it cannot hide a
 * violation, because the line is still scanned in full.
 */
export function stripComments(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      const trimmed = line.trimStart();
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*/")
      ) {
        return "";
      }
      /*
        Trailing line comment. The `:` guard keeps a URL intact — `//` after a
        colon is `https://`, not a comment.
      */
      const slash = line.indexOf("//");
      if (slash > 0 && line[slash - 1] !== ":") return line.slice(0, slash);
      return line;
    })
    .join("\n");
}

/**
 * Finds every non-test source occurrence of any of `fragments`.
 * `allow` lists file paths (relative to `src/`) that are permitted to contain
 * them — normally the module that owns the strings.
 */
export function findLiteralOccurrences(
  fragments: readonly string[],
  allow: readonly string[] = [],
): string[] {
  const allowed = new Set(allow);
  const offenders: string[] = [];

  for (const file of sourceFiles()) {
    const relative = relativeToSrc(file);
    if (allowed.has(relative) || relative.includes("__tests__")) continue;

    const contents = stripComments(readFileSync(file, "utf8"));
    contents.split("\n").forEach((line, index) => {
      for (const fragment of fragments) {
        if (line.includes(fragment)) {
          offenders.push(`${relative}:${index + 1}: ${line.trim()}`);
        }
      }
    });
  }

  return offenders;
}
