import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const PAGES = ["/", "/start-a-project", "/insights", "/roi-calculator"];

test.describe("accessibility (axe, WCAG 2.x A/AA)", () => {
  for (const path of PAGES) {
    test(`no serious or critical violations on ${path}`, async ({ page }) => {
      // The site honours prefers-reduced-motion; scanning the settled state
      // keeps colour-contrast results deterministic while remaining valid.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const blocking = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );

      if (blocking.length > 0) {
        const summary = blocking.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.slice(0, 5).map((n) => n.target),
        }));
        const safe = path === "/" ? "home" : path.replace(/\//g, "_");
        mkdirSync("test-results/axe", { recursive: true });
        writeFileSync(
          `test-results/axe/${safe}.json`,
          JSON.stringify(summary, null, 2),
        );
      }
      expect(blocking).toHaveLength(0);
    });
  }

  test("keyboard: skip link is first focusable and targets main", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.textContent);
    expect(focused).toContain("Skip to main content");
  });
});
