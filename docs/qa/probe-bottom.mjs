import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const page = await ctx.newPage();
const events = [];
page.on("console", (m) => events.push(`[console:${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => events.push(`[pageerror] ${e.message}`));
page.on("framenavigated", (f) => events.push(`[nav] ${f.url()}`));

await page.goto("http://localhost:3117/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const height = await page.evaluate(() => document.documentElement.scrollHeight);
console.log("scrollHeight:", height);
for (let y = 0; y < height; y += 900) {
  await page.evaluate((t) => window.scrollTo(0, t), y);
  await page.waitForTimeout(1000);
  const probe = await page.evaluate(() => ({
    y: window.scrollY,
    sheets: document.styleSheets.length,
    theme: document.documentElement.getAttribute("data-theme"),
    readyState: document.readyState,
  }));
  console.log(y, JSON.stringify(probe));
}
await page.screenshot({ path: "docs/qa/audit2/probe-bottom.png" });
console.log("events:", JSON.stringify(events.slice(0, 20), null, 1));
await browser.close();
