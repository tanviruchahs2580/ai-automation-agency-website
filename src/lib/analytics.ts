/**
 * Analytics abstraction.
 *
 * A single integration point so the provider (GA4, Plausible, Segment, ...)
 * can be swapped without touching product code. No personal information is
 * collected beyond explicit interaction events. Replace `dispatch` when a
 * provider is selected.
 */

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
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

type Dispatch = (
  event: AnalyticsEventName,
  params?: Record<string, string | number | boolean>,
) => void;

const dispatch: Dispatch = (event, params) => {
  if (typeof window === "undefined") return;
  // Provider hook point — e.g. window.dataLayer.push({ event, ...params })
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, params ?? {});
  }
};

export function track(
  event: AnalyticsEventName,
  params?: Record<string, string | number | boolean>,
): void {
  try {
    dispatch(event, params);
  } catch {
    /* analytics must never break the product */
  }
}
