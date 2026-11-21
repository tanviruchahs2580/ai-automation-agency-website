// Elevation verification captures — key routes after the 2026-11-16 changes.
// Read-only against the local production server; no data submission.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3117";
const OUT = "docs/qa/elevation-verify";
mkdirSync(OUT, { recursive: true });

const routes = [
  ["/", "home"],
  ["/solutions", "solutions"],
  ["/services", "services"],
  ["/work", "work"],
  ["/insights", "insights"],
  ["/technology", "technology"],
  ["/industries", "industries"],
  ["/solutions/ai-agents", "detail-solution"],
];

const browser = await chromium.launch();
for (const [width, height, tag] of [
  [1440, 900, "d1440"],
  [390, 844, "m390"],
]) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  for (const [path, name] of routes) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/${name}-${tag}.png`, fullPage: true });
    process.stdout.write(`✓ ${name}-${tag}\n`);
  }
  await ctx.close();
}
await browser.close();
console.log("DONE");
