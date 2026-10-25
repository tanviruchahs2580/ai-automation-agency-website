/**
 * Locale helpers.
 *
 * Only `en-US` ships, and that is a decision rather than an oversight: this is a
 * single-language launch, and a half-wired message catalogue is worse than none.
 * An earlier version of this scaffold claimed `src/messages/<locale>.json` held
 * the UI strings; nothing imported it, and its contents had drifted away from
 * the copy that actually rendered — including a third wording of the
 * "example architecture" disclosure that `BRAND-GUIDE.md` then named as
 * approved. The dead catalogue is gone.
 *
 * What remains is the part that was real and load-bearing:
 *
 *  - every date and number goes through `formatDate` / `formatNumberIntl` with
 *    an explicit locale — never a bare `.toLocaleString()`, which resolves
 *    against the visitor's environment and renders differently per machine;
 *  - shared disclosure copy lives in `src/data/disclaimers.ts` with the same
 *    "one home, enforced by a test" rule as the brand name;
 *  - layout uses logical properties and direction-agnostic flex, so an RTL
 *    locale needs no CSS changes.
 *
 * `src/lib/i18n.md` describes the migration path and exactly what remains
 * unverified.
 */

export const defaultLocale = "en-US" as const;
export const supportedLocales = ["en-US"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export function formatDate(
  value: string | Date,
  locale: string = defaultLocale,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatNumberIntl(
  value: number,
  locale: string = defaultLocale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
