import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

mkdirSync("docs/qa/audit2-m", { recursive: true });
const browser = await chromium.launch();
const dismiss = async (page) => {
  try { await page.getByRole("button", { name: "Accept" }).click({ timeout: 2000 }); await page.waitForTimeout(300); } catch {}
};
const seq = async (route, name, width = 390) => {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: "dark", isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3117" + route, { waitUntil: "networkidle" });
  await dismiss(page);
  await page.waitForTimeout(600);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < h && i < 16; y += 844) {
    await page.evaluate((t) => window.scrollTo(0, t), y);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `docs/qa/audit2-m/${name}-${String(i).padStart(2, "0")}.png` });
    i++;
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${name} shots=${i} hOverflow=${overflow}`);
  await ctx.close();
};
await seq("/", "home");
await seq("/technology", "technology");
await seq("/start-a-project", "start");
await seq("/solutions", "solutions320", 320);
await browser.close();
console.log("done");
