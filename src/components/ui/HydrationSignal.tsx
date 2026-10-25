"use client";

import { useEffect } from "react";

/**
 * Marks the document as hydrated once the client tree has mounted.
 *
 * Test-only affordance, and a deliberate one: the E2E suite clicks controls
 * immediately after `goto(..., { waitUntil: "networkidle" })`, which does not
 * guarantee hydration. Under parallel load a click can land on a button that has
 * markup but no handler yet — the click is swallowed, the expected dialog never
 * appears, and the test fails and passes on retry. That is a flaky gate, and a
 * flaky gate gets ignored, which is worse than a slow one.
 *
 * This is the same mechanism `ProjectIntake` already uses (its `data-hydrated`
 * attribute, added for the same reason on slow engines), hoisted to the document
 * so every spec can wait on it rather than each component inventing its own.
 *
 * It touches one attribute on `<html>` after mount, carries no behaviour, and is
 * inert in production beyond a single dataset write.
 */
export function HydrationSignal() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return null;
}
