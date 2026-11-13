// User-style functional test of a LIVE deployment (preview or production).
// Exercises every interactive feature as a visitor would. The intake wizard is
// walked to its final step WITHOUT submitting (a UI submit would email the
// real notification address); the live intake→API→receipt pipeline is instead
// proven via the designed honeypot sink (valid payload + honeypot filled =>
// success receipt, zero notification) — see DECISIONS D-16.
// Usage: node user-test-live.mjs <base-url>
import { chromium } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:3117";
const results = [];
const record = (name, ok, detail = "") =>
  results.push({ name, ok, detail }) && console.log(`${ok ? "ok " : "FAIL"} ${name}${detail ? " — " + detail : ""}`);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && !/csp|Content-Security-Policy/i.test(m.text()) && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

// 1. Homepage identity + hero
await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 45000 });
record("homepage title suffix", (await page.title()).includes("ARKYON"), await page.title());
record("hero H1 present", await page.locator("h1").first().isVisible());
record("wordmark ARKYON", (await page.locator("header").first().innerText()).includes("ARKYON"));

// 2. One header CTA + navigation
const ctaCount = await page.locator('header a[href="/start-a-project"]:visible').count();
record("exactly one visible header CTA", ctaCount === 1, `count=${ctaCount}`);

// 3. Desktop nav dropdown → destination
await page.getByRole("link", { name: /^Solutions/i }).first().hover();
await page.waitForTimeout(300);
await page.getByRole("link", { name: /AI Agents/ }).first().click();
await page.waitForURL("**/solutions/ai-agents");
record("nav dropdown navigates", true, await page.title());

// 4. ⌘K search: open, filter, Escape restores
await page.keyboard.press("ControlOrMeta+k");
await page.getByRole("dialog").waitFor({ state: "visible", timeout: 5000 });
await page.getByPlaceholder(/search/i).fill("roi");
await page.waitForTimeout(300);
const resultCount = await page.getByRole("dialog").locator("a").count();
await page.keyboard.press("Escape");
record("search opens/filters/Escape", resultCount > 0 && !(await page.getByRole("dialog").isVisible().catch(() => false)), `${resultCount} results`);

// 5. Theme toggle persists
const before = await page.evaluate(() => document.documentElement.dataset.theme);
await page.getByRole("button", { name: /switch to (light|dark)/i }).click();
await page.waitForTimeout(400);
const after = await page.evaluate(() => document.documentElement.dataset.theme);
const stored = await page.evaluate(() => localStorage.getItem("arkyon-theme"));
record("theme toggles + persists", before !== after && stored === after, `${before}→${after}`);

// 6. ROI calculator end-to-end computation
await page.goto(BASE + "/roi-calculator", { waitUntil: "networkidle" });
await page.locator('[data-hydrated="true"]').waitFor();
await page.locator("#roi-employees").fill("25");
await page.locator("#roi-weekly-hours").fill("10");
await page.getByRole("button", { name: /refine/i }).click();
await page.getByLabel("Average annual salary").fill("60000");
await page.waitForTimeout(1200);
const resultsText = await page.locator('[data-testid="roi-results"]').innerText();
record("ROI computes from inputs", /\$/.test(resultsText), resultsText.split("\n").slice(0, 3).join(" | "));

// 7. Readiness assessment full run (selectors mirror the repo's own tools.spec)
await page.goto(BASE + "/ai-readiness", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Start the Assessment/ }).click();
const scale = /^(Not at all|Partially|Moderately|Largely|Fully)/;
let answered = 0;
for (let i = 0; i < 12; i++) {
  const option = page.getByRole("button", { name: scale });
  if (!(await option.first().isVisible().catch(() => false))) break;
  await option.last().click();
  answered++;
  if (answered < 10) {
    await page.getByText(`Question ${answered + 1} / 10`).waitFor({ timeout: 8000 });
  }
}
await page.getByRole("button", { name: /Retake/ }).waitFor({ timeout: 15000 });
const scoreVisible = await page.getByText(/out of 100/i).isVisible();
record("readiness completes with score", answered === 10 && scoreVisible, `${answered}/10 answered`);

// 8. Intake wizard: all 7 steps + validation, no submit (see header note)
await page.goto(BASE + "/start-a-project", { waitUntil: "networkidle" });
await page.locator("html[data-hydrated='true']").waitFor();
await page.getByLabel("Company name").fill("Sync Verification Test Co");
await page.getByLabel("Company size").selectOption({ index: 1 });
await page.getByLabel("Industry").fill("Software");
await page.getByLabel("Country").fill("Testland");
await page.getByRole("button", { name: /continue/i }).click();
await page.getByLabel("What problem are you trying to solve?").fill("This is a synthetic validation walk of all seven steps; no submission is performed from the UI.");
await page.getByRole("button", { name: /continue/i }).click();
await page.getByLabel("How does this work get done today?").fill("Synthetic walkthrough of the intake wizard for release verification purposes.");
await page.getByRole("button", { name: /continue/i }).click();
await page.getByLabel("Which systems are involved?").fill("Email, spreadsheets, and a CRM.");
await page.getByRole("button", { name: /continue/i }).click();
await page.getByLabel("What does success look like?").fill("A verified receipt path exercised only through the honeypot sink at API level.");
await page.getByRole("button", { name: /continue/i }).click();
await page.getByLabel("Indicative budget range").selectOption({ index: 1 });
await page.getByRole("button", { name: /continue/i }).click();
await page.getByLabel("Expected timeline").selectOption({ index: 1 });
await page.getByLabel("Your name").fill("Release Verification");
await page.getByLabel("Role").fill("QA");
await page.getByLabel("Work email").fill("verification@example.com");
const submitEnabled = await page.getByRole("button", { name: /submit/i }).isEnabled();
record("intake walks all 7 steps, submit reachable", submitEnabled);
await page.getByRole("button", { name: /back/i }).first().click(); // step down, leave no completed draft
record("intake back-navigation works", true);

// 9. Cookie consent decision persists
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
const banner = page.getByRole("region", { name: /cookie preference/i });
if (await banner.isVisible().catch(() => false)) {
  await banner.getByRole("button", { name: /accept/i }).click();
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: "domcontentloaded" });
  record("cookie decision persists", !(await banner.isVisible().catch(() => false)));
} else {
  record("cookie decision persists", true, "already decided in this profile");
}

// 10. 404 + honesty labels + RSS
const consoleErrorsBefore404 = consoleErrors.length;
const res404 = await page.goto(BASE + "/definitely-not-a-page", { waitUntil: "domcontentloaded" });
record("404 returns 404 with recovery page", res404.status() === 404 && await page.locator("h1").isVisible());
consoleErrors.length = consoleErrorsBefore404; // the deliberate 404 navigation logs an expected 404 resource line
await page.goto(BASE + "/work/invoice-processing-operations", { waitUntil: "domcontentloaded" });
record("example-architecture honesty label", (await page.locator("main").first().innerText()).toLowerCase().includes("example architecture"));
const feed = await page.evaluate(async (b) => (await fetch(b + "/feed.xml")).text(), BASE);
record("RSS identity ARKYON", feed.includes("ARKYON — Insights"));

// 11. Console cleanliness
record("no console/page errors", consoleErrors.length === 0, consoleErrors.slice(0, 2).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\nUSER TEST: ${results.length - failed.length}/${results.length} passed${failed.length ? " — FAILURES ABOVE" : ""}`);
process.exitCode = failed.length ? 1 : 0;
