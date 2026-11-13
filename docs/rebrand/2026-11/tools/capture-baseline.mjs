// One-off baseline capture of the CURRENT production deployment (read-only GETs).
// Output: docs/rebrand/2026-11/screenshots/baseline/<route>__<viewport>.png
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "screenshots", "baseline");
mkdirSync(outDir, { recursive: true });

const BASE = "https://ai-automation-agency-website-lilac.vercel.app";
const routes = [
  ["home", "/"],
  ["solutions-index", "/solutions"],
  ["solution-detail", "/solutions/ai-agents"],
  ["services-index", "/services"],
  ["service-detail", "/services/ai-engineering"],
  ["industries-index", "/industries"],
  ["industry-detail", "/industries/financial-services"],
  ["work-index", "/work"],
  ["work-detail", "/work/invoice-processing-operations"],
  ["insights-index", "/insights"],
  ["insight-detail", "/insights/rag-without-the-hype-what-retrieval-actually-fixes"],
  ["technology", "/technology"],
  ["about", "/about"],
  ["security", "/security"],
  ["ai-readiness", "/ai-readiness"],
  ["roi-calculator", "/roi-calculator"],
  ["start-a-project", "/start-a-project"],
];
const viewports = [
  ["desktop-1440", { width: 1440, height: 900 }],
  ["mobile-390", { width: 390, height: 844 }],
];

const browser = await chromium.launch();
const failures = [];
for (const [vpName, viewport] of viewports) {
  const page = await browser.newPage({ viewport, colorScheme: "dark" });
  for (const [name, route] of routes) {
    try {
      const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
      if (!res || res.status() >= 400) throw new Error(`HTTP ${res ? res.status() : "?"}`);
      await page.evaluate(() => document.documentElement.dataset.hydrated === "true" ? null : new Promise((ok) => {
        const obs = new MutationObserver(() => {
          if (document.documentElement.dataset.hydrated === "true") { obs.disconnect(); ok(null); }
        });
        obs.observe(document.documentElement, { attributes: true });
        setTimeout(ok, 8000);
      }));
      await page.waitForTimeout(400);
      const file = join(outDir, `${name}__${vpName}__chromium__prod.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log("captured", file);
    } catch (e) {
      failures.push(`${route} @ ${vpName}: ${e.message}`);
      console.error("FAIL", route, vpName, e.message);
    }
  }
  await page.close();
}
await browser.close();
if (failures.length) { console.error(`FAILURES (${failures.length}):`); failures.forEach((f) => console.error(" -", f)); process.exitCode = 1; }
else console.log("ALL CAPTURES OK");
