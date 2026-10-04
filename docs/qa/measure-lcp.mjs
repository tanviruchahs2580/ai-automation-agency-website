import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const browser = await chromium.launch();

for (let run = 1; run <= 4; run++) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  const info = await page.evaluate(async () => {
    const entries = [];
    await new Promise((res) => {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          entries.push({
            t: Math.round(e.startTime),
            size: e.size,
            el: e.element ? `${e.element.tagName.toLowerCase()}.${(e.element.className || "").toString().slice(0, 60)}` : "?",
            text: (e.element?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
          });
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(res, 2500);
    });
    const nav = performance.getEntriesByType("navigation")[0];
    return { load: Math.round(nav.loadEventEnd), entries };
  });
  console.log(`run ${run}: load=${info.load}ms`);
  for (const e of info.entries) console.log(`   LCP ${e.t}ms size=${Math.round(e.size)} ${e.el} :: "${e.text}"`);
  await ctx.close();
}
await browser.close();
