import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const OUT = "docs/qa/final";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

const dismissCookies = async (page) => {
  try {
    const accept = page.getByRole("button", { name: "Accept" });
    await accept.waitFor({ state: "visible", timeout: 2500 });
    await accept.click();
    await page.waitForTimeout(350);
  } catch {
    /* no banner */
  }
};

const shot = async (page, name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`  saved ${name}.png`);
};

// --- desktop headers ---
for (const w of [1024, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 700 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await dismissCookies(page);
  await shot(page, `header-${w}`);
  await ctx.close();
}

// --- mobile menu ---
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.getByRole("button", { name: /menu/i }).click();
  await page.waitForTimeout(500);
  await shot(page, "mobile-menu-top");
  const company = page.getByRole("button", { name: /Show Company options/ });
  if (await company.count()) {
    await company.click();
    await page.waitForTimeout(400);
    await shot(page, "mobile-menu-company-open");
  }
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.waitForTimeout(700);
  await shot(page, "mobile-search-modal");
  await ctx.close();
}

// --- light theme ---
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 700 }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await dismissCookies(page);
  await shot(page, "theme-light-header");
  await ctx.close();
}

// --- hero, trust section, key indexes ---
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.waitForTimeout(800);
  await shot(page, "home-hero");

  await page.locator("#trust-heading").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await shot(page, "home-trust-governance");

  await page.goto(BASE + "/technology", { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.waitForTimeout(700);
  await shot(page, "technology-hero-clamp");

  await page.goto(BASE + "/work", { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.waitForTimeout(600);
  await shot(page, "work-index");

  await page.goto(BASE + "/insights", { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.waitForTimeout(600);
  await shot(page, "insights-index");
  await ctx.close();
}

// --- narrowest supported viewport ---
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 720 }, hasTouch: true, isMobile: true, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/technology", { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.waitForTimeout(600);
  await shot(page, "technology-320");
  await ctx.close();
}

await browser.close();
console.log(`screenshots written to ${OUT}/`);
