import { expect, test } from "@playwright/test";

test("Start fresh removes a restored legacy draft from browser storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "vantiq:intake-draft:v1",
      JSON.stringify({ companyName: "Legacy Acme", savedAt: Date.now() }),
    );
  });

  await page.goto("/start-a-project");
  await expect(page.getByTestId("intake-wizard")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
  await expect(page.getByRole("status")).toContainText("Restored draft");
  await expect(page.getByLabel("Company name")).toHaveValue("Legacy Acme");

  await page.getByRole("button", { name: "Start fresh" }).click();

  await expect(page.getByLabel("Company name")).toHaveValue("");
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => ({
        current: window.localStorage.getItem("arkyon:intake-draft:v1"),
        legacy: window.localStorage.getItem("vantiq:intake-draft:v1"),
      })),
    )
    .toEqual({ current: null, legacy: null });
});
