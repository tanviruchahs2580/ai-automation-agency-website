import { expect, test } from "@playwright/test";

test.describe("interactive tools", () => {
  test("ROI calculator computes estimated savings from inputs", async ({ page }) => {
    await page.goto("/roi-calculator");
    await page.getByLabel("Employees doing this work").fill("50");
    await page.getByLabel("Average annual salary").fill("60000");
    await page.getByLabel("Hours per task (manual)").fill("1");
    await page.getByLabel("Tasks per employee / week").fill("10");

    const live = page.locator('[aria-live="polite"]').filter({
      hasText: "Estimated outcome",
    });
    await expect(live.getByText("Est. annual savings")).toBeVisible();

    const savings = live
      .locator("dd, div")
      .filter({ hasText: /\$[\d,]+/ })
      .first();
    await expect(savings).toContainText("$");
  });

  test("readiness assessment completes and shows a score", async ({ page }) => {
    await page.goto("/ai-readiness");
    // Answer every question by choosing the strongest option each time.
    for (let i = 0; i < 12; i++) {
      const buttons = page
        .locator('[aria-live="polite"] button, form button[type="button"]')
        .filter({ hasText: /.+/ });
      const visible = await buttons.first().isVisible().catch(() => false);
      if (!visible) break;
      // Click the last (highest) option if present, else the only one.
      const option = buttons.last();
      await option.click();
      await page.waitForTimeout(150);
    }
    await expect(page.getByText(/AI readiness score/i)).toBeVisible({ timeout: 15_000 });
  });

  test("project intake wizard submits end-to-end and shows reference ID", async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    await page.goto("/start-a-project");

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
    await page.goto("/start-a-project");
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByText("Company name is required.")).toBeVisible();
  });
});
