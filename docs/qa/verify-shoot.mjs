import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const dismiss = async (page) => {
  try { await page.getByRole("button", { name: "Accept" }).click({ timeout: 2500 }); await page.waitForTimeout(300); } catch {}
};

// home hero (chip fix) + bento (AI Agents cell), dark
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3117/", { waitUntil: "networkidle" });
  await dismiss(page);
  await page.waitForTimeout(900);
  await page.screenshot({ path: "docs/qa/verify/hero-after.png" });
  await page.evaluate(() => document.querySelector("#solve-heading")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(1300);
  await page.screenshot({ path: "docs/qa/verify/bento-after.png" });
  await ctx.close();
}
// light hero
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3117/", { waitUntil: "networkidle" });
  await dismiss(page);
  await page.waitForTimeout(900);
  await page.screenshot({ path: "docs/qa/verify/hero-light-after.png" });
  await ctx.close();
}
// solutions index (metas)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3117/solutions", { waitUntil: "networkidle" });
  await dismiss(page);
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: "docs/qa/verify/solutions-metas-after.png" });
  await ctx.close();
}
await browser.close();
console.log("verify shots done");
