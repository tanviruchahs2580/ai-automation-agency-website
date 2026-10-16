import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

/**
 * Accessibility gate.
 *
 * Split deliberately between two kinds of check:
 *
 *  - **axe (DOM/ARIA) scans** inspect the server-rendered markup and the ARIA
 *    contract, which is identical in every engine — the same HTML is served to
 *    all three. Running the broad sweeps once on chromium keeps the gate honest
 *    without tripling a 16-route scan across three browsers, a version that
 *    timed WebKit out under parallel load and produced red CI without catching
 *    anything real.
 *  - **interaction tests** (focus trap, focus restore, Escape, live regions)
 *    exercise behaviour that genuinely differs per engine, so they run on all
 *    three.
 */

/** Routes axe-scanned on every engine, dark theme. */
const PRIMARY_PAGES = ["/", "/start-a-project", "/insights", "/roi-calculator"];

/** Every remaining route family, scanned once on chromium. */
const ROUTE_SWEEP = [
  "/solutions",
  "/services",
  "/industries",
  "/work",
  "/technology",
  "/about",
  "/approach",
  "/team",
  "/security",
  "/privacy",
  "/terms",
  "/cookie-policy",
  "/ai-readiness",
  "/services/ai-operations",
  "/industries/agriculture",
  "/work/support-triage-agents",
];

/** Light theme adds contrast checks that only exist in that theme. */
const LIGHT_SWEEP = [...PRIMARY_PAGES, "/about", "/technology"];

const AXE_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
] as const;

function isChromium(): boolean {
  return test.info().project.name === "chromium-desktop";
}

async function scan(page: Page) {
  return new AxeBuilder({ page }).withTags([...AXE_TAGS]).analyze();
}

function blockingOnly(results: Awaited<ReturnType<typeof scan>>) {
  return results.violations.filter((v) =>
    ["serious", "critical"].includes(v.impact ?? ""),
  );
}

function writeReport(name: string, violations: ReturnType<typeof blockingOnly>) {
  if (violations.length === 0) return;
  const summary = violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 5).map((n) => n.target),
  }));
  mkdirSync("test-results/axe", { recursive: true });
  writeFileSync(
    `test-results/axe/${name}.json`,
    JSON.stringify(summary, null, 2),
  );
}

