import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });

const before = await page.evaluate(
  () => document.querySelectorAll('div[style*="opacity"]').length,
);

// scroll the whole page so below-fold Reveal instances mount
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
});
await page.waitForTimeout(1500);

const after = await page.evaluate(() => {
  const styled = [...document.querySelectorAll("div")].filter((d) => d.style.opacity || d.style.transform);
  return {
    count: styled.length,
    revealed: styled.filter((d) => Number(d.style.opacity) >= 1).length,
    sample: styled.slice(0, 4).map((d) => `opacity=${d.style.opacity} cls=${(d.className || "").slice(0, 40)}`),
  };
});

// below-fold element should NOT be static-rendered: confirm a motion node exists
console.log(`inline-styled divs before scroll: ${before}`);
console.log(`inline-styled divs after scroll:  ${after.count} (opacity settled: ${after.revealed})`);
for (const s of after.sample) console.log("   " + s);
console.log(after.count > before ? "PASS — below-fold reveals still mount and animate" : "CHECK — no new motion nodes after scroll");

await browser.close();
