/**
 * Consent state, in one place.
 *
 * The cookie banner writes this and the analytics layer reads it. Keeping the
 * key here rather than duplicated in both is the same "one home" rule the brand
 * name and the disclosures follow: two copies of a storage key drift silently,
 * and the failure mode is analytics running for someone who declined.
 */

export const CONSENT_KEY = "vantiq-cookie-consent";

export type ConsentValue = "accepted" | "declined";

/**
 * Reads the stored preference. Unreadable storage — strict privacy modes and
 * enterprise policy both throw on `localStorage` — is treated as "no choice
 * recorded", which callers must treat as *not* consent.
 */
export function readConsent(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentValue): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* Preference is not persisted; the banner reappears next visit. */
  }
}

/**
 * The single decision point for "may anything be recorded?".
 *
 * Anything other than an explicit acceptance is a no: no stored value, a
 * declined value, an unreadable store. Stated as a named function so it can be
 * tested without a browser and so no caller is tempted to reimplement it as
 * `consent !== "declined"`, which would record for visitors who never answered.
 */
export function hasAnalyticsConsent(consent: string | null): boolean {
  return consent === "accepted";
}
