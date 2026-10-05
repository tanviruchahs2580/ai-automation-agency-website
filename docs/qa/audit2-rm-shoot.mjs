// Pass 2: reliable full-page captures under prefers-reduced-motion (content
// renders statically — no reveal race), doubling as a reduced-motion audit.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const OUT = "docs/qa/audit2-rm";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

const dismissCookies = async (page) => {
  try {
    const accept = page.getByRole("button", { name: "Accept" });
    await accept.waitFor({ state: "visible", timeout: 2500 });
    await accept.click();
    await page.waitForTimeout(300);
  } catch {}
};

const consoleLog = {};

const capture = async (route, name, { viewport = { width: 1440, height: 900 }, colorScheme = "dark" } = {}) => {
  const ctx = await browser.newContext({ viewport, colorScheme, reducedMotion: "reduce", hasTouch: viewport.width < 800, isMobile: viewport.width < 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  consoleLog[route] = errors;
  await ctx.close();
  console.log(`✓ ${name}`);
};

const dark = [
  ["/solutions", "solutions"],
  ["/services", "services"],
  ["/industries", "industries"],
  ["/work", "work"],
  ["/insights", "insights"],
  ["/solutions/ai-agents", "solution-ai-agents"],
  ["/services/ai-engineering", "service-ai-engineering"],
  ["/industries/healthcare", "industry-healthcare"],
  ["/work/invoice-processing-operations", "work-invoice"],
  ["/insights/why-ai-projects-fail-in-production", "insight-article"],
  ["/technology", "technology"],
  ["/roi-calculator", "roi-calculator"],
  ["/ai-readiness", "ai-readiness"],
  ["/start-a-project", "start-a-project"],
  ["/security", "security"],
  ["/about", "about"],
  ["/team", "team"],
  ["/approach", "approach"],
  ["/privacy", "privacy"],
];
for (const [r, n] of dark) await capture(r, n);

for (const [r, n] of [["/solutions", "light-solutions"], ["/technology", "light-technology"], ["/work", "light-work"], ["/insights", "light-insights"]]) {
  await capture(r, n, { colorScheme: "light" });
}

for (const [r, n] of [["/", "m-home"], ["/start-a-project", "m-start-a-project"], ["/roi-calculator", "m-roi"], ["/technology", "m-technology"], ["/solutions", "m320-solutions"]]) {
  await capture(r, n, { viewport: { width: n === "m320-solutions" ? 320 : 390, height: 844 } });
}

await browser.close();
writeFileSync(`${OUT}/console-log.json`, JSON.stringify(consoleLog, null, 2));
console.log("done");
