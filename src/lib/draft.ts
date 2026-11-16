/**
 * Intake draft retention.
 *
 * The wizard mirrors its form state into `localStorage` on every change so a
 * visitor who navigates away mid-brief does not lose five steps of typing. That
 * draft contains the visitor's name, email, role and a description of their
 * business problem — personal data written to disk on a machine we do not
 * control, and on a shared or borrowed machine readable by the next person to
 * open the browser.
 *
 * `savedAt` was already being written, but only to render "Restored draft from
 * Nov 3" in the restore banner. Nothing ever aged the draft out, so it lived
 * until the visitor clicked "Start fresh" or cleared site data — which is to say,
 * indefinitely. The privacy page's retention statement was therefore not true of
 * the browser copy.
 *
 * A fixed TTL makes restore honest: past the window the draft is treated as if
 * it were never there, and the caller clears the key. The decision lives here,
 * as a pure function, so it can be tested without a DOM or a clock.
 */

/** How long a stored draft may be restored, in milliseconds. */
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Whether a stored draft may be restored.
 *
 * Anything that is not a plausible timestamp is treated as expired rather than
 * trusted. That inverts the usual default deliberately: a corrupted or hostile
 * `savedAt` (`"soon"`, `NaN`, `-1`, a value from the far future) must not be
 * able to extend a draft's life, because the only thing it buys is keeping PII
 * on disk longer than the policy states.
 *
 * @param savedAt  The stored `savedAt` value, of unknown type.
 * @param now      Current epoch milliseconds. Injectable for tests.
 */
export function isDraftRestorable(savedAt: unknown, now = Date.now()): boolean {
  if (typeof savedAt !== "number" || !Number.isFinite(savedAt)) return false;
  // A draft "saved" in the future is a clock change or tampering, not a draft.
  if (savedAt > now) return false;
  return now - savedAt < DRAFT_TTL_MS;
}
