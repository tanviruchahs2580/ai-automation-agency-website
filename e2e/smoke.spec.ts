import { expect, test } from "@playwright/test";

test.describe("smoke: core journeys", () => {
  test("homepage renders brand, hero and primary CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VANTIQ/);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start a Project" }).first(),
    ).toBeVisible();
  });

  test("no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/", { waitUntil: "networkidle" });
    expect(errors).toEqual([]);
  });

  test("desktop nav navigates to Solutions", async ({ page }) => {
    test.skip(
      test.info().project.name !== "chromium-desktop",
      "primary nav hidden below lg breakpoint",
    );
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Solutions" }).click();
    await expect(page).toHaveURL(/\/solutions$/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("mobile menu opens and navigates", async ({ page }) => {
    test.skip(
      test.info().project.name !== "chromium-mobile",
      "hamburger only exists below lg breakpoint",
    );
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /menu/i });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Industries" }).click();
    await expect(page).toHaveURL(/\/industries$/);
  });

  test("unknown route returns branded 404 with recovery links", async ({ page }) => {
    const response = await page.goto("/nonexistent-qa-route");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("This page doesn't exist.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible();
  });
});
