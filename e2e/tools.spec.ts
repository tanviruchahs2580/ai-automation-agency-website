import { expect, test, type Page } from "@playwright/test";

/**
 * Waits for the client tree to mount before interacting. The intake wizard has
 * its own `data-hydrated` marker for the same reason; this is the document-level
 * equivalent, used by the tests that click a control straight after `goto`.
 */
async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === "true",
    undefined,
    { timeout: 30_000 },
  );
}

test.describe("interactive tools", () => {
  test("ROI calculator computes estimated savings from inputs", async ({ page }) => {
    await page.goto("/roi-calculator");
    await waitForHydration(page);
    await page.getByLabel("Current headcount on manual ops").fill("50");
    // Progressive disclosure: advanced inputs sit behind "Refine this estimate".
    await page.getByRole("button", { name: /refine this estimate/i }).click();
    await page.getByLabel("Average annual salary").fill("60000");
    await page.getByLabel("Hours per task (manual)").fill("1");
    await page.getByLabel("Tasks per employee / week").fill("10");

    /*
      Located structurally, not by `aria-live`.

      The results panel used to be one big `aria-live="polite"` region, and this
      test found it through that attribute — so it was asserting the very thing
      the accessibility audit asked to remove. Every metric in that panel is
      recomputed from `inputs` on each keystroke, so the polite queue announced
      roughly a dozen numbers per typed digit and could not be interrupted.
      The live region is now a single debounced sentence, asserted separately
      below, and the panel is ordinary content.

      `aria-live="off"` is explicit because that is the deliberate decision, not
      an omission: the panel must not be a live region.
    */
    const panel = page
      .locator('[data-testid="roi-results"]')
      .filter({ hasText: "Estimated outcome" });
    await expect(panel.getByText("Est. annual savings")).toBeVisible();

    const savings = panel
      .locator("dd, div")
      .filter({ hasText: /\$[\d,]+/ })
      .first();
    await expect(savings).toContainText("$");

    /* The debounced summary is the accessible announcement. */
    const summary = page.getByRole("status").filter({ hasText: "Estimate updated" });
    await expect(summary).toContainText("Annual savings");
    await expect(summary).toContainText("payback period");
  });

  test("readiness assessment completes and shows a score", async ({ page }) => {
    /*
      Reduced motion, deliberately. globals.css ships `html { scroll-behavior:
      smooth }` and disables it under `prefers-reduced-motion: reduce`. With
      smooth scrolling active, each answer re-renders the question and WebKit's
      scroll animation keeps the option buttons moving past Playwright's
      stability check, so clicks intermittently burned their whole timeout —
      reproduced on the unmodified component, so it predates this change. The
      assertions below are unchanged.
    */
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ai-readiness");

    // The assessment is gated behind an explicit start button; without it the
    // question region never renders. Assert on the result card, never on the
    // page hero (which also contains the words "AI readiness score" and made
    // an earlier version of this test pass with zero questions answered).
    await page.getByRole("button", { name: /Start the Assessment/ }).click();

    const scale = /^(Not at all|Partially|Moderately|Largely|Fully)/;
    let answered = 0;
    for (let i = 0; i < 12; i++) {
      const option = page.getByRole("button", { name: scale });
      const visible = await option.first().isVisible().catch(() => false);
      if (!visible) break;
      await option.last().click();
      answered++;
      /*
        Deterministic sync instead of a fixed 150ms sleep. The fixed sleep was
        the flakiest part of this suite: under load the next question had not
        settled when the following click was issued, and the click burned its
        whole timeout waiting for a stable target. Waiting for the question
        counter to advance proves the view actually changed, which is a
        stronger check than sleeping and hoping.
      */
      if (answered < 10) {
        await expect(page.getByText(`Question ${answered + 1} / 10`)).toBeVisible();
      }
    }

    expect(answered).toBe(10);
    await expect(page.getByRole("button", { name: /Retake/ })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Recommended next step")).toBeVisible();
    await expect(page.getByText(/out of 100/)).toBeVisible();
  });

  test("project intake wizard submits end-to-end and shows reference ID", async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    // Same reason as the readiness test: the wizard animates each step, and
    // reduced motion settles it so field actions are not racing the animation.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openHydratedWizard(page);

    // Step 1 — Business
    await page.locator("#f-companyName").fill(`E2E Verify Co ${Date.now()}`);
    await page.locator("#f-companySize").selectOption({ index: 2 });
    await page.locator("#f-industry").fill("Logistics");
    await page.locator("#f-country").fill("Germany");
    await page.getByRole("button", { name: /Continue/ }).click();

    // Step 2 — Problem
    await page
      .locator("#f-problem")
      .fill("Invoice processing is fully manual across three regional teams.");
    await page.getByRole("button", { name: /Continue/ }).click();

    // Step 3 — Current workflow
    await page
      .locator("#f-currentWorkflow")
      .fill("Emails arrive as PDFs, staff key them into SAP by hand.");
    await page.getByRole("button", { name: /Continue/ }).click();

    // Step 4 — Existing software (optional field)
    await page.locator("#f-existingSoftware").fill("SAP, Outlook");
    await page.getByRole("button", { name: /Continue/ }).click();

    // Step 5 — Desired outcome
    await page
      .locator("#f-desiredOutcome")
      .fill("Automated intake with human approval on exceptions only.");
    await page.getByRole("button", { name: /Continue/ }).click();

    // Step 6 — Budget
    await page.locator("#f-budgetRange").selectOption({ index: 1 });
    await page.getByRole("button", { name: /Continue/ }).click();

    // Step 7 — Timeline & contact + consent → submit
    await page.locator("#f-timeline").selectOption({ index: 2 });
    await page.locator("#f-contactName").fill("E2E Tester");
    await page.locator("#f-contactEmail").fill(`e2e-${testInfo.parallelIndex}@example.test`);
    await page.locator("#f-contactRole").fill("CTO");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Submit Project Brief/ }).click();

    await expect(
      page.getByText("Your project brief is ready."),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Reference:\s*PB-/)).toBeVisible();
    await expect(page.getByText("Recommended next step")).toBeVisible();
  });

  test("intake wizard blocks invalid step with inline errors", async ({ page }) => {
    await openHydratedWizard(page);
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByText("Company name is required.")).toBeVisible();
  });
});

/**
 * The wizard's inputs are React-controlled; on slower engines a fill can
 * land before hydration re-attaches state (value silently resets). Wait for
 * the explicit hydration marker instead of racing the framework.
 */
async function openHydratedWizard(page: import("@playwright/test").Page) {
  await page.goto("/start-a-project");
  // 20s: WebKit under a fully-parallel cross-engine run has measured hydration
  // past the 10s default on loaded machines; the marker itself is instant.
  await expect(page.getByTestId("intake-wizard")).toHaveAttribute(
    "data-hydrated",
    "true",
    { timeout: 20_000 },
  );
}