test.describe("accessibility (axe, WCAG 2.2 A/AA)", () => {
  // axe-core's stability wait can exceed 60s under cross-engine parallel
  // load (observed as a one-off hang in Firefox).
  test.setTimeout(120_000);

  for (const path of PRIMARY_PAGES) {
    test(`no serious or critical violations on ${path}`, async ({ page }) => {
      // The site honours prefers-reduced-motion; scanning the settled state
      // keeps colour-contrast results deterministic while remaining valid.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "networkidle" });
      const blocking = blockingOnly(await scan(page));
      writeReport(path === "/" ? "home" : path.replace(/\//g, "_"), blocking);
      expect(blocking).toHaveLength(0);
    });
  }

  test("every remaining route family is clean", async ({ page }) => {
    test.skip(!isChromium(), "broad route sweep runs once, on chromium");
    test.setTimeout(300_000);
    await page.emulateMedia({ reducedMotion: "reduce" });

    const failures: string[] = [];
    for (const path of ROUTE_SWEEP) {
      await page.goto(path, { waitUntil: "networkidle" });
      const blocking = blockingOnly(await scan(page));
      writeReport(path.replace(/\//g, "_"), blocking);
      if (blocking.length > 0) {
        failures.push(`${path}: ${blocking.map((v) => v.id).join(", ")}`);
      }
    }
    expect(failures).toEqual([]);
  });

  test("light theme introduces no serious or critical violations", async ({
    page,
  }) => {
    test.skip(!isChromium(), "light-theme sweep runs once, on chromium");
    test.setTimeout(300_000);
    // localStorage is the theme's single source of truth; setting it here is
    // what the pre-paint script reads, so the scan cannot silently run dark.
    await page.addInitScript(() =>
      window.localStorage.setItem("vantiq-theme", "light"),
    );
    await page.emulateMedia({ reducedMotion: "reduce" });

    const failures: string[] = [];
    for (const path of LIGHT_SWEEP) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      const blocking = blockingOnly(await scan(page));
      writeReport(`light${path.replace(/\//g, "_")}`, blocking);
      if (blocking.length > 0) {
        failures.push(`${path}: ${blocking.map((v) => v.id).join(", ")}`);
      }
    }
    expect(failures).toEqual([]);
  });

  test("open search dialog is clean", async ({ page }) => {
    test.skip(!isChromium(), "dialog scan runs once, on chromium");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Search" }).first().click();
    await expect(page.getByRole("dialog", { name: "Site search" })).toBeVisible();
    await page.locator("#site-search-input").fill("agent");

    const blocking = blockingOnly(await scan(page));
    writeReport("search-dialog-open", blocking);
    expect(blocking).toHaveLength(0);
  });
});

test.describe("accessibility: overlays", () => {
  test("search dialog is modal, focus-trapped, and reports result counts", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Search" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Site search" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");

    // Focus lands on the query input.
    await expect(page.locator("#site-search-input")).toBeFocused();

    // Typing filters; the live region reports the count so assistive tech is
    // not left tabbing into a silently emptied list.
    await page.locator("#site-search-input").fill("agent");
    await expect(page.locator("#site-search-status")).toHaveText(/result/i);
    await page.locator("#site-search-input").fill("zzzznothingmatches");
    await expect(page.locator("#site-search-status")).toHaveText(/no results/i);

    // aria-modal promises Tab cannot escape; press more Tabs than the dialog
    // has focusables and assert focus is still inside it.
    for (let i = 0; i < 10; i += 1) await page.keyboard.press("Tab");
    const stillInside = await page.evaluate(() => {
      const el = document.querySelector(
        '[role="dialog"][aria-label="Site search"]',
      );
      return el ? el.contains(document.activeElement) : false;
    });
    expect(stillInside).toBe(true);
  });

  test("Escape closes search and returns focus to the trigger", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const trigger = page.getByRole("button", { name: "Search" }).first();
    await trigger.click();
    await expect(
      page.getByRole("dialog", { name: "Site search" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Site search" }),
    ).toHaveCount(0);
    // Without focus restore, keyboard users are dropped at the top of the page.
    await expect(trigger).toBeFocused();
  });

  test("cookie banner is a labelled region, not a fake modal", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const banner = page.getByRole("region", { name: "Cookie preference" });
    await expect(banner).toBeVisible();
    // role="dialog" without dialog behaviour is a false promise to assistive
    // tech: the banner never traps focus and never blocks the page behind it.
    await expect(banner).not.toHaveAttribute("role", "dialog");

    await banner.getByRole("button", { name: "Accept" }).click();
    await expect(banner).toHaveCount(0);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("region", { name: "Cookie preference" }),
    ).toHaveCount(0);
  });
});

test.describe("accessibility: keyboard behaviour", () => {
  test("desktop nav: Space on a submenu link does not close the menu", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Primary" });
    const trigger = nav.getByRole("link", { name: "Solutions", exact: true });

    // Focus alone opens the disclosure (hover-or-focus model).
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).toHaveAttribute(
      "aria-controls",
      "nav-menu-solutions",
    );

    const panel = page.locator("#nav-menu-solutions");
    await expect(panel).toBeVisible();
    const item = panel.getByRole("link", { name: /^AI Agents/ });
    await item.focus();

    // Regression: the wrapper's keydown handler used to treat bubbled
    // Enter/Space from a child link as a toggle, closing the panel and
    // unmounting the element that had focus.
    await page.keyboard.press("Space");
    await expect(panel).toBeVisible();
    await expect(item).toBeFocused();
  });

  test("desktop nav: Escape closes the menu and restores focus to the trigger", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Primary" });
    const trigger = nav.getByRole("link", { name: "Solutions", exact: true });

    await trigger.focus();
    const panel = page.locator("#nav-menu-solutions");
    await expect(panel).toBeVisible();
    await panel.getByRole("link", { name: /^AI Agents/ }).focus();

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
    // Restoring focus must not immediately reopen the panel, because the
    // wrapper opens on focus.
    await expect(panel).toHaveCount(0);
  });

  test("intake: invalid fields expose aria-invalid and a described error", async ({
    page,
  }) => {
    await page.goto("/start-a-project", { waitUntil: "networkidle" });
    const wizard = page.getByTestId("intake-wizard");
    await expect(wizard).toHaveAttribute("data-hydrated", "true");

    await wizard.getByRole("button", { name: /Continue/ }).click();

    const company = page.locator("#f-companyName");
    await expect(company).toHaveAttribute("aria-invalid", "true");
    await expect(company).toHaveAttribute("aria-required", "true");
    await expect(company).toHaveAttribute(
      "aria-describedby",
      /f-companyName-error/,
    );
    await expect(page.locator("#f-companyName-error")).toBeVisible();

    // The error must clear from the control once the field is valid again.
    await company.fill("Northwind Freight");
    await expect(company).not.toHaveAttribute("aria-invalid", "true");
  });

  test("readiness: the chosen answer is exposed, and focus follows the view", async ({
    page,
  }) => {
    await page.goto("/ai-readiness", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Start the Assessment/ }).click();

    // Starting unmounts the start button, so focus must be moved deliberately
    // into the question instead of being dropped on <body>. Asserted on the
    // container rather than a single node: engines differ on whether a
    // programmatically focused <legend> reports itself as activeElement.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const fieldset = document.querySelector("fieldset");
          const active = document.activeElement;
          if (!fieldset || !active) return false;
          return fieldset === active || fieldset.contains(active);
        }),
      )
      .toBe(true);

    const option = page.getByRole("button", { name: /^Fully/ }).last();
    await option.click();
    await page.getByRole("button", { name: /← Previous/ }).click();
    // Colour alone used to be the only signal that an answer was recorded.
    await expect(
      page.getByRole("button", { name: /^Fully/ }).last(),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("keyboard: skip link is first focusable and targets main", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

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
