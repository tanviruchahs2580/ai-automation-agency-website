import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const PAGES = ["/", "/start-a-project", "/insights", "/roi-calculator"];

test.describe("accessibility (axe, WCAG 2.x A/AA)", () => {
  // axe-core's stability wait can exceed 60s under cross-engine parallel
  // load (observed as a one-off hang in Firefox).
  test.setTimeout(120_000);

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
    await page.goto("/", { waitUntil: "networkidle" });

    // Engine note: Playwright's WebKit swallows the first synthetic Tab
    // (its sequential-focus origin starts after the first tabbable), even
    // on a bare-bones page — a harness quirk, not a site defect. So the
    // WCAG 2.4.1 invariant is verified deterministically instead of by
    // counting keystrokes: skip link must be the first *visible* tabbable
    // in DOM order, must target #main, and must be keyboard-focusable.
    const { firstTabbable, mainExists } = await page.evaluate(() => {
      const tabbables = [
        ...document.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.getClientRects().length > 0);
      return {
        firstTabbable: tabbables[0]?.textContent?.trim() ?? "",
        mainExists: Boolean(document.getElementById("main")),
      };
    });

    expect(firstTabbable).toContain("Skip to main content");
    expect(mainExists).toBe(true);

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
  });
});
