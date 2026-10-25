import { describe, expect, it, vi } from "vitest";
import { AnalyticsEvent, trackWith, type AnalyticsDeps } from "@/lib/analytics";
import { hasAnalyticsConsent } from "@/lib/consent";

/**
 * The analytics seam is consent-gated, and nothing is recorded without a
 * provider.
 *
 * The previous version of this module had a `dispatch` that did nothing unless
 * `NODE_ENV === "development"`, ignored consent entirely, and was described in a
 * comment as "a single integration point so the provider can be swapped". All
 * three were problems: eleven call sites implied measurement that did not exist,
 * and the moment anyone assigned a provider the module would have started
 * recording for visitors who had explicitly declined — the classic shape of this
 * bug, because the consent check is always "someone else's job" until it is not.
 *
 * `trackWith` takes its dependencies as arguments, so both claims are assertions
 * here rather than conventions in a comment.
 */

function deps(overrides: Partial<AnalyticsDeps> = {}): AnalyticsDeps {
  return { consent: null, dispatch: null, ...overrides };
}

describe("analytics consent gate", () => {
  it("sends nothing when the visitor never answered the banner", () => {
    const dispatch = vi.fn();
    trackWith(deps({ consent: null, dispatch }), AnalyticsEvent.CtaClick);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("sends nothing when the visitor declined", () => {
    const dispatch = vi.fn();
    trackWith(deps({ consent: "declined", dispatch }), AnalyticsEvent.CtaClick);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("sends nothing for any value that is not an explicit acceptance", () => {
    const dispatch = vi.fn();
    for (const consent of ["", "true", "Accepted", "yes", "granted", "decline"]) {
      trackWith(deps({ consent, dispatch }), AnalyticsEvent.CtaClick);
    }
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("dispatches for a consenting visitor when a provider is wired", () => {
    const dispatch = vi.fn();
    trackWith(
      deps({ consent: "accepted", dispatch }),
      AnalyticsEvent.IntakeComplete,
      { location: "wizard" },
    );
    expect(dispatch).toHaveBeenCalledWith(AnalyticsEvent.IntakeComplete, {
      location: "wizard",
    });
  });

  it("reports 'unconfigured' rather than silently dropping, so the gap is visible", () => {
    const onUnconfigured = vi.fn();
    trackWith(
      deps({ consent: "accepted", dispatch: null, onUnconfigured }),
      AnalyticsEvent.CalculatorUse,
    );
    expect(onUnconfigured).toHaveBeenCalledWith(AnalyticsEvent.CalculatorUse, undefined);
  });

  it("does not report 'unconfigured' for a visitor who declined", () => {
    const onUnconfigured = vi.fn();
    trackWith(
      deps({ consent: "declined", dispatch: null, onUnconfigured }),
      AnalyticsEvent.NavToggle,
    );
    expect(onUnconfigured).not.toHaveBeenCalled();
  });
});

describe("hasAnalyticsConsent", () => {
  it("treats every non-acceptance as refusal", () => {
    expect(hasAnalyticsConsent("accepted")).toBe(true);
    for (const value of [null, "", "declined", "ACCEPTED", "accepted "]) {
      expect(hasAnalyticsConsent(value), String(value)).toBe(false);
    }
  });
});

describe("event catalogue", () => {
  it("has unique event names", () => {
    const names = Object.values(AnalyticsEvent);
    expect(new Set(names).size).toBe(names.length);
  });

  it("names every event in snake_case so a provider can map them predictably", () => {
    for (const name of Object.values(AnalyticsEvent)) {
      expect(name, name).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });
});
