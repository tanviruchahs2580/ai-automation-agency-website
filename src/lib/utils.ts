export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return usd.format(Math.round(value));
}

const numberFmt = new Intl.NumberFormat("en-US");

export function formatNumber(value: number): string {
  return numberFmt.format(Math.round(value));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const COUNT_WORDS = [
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
 * Spelled-out cardinal for counts that appear inside copy, so headline text
 * such as "Seven services, one accountable team." is derived from the data
 * instead of being retyped next to it. House style spells these numbers
 * out, so `formatNumber` cannot be used for them.
 *
 * Falls back to the numeral beyond the table rather than guessing a word.
 */
export function countWord(value: number, options?: { capitalize?: boolean }): string {
  const word = COUNT_WORDS[value] ?? String(value);
  if (!options?.capitalize || word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}
