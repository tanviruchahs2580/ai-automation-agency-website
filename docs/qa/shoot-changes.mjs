import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const OUT = "docs/qa/shots";
mkdirSync(OUT, { recursive: true });

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
}

const browser = await chromium.launch();

// 1. Header strips across the breakpoints the brief mandates
for (const w of [1024, 1280, 1440, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/header-${w}.png`, clip: { x: 0, y: 0, width: w, height: 100 } });
  await ctx.close();
}

// 2. Trust section close-up (desktop + mobile)
for (const [name, viewport] of [["d", { width: 1440, height: 900 }], ["m", { width: 375, height: 812 }]]) {
  const ctx = await browser.newContext({ viewport, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await scrollThrough(page);
  const section = page.locator('section[aria-labelledby="trust-heading"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await section.screenshot({ path: `${OUT}/trust-${name}.png` });
  // hero close-up
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/hero-${name}.png` });
  await ctx.close();
}

// 3. Full-page homepage, reveals triggered
for (const [name, viewport] of [["d", { width: 1440, height: 900 }], ["m", { width: 375, height: 812 }]]) {
  const ctx = await browser.newContext({ viewport, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await scrollThrough(page);
  await page.screenshot({ path: `${OUT}/home-full-${name}.png`, fullPage: true });
  await ctx.close();
}

// 4. Mobile hero instrument — proves the console is no longer clipped
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 800 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await scrollThrough(page);
  const card = page.locator(".card-surface.grain.relative").first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await card.screenshot({ path: `${OUT}/hero-instrument-320.png` });
  await ctx.close();
}

await browser.close();
console.log("shots written to", OUT);
