// Full-site audit screenshots + console error capture.
// Usage: node docs/qa/audit2-shoot.mjs  (server must run on :3117)
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const OUT = "docs/qa/audit2";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

const dismissCookies = async (page) => {
  try {
    const accept = page.getByRole("button", { name: "Accept" });
    await accept.waitFor({ state: "visible", timeout: 2500 });
    await accept.click();
    await page.waitForTimeout(350);
  } catch {
    /* no banner */
  }
};

const consoleLog = {};

const capture = async (route, name, { viewport = { width: 1440, height: 900 }, fullPage = true, colorScheme = "dark", scrollShots = false } = {}) => {
  const ctx = await browser.newContext({ viewport, colorScheme, hasTouch: viewport.width < 800, isMobile: viewport.width < 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.waitForTimeout(900);

  if (scrollShots) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    let i = 0;
    for (let y = 0; y < height; y += viewport.height) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(1100);
      await page.screenshot({ path: `${OUT}/${name}-v${String(i).padStart(2, "0")}.png` });
      i++;
    }
  } else {
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  }
  consoleLog[route] = errors;
  await ctx.close();
  console.log(`✓ ${route} (${name})`);
};

// --- All primary routes, 1440 full page, dark ---
const routes = [
  ["/", "home", { scrollShots: true }],
  ["/solutions", "solutions"],
  ["/solutions/ai-agents", "solution-ai-agents"],
  ["/services", "services"],
  ["/services/ai-engineering", "service-ai-engineering"],
  ["/industries", "industries"],
  ["/industries/healthcare", "industry-healthcare"],
  ["/work", "work"],
  ["/work/invoice-processing-operations", "work-invoice"],
  ["/technology", "technology", { scrollShots: true }],
  ["/security", "security"],
  ["/about", "about"],
  ["/team", "team"],
  ["/approach", "approach"],
  ["/insights", "insights"],
  ["/insights/why-ai-projects-fail-in-production", "insight-article"],
  ["/roi-calculator", "roi-calculator", { scrollShots: false }],
  ["/ai-readiness", "ai-readiness"],
  ["/start-a-project", "start-a-project"],
  ["/privacy", "privacy"],
];

for (const [route, name, opts] of routes) {
  await capture(route, name, opts);
}

// --- Light theme, key routes ---
for (const [route, name] of [
  ["/", "home"],
  ["/solutions", "solutions"],
  ["/technology", "technology"],
  ["/work", "work"],
  ["/insights", "insights"],
]) {
  await capture(route, `light-${name}`, { colorScheme: "light", scrollShots: route === "/" });
}

// --- Mobile 390 ---
for (const [route, name] of [
  ["/", "m-home"],
  ["/start-a-project", "m-start-a-project"],
  ["/roi-calculator", "m-roi"],
  ["/technology", "m-technology"],
]) {
  await capture(route, name, { viewport: { width: 390, height: 844 } });
}

// --- Mobile 320 narrowest ---
await capture("/solutions", "m320-solutions", { viewport: { width: 320, height: 700 } });

await browser.close();
writeFileSync(`${OUT}/console-log.json`, JSON.stringify(consoleLog, null, 2));
console.log("done → docs/qa/audit2");
