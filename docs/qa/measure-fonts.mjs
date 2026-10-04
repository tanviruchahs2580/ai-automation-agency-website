import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const browser = await chromium.launch();

for (let run = 1; run <= 3; run++) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  const info = await page.evaluate(async () => {
    const fonts = performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes(".woff2"))
      .map((r) => ({ n: r.name.split("/").pop(), start: Math.round(r.startTime), end: Math.round(r.responseEnd) }));
    let fontsReady = -1;
    if (document.fonts?.ready) fontsReady = Math.round(await document.fonts.ready.then(() => performance.now()));
    const cssStart = Math.round(
      (performance.getEntriesByType("resource").find((r) => r.name.endsWith(".css")) || { startTime: 0 }).startTime,
    );
    const nav = performance.getEntriesByType("navigation")[0];
    return { dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), fontsReady, cssStart, fonts };
  });
  console.log(`run ${run}: cssStart=${info.cssStart}ms DCL=${info.dcl}ms fonts.ready=${info.fontsReady}ms load=${info.load}ms`);
  for (const f of info.fonts) console.log(`   ${f.n.padEnd(28)} ${f.start}-${f.end}ms`);
  await ctx.close();
}
await browser.close();
