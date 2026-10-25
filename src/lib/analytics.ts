/**
 * Analytics integration point.
 *
 * **No provider is wired, and nothing is recorded today.** That is a decision
 * rather than an oversight, and this module is written so the decision is
 * visible rather than implied:
 *
 *  - `track()` with no provider configured does nothing at all. It is not
 *    "tracking into the void" — there is nothing to send to, and the cookie
 *    banner's copy already tells visitors that no advertising or analytics
 *    cookies are set today.
 *  - It is **consent-gated by construction**. `track()` returns early unless the
 *    visitor accepted the banner. Wiring a provider later therefore cannot
 *    accidentally record for someone who declined, which is the compliance bug
 *    this kind of module usually ships with.
 *  - `trackWith()` takes its dependencies as an argument, so the gating is
 *    unit-tested without a browser.
 *
 * To add a provider: assign the dispatch function to `window.__vantiqAnalytics`
 * from whatever loader the provider needs (a `<Script>` in the layout, say).
 * Nothing here has to change, and the CSP in `next.config.ts` is where the
 * provider's origin gets allow-listed.
 */

import { CONSENT_KEY } from "@/lib/consent";

export const AnalyticsEvent = {
  CtaClick: "cta_click",
  OpportunitySelect: "opportunity_select",
  AssessmentStart: "assessment_start",
  AssessmentComplete: "assessment_complete",
  CalculatorUse: "calculator_use",
  CaseStudyOpen: "case_study_open",
  IntakeStart: "intake_start",
  IntakeComplete: "intake_complete",
  MeetingClick: "meeting_click",
  NavToggle: "nav_toggle",
  ScrollDepth: "scroll_depth",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export type AnalyticsParams = Record<string, string | number | boolean>;
export type AnalyticsDispatch = (
  event: AnalyticsEventName,
  params?: AnalyticsParams,
) => void;

export interface AnalyticsDeps {
  /** Stored consent value, or `null` when nothing is recorded. */
  consent: string | null;
  /** The provider's dispatch function, when one has been registered. */
  dispatch: AnalyticsDispatch | null;
  /** Called when an event is accepted but no provider exists (development only). */
  onUnconfigured?: (event: AnalyticsEventName, params?: AnalyticsParams) => void;
}

/**
 * Consent gate plus provider dispatch, with no browser access.
 *
 * Exported so the two things that actually matter — "does a declined visitor
 * send anything?" and "is the provider called with the right arguments when a
 * consenting visitor acts?" — are assertions rather than hopes.
 */
export function trackWith(
  deps: AnalyticsDeps,
  event: AnalyticsEventName,
  params?: AnalyticsParams,
): void {
  if (deps.consent !== "accepted") return;
  if (!deps.dispatch) {
    deps.onUnconfigured?.(event, params);
    return;
  }
  deps.dispatch(event, params);
}

declare global {
  interface Window {
    /** Provider hook point. Unset until a provider is chosen. */
    __vantiqAnalytics?: AnalyticsDispatch;
  }
}

/**
 * Page-side entry point. Never throws: an analytics bug must not break a form
 * submission or a tool result.
 */
export function track(event: AnalyticsEventName, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;
  try {
    trackWith(
      {
        consent: window.localStorage.getItem(CONSENT_KEY),
        dispatch: window.__vantiqAnalytics ?? null,
        onUnconfigured:
          process.env.NODE_ENV === "development"
            ? (name, payload) => console.debug("[analytics]", name, payload ?? {})
            : undefined,
      },
      event,
      params,
    );
  } catch {
    /* Storage can throw in strict privacy modes; analytics is never critical. */
  }
}
