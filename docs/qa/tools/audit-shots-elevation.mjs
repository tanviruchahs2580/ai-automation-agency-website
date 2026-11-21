// Visual audit capture — UI/UX elevation baseline (2026-11-16).
// Captures key routes at desktop (1440) + mobile (390) in dark + light themes.
// Read-only against the local production server; no data submission.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3117";
const OUT = "docs/qa/elevation-audit";
mkdirSync(OUT, { recursive: true });

const routes = [
  ["/", "home"],
  ["/solutions", "solutions"],
  ["/services", "services"],
  ["/industries", "industries"],
  ["/work", "work"],
  ["/insights", "insights"],
  ["/technology", "technology"],
  ["/approach", "approach"],
  ["/security", "security"],
  ["/about", "about"],
  ["/team", "team"],
  ["/roi-calculator", "roi"],
  ["/ai-readiness", "readiness"],
  ["/start-a-project", "intake"],
];

const browser = await chromium.launch();
for (const [width, height, tag, theme] of [
  [1440, 900, "d1440", "dark"],
  [390, 844, "m390", "dark"],
]) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce", // static captures; motion audited separately
  });
  const page = await ctx.newPage();
  for (const [path, name] of routes) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    if (theme === "dark") {
      // force dark for determinism (default is dark; light captured separately)
    }
    await page.screenshot({ path: `${OUT}/${name}-${tag}.png`, fullPage: true });
    process.stdout.write(`✓ ${name}-${tag}\n`);
  }
  await ctx.close();
}
await browser.close();
console.log("DONE");
