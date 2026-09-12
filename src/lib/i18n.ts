/**
 * Locale helpers — i18n scaffold (§11).
 *
 * Only `en` ships today, but every date/number format goes through these
 * helpers with an explicit locale (never bare `.toLocaleString()`), message
 * keys live in `src/messages/<locale>.json`, and layout is RTL-safe
 * (logical properties, `dir`-agnostic flex). Adding a locale = add a
 * messages file + a `[locale]` segment (see `src/lib/i18n.md`).
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
