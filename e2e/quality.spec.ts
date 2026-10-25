import { expect, test, type Page } from "@playwright/test";

/**
 * Waits for the client tree to mount before interacting.
 *
 * `waitUntil: "networkidle"` says the network is quiet, not that React has
 * hydrated — clicking a control before then is a silent no-op, which is how
 * interaction specs flake under parallel load. `HydrationSignal` in the root
 * layout sets the attribute this waits on.
 */
async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === "true",
    undefined,
    { timeout: 30_000 },
  );
}

/**
 * Rendering and layout guarantees.
 *
 * These cover defect classes that are invisible to a DOM/ARIA scan and to a
 * source review, because they only exist in the rendered, laid-out page:
 *
 *  - content that is present in the markup but *invisible* until JavaScript
 *    runs, which is how the primary conversion form shipped with
 *    `style="opacity:0"` on its whole body;
 *  - two fixed elements claiming the same corner, which is how the cookie
 *    banner sat on top of the back-to-top button;
 *  - a headline set so large that the primary call to action fell below the
 *    fold on the homepage.
 *
 * Each is asserted against real geometry, not against the markup that is
 * supposed to produce it.
 */

test.describe("content is visible without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  /*
    Every route family, not a sample.

    This block found a site-wide defect that the source-level checks could not:
    `app/loading.tsx` made Next emit each page as a Suspense *fallback* — a
    "Loading…" skeleton — with the real content deferred into an inert
    `<template>` and swapped in by an inline `$RC(...)` call. The content was
    present in the HTML, so `npm run check:rendered` and every metadata check
    passed, but with JavaScript disabled or stalled the visitor saw a skeleton
    forever. The loading files are gone and this asserts the fix, route family
    by route family, because a new `loading.tsx` anywhere would reintroduce it
    on that segment only.
  */
  const ROUTES = [
    "/",
    "/solutions",
    "/services",
    "/industries",
    "/work",
    "/insights",
    "/technology",
    "/about",
    "/approach",
    "/team",
    "/security",
    "/start-a-project",
    "/roi-calculator",
    "/ai-readiness",
    "/solutions/ai-agents",
    "/work/invoice-processing-operations",
    "/insights/why-most-ai-pilots-never-reach-production",
    "/industries/healthcare",
  ];

  for (const route of ROUTES) {
    test(`${route} renders its heading and body content`, async ({ page }) => {
      await page.goto(route);

      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();

      /* A heading with real layout, not content parked inside a <template>. */
      const box = await heading.boundingBox();
      expect(box, `${route}: h1 has no layout box`).not.toBeNull();
      expect(box!.height, `${route}: h1 is collapsed`).toBeGreaterThan(20);

      /*
        And actually painted.

        `toBeVisible()` is not enough: Playwright treats `opacity: 0` as visible,
        because a zero-opacity element still has a layout box and still takes
        hits. Verified — a page whose `<main style="opacity:0">` passes
        `toBeVisible()`, a bounding-box height check and an innerText length
        check, which is exactly the shape of the defect this block exists to
        catch. So walk the ancestor chain and inspect the computed style
        directly, the way the original `style="opacity:0"` bug would be seen.
      */
      const hidden = await heading.evaluate((element) => {
        let node: Element | null = element;
        while (node && node !== document.documentElement) {
          const style = getComputedStyle(node);
          if (style.opacity !== "1" || style.visibility === "hidden" || style.display === "none") {
            return `${node.tagName.toLowerCase()} { opacity: ${style.opacity}, visibility: ${style.visibility}, display: ${style.display} }`;
          }
          node = node.parentElement;
        }
        return null;
      });
      expect(hidden, `${route}: heading is hidden by an ancestor`).toBeNull();

      /* The main landmark contains more than a skeleton. */
      const mainText = (await page.locator("main").innerText()).trim();
      expect(mainText.length, `${route}: main is effectively empty`).toBeGreaterThan(120);
      expect(mainText, `${route}: a loading skeleton is still on screen`).not.toContain(
        "Loading…",
      );
    });
  }

  test("the intake form's first step is server-rendered", async ({ page }) => {
    await page.goto("/start-a-project");
    await expect(page.getByLabel("Company name")).toBeVisible();
    await expect(page.getByLabel("Industry")).toBeVisible();
    await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();
  });

  test("the architecture scene shows its layer panel", async ({ page }) => {
    await page.goto("/technology");
    await expect(page.locator("#architecture-layer-panel")).toBeVisible();
  });
});

test.describe("fixed overlays do not collide", () => {
  test("back-to-top is not covered by the cookie banner", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.evaluate(() => window.scrollTo(0, 1200));

    const banner = page.getByRole("region", { name: "Cookie preference" });
    await expect(banner).toBeVisible();

    const backToTop = page.getByRole("button", { name: "Back to top" });
    await expect(backToTop).toBeVisible();

    const bannerBox = await banner.boundingBox();
    const buttonBox = await backToTop.boundingBox();
    expect(bannerBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();

    const overlaps =
      bannerBox!.x < buttonBox!.x + buttonBox!.width &&
      buttonBox!.x < bannerBox!.x + bannerBox!.width &&
      bannerBox!.y < buttonBox!.y + buttonBox!.height &&
      buttonBox!.y < bannerBox!.y + bannerBox!.height;
    expect(overlaps, "cookie banner overlaps the back-to-top button").toBe(false);

    /* And it must actually be clickable, not merely non-overlapping. */
    await backToTop.click({ trial: true });
  });

  test("banner collision does not return after a decision", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("button", { name: "Accept" }).click();
    await expect(
      page.getByRole("region", { name: "Cookie preference" }),
    ).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(page.getByRole("button", { name: "Back to top" })).toBeVisible();
  });
});

test.describe("homepage above the fold", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("headline and primary CTA fit in the first screen", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await waitForHydration(page);

    /*
      The hero headline resolved to 96px inside a ~40rem column, which set a
      ten-word sentence eight lines deep: the object of the sentence and the
      primary call to action were both below the fold at the most common laptop
      size. The headline cap is now enforced by this measurement rather than by
      trusting the type scale.
    */
    const headline = page.locator("h1").first();
    const headlineBox = await headline.boundingBox();
    expect(headlineBox).not.toBeNull();
    expect(
      headlineBox!.height,
      `headline is ${headlineBox!.height}px tall — too many lines at 1440px`,
    ).toBeLessThan(420);

    const cta = page.getByRole("link", { name: /Start a Project/i }).first();
    const ctaBox = await cta.boundingBox();
    expect(ctaBox).not.toBeNull();
    expect(
      ctaBox!.y + ctaBox!.height,
      "primary CTA starts below the 900px fold",
    ).toBeLessThanOrEqual(900);
  });

  test("mobile: headline and CTA fit in the first screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await waitForHydration(page);
    await waitForHydration(page);
    const cta = page.getByRole("link", { name: /Start a Project/i }).first();
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y, "primary CTA is below the fold on a 390×844 phone").toBeLessThan(844);
  });
});

test.describe("no page scrolls horizontally", () => {
  const PATHS = ["/", "/solutions", "/technology", "/start-a-project", "/roi-calculator"];

  for (const path of PATHS) {
    test(`${path} at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 720 });
      await page.goto(path, { waitUntil: "networkidle" });
      await waitForHydration(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
    });
  }
});
