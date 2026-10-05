import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const page = await ctx.newPage();
await page.goto("http://localhost:3117/", { waitUntil: "networkidle" });
try { await page.getByRole("button", { name: "Accept" }).click({ timeout: 2000 }); } catch {}
await page.waitForTimeout(400);

// hover: open Solutions dropdown
const solutions = page.locator('header a[aria-haspopup="menu"]', { hasText: "Solutions" });
await solutions.hover();
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/qa/verify/dropdown-open.png" });
console.log("dropdown visible:", await page.getByRole("menu").isVisible());
await page.mouse.move(720, 500);
await page.waitForTimeout(400);
console.log("dropdown closed:", !(await page.getByRole("menu").isVisible().catch(() => false)));

// search modal
await page.getByRole("button", { name: /Search/ }).first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: "docs/qa/verify/search-open.png" });
console.log("search visible:", await page.getByRole("dialog").isVisible());
await ctx.close();
await browser.close();
