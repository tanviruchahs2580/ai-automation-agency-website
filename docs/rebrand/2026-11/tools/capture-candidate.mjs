// One-off capture of the LOCAL production build for the design critique.
// Output: docs/rebrand/2026-11/screenshots/candidate/
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "screenshots", "candidate");
mkdirSync(outDir, { recursive: true });

const BASE = "http://localhost:3117";
const shots = [
  ["home", "/", "dark", "desktop-1440"],
  ["home", "/", "dark", "mobile-390"],
  ["home-light", "/", "light", "desktop-1440"],
  ["solutions", "/solutions", "dark", "desktop-1440"],
  ["solution-detail", "/solutions/ai-agents", "dark", "desktop-1440"],
  ["service-detail", "/services/ai-engineering", "dark", "desktop-1440"],
  ["industries", "/industries", "dark", "desktop-1440"],
  ["work-detail", "/work/invoice-processing-operations", "dark", "desktop-1440"],
  ["insight", "/insights/rag-without-the-hype-what-retrieval-actually-fixes", "dark", "desktop-1440"],
  ["technology", "/technology", "dark", "desktop-1440"],
  ["roi", "/roi-calculator", "dark", "desktop-1440"],
  ["intake", "/start-a-project", "dark", "desktop-1440"],
  ["intake", "/start-a-project", "dark", "mobile-390"],
  ["not-found", "/definitely-missing", "dark", "desktop-1440"],
];
const viewports = { "desktop-1440": { width: 1440, height: 900 }, "mobile-390": { width: 390, height: 844 } };

const browser = await chromium.launch();
for (const [name, route, theme, vp] of shots) {
  const context = await browser.newContext({ viewport: viewports[vp], colorScheme: "dark" });
  await context.addInitScript((t) => localStorage.setItem("arkyon-theme", t), theme);
  const page = await context.newPage();
  try {
    const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
    if (!res || res.status() >= 400) throw new Error(`HTTP ${res ? res.status() : "?"}`);
    await page.waitForTimeout(700);
    const file = join(outDir, `${name}__${vp}__${theme}.png`);
    await page.screenshot({ path: file });
    console.log("captured", file);
  } catch (e) {
    console.error("FAIL", name, vp, theme, e.message);
    process.exitCode = 1;
  }
  await context.close();
}
await browser.close();
console.log("CANDIDATE CAPTURES DONE");
