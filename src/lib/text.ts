/**
 * Text shaping helpers for metadata and previews.
 *
 * These exist because meta descriptions were being produced with raw
 * `.slice(0, 155)`, which cuts mid-word and mid-clause — the failure mode is
 * visible in a search result as "…read the field guide to evaluating anc". The
 * helpers below cut on a word boundary and, where useful, on a sentence
 * boundary first.
 */

/** Collapses whitespace so multi-line content does not become one long line. */
export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Truncates at or before `max` characters, preferring the end of a sentence and
 * falling back to the end of a word. Never returns a partial word, and never
 * exceeds `max`.
 */
export function truncateAtWord(value: string, max: number): string {
  const text = collapseWhitespace(value);
  if (text.length <= max) return text;

  const window = text.slice(0, max);
  // Prefer a sentence end, but only if it leaves most of the budget used.
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! "),
  );
  if (sentenceEnd >= max * 0.6) return window.slice(0, sentenceEnd + 1);

  const wordEnd = window.lastIndexOf(" ");
  const cut = wordEnd > 0 ? window.slice(0, wordEnd) : window;
  return `${cut.replace(/[,;:.\-–—]$/, "")}…`;
}

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
] as const;

/**
 * Spell out a small count so headings can state it from data without losing the
 * typographic quality of a written number.
 *
 * Several headings used to hard-code their own count next to the array they
 * described ("Senior engineers across eight disciplines." beside a list of
 * eight), which is correct until someone edits the list. Deriving the number
 * keeps the copy identical today while making it impossible to drift.
 */
export function countWord(count: number): string {
  return NUMBER_WORDS[count] ?? String(count);
}

/**
 * Capitalises the first character, leaving the rest alone.
 *
 * Needed because a heading typically starts with the derived count ("Ten
 * commitments we can be measured against."), and a written number at the start
 * of a sentence is capitalised. Deriving the count without this lowercased six
 * visible headings — "ten commitments…", "seven short steps…" — which is how a
 * correctness fix turns into a copy regression.
 */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

