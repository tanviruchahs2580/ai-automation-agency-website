// Pre-deploy functional verification — user-style, every interactive surface.
// Usage: node docs/qa/predeploy-verify.mjs  (server on :3117)
import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const results = [];
const rec = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};
const fmt = (n) => "$" + n.toLocaleString("en-US");

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const page = await ctx.newPage();
const consoleErrors = [];
const badResponses = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(`[pageerror] ${e}`));
page.on("response", (r) => { if (r.status() >= 400) { badResponses.push(`${r.status()} ${r.url()}`); consoleErrors.push(`[res ${r.status()}] ${r.url()}`); } });

const acceptCookies = async () => {
  try {
    const a = page.getByRole("button", { name: "Accept" });
    await a.waitFor({ state: "visible", timeout: 2500 });
    await a.click();
    await page.waitForTimeout(250);
  } catch {}
};

// ============ 1. HOME — new features present ============
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await acceptCookies();
await page.waitForTimeout(600);
rec("cookie consent accepts", (await page.getByRole("dialog").count()) === 0);

const checklist = page.getByText("What it changes");
await checklist.scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
rec("bento feature shows 'What it changes' checklist", await checklist.isVisible().catch(() => false));

await page.goto(BASE + "/solutions", { waitUntil: "networkidle" });
await acceptCookies();
const metas = await page.locator("main a[href^='/solutions/']").allInnerTexts();
const metaTexts = metas.map((t) => t.replace(/\s+/g, " ").trim());
const unique = new Set([
  metaTexts.find((t) => t.includes("Approval gates")),
  metaTexts.find((t) => t.includes("Documents · Approvals")),
  metaTexts.find((t) => t.includes("Copilots")),
  metaTexts.find((t) => t.includes("Portfolio · Shared")),
  metaTexts.find((t) => t.includes("VPC · On-premise")),
  metaTexts.find((t) => t.includes("Strategy · Delivery · Adoption")),
]);
rec("solution cards show 6 unique meta strings", unique.size === 6, `${unique.size}/6 distinct`);
const footerRss = await page.locator("footer a[href='/feed.xml']").count();
rec("footer RSS link present", footerRss === 1);

// ============ 2. NAV DROPDOWN with descriptions + navigation ============
const dd = page.locator('header a[aria-haspopup="menu"]', { hasText: "Solutions" });
await dd.hover();
await page.waitForTimeout(350);
const desc = await page.getByRole("menu").getByText("Autonomous execution with human approval gates").isVisible().catch(() => false);
rec("dropdown opens with item descriptions", desc);
await page.getByRole("menuitem").first().click();
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(400);
rec("dropdown overview link navigates", page.url().includes("/solutions"), page.url().replace(BASE, ""));

// ============ 3. SEARCH ============
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await acceptCookies();
await page.getByRole("button", { name: /Search/ }).first().click();
await page.waitForTimeout(400);
await page.locator("input[type='search'], [role='dialog'] input").first().fill("automation");
await page.waitForTimeout(500);
const searchHits = await page.locator("[role='dialog'] a[href^='/']").count();
rec("search returns results", searchHits > 0, `${searchHits} hits`);
await page.keyboard.press("Escape");

// ============ 4. THEME round trip ============
const themeBefore = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
await page.getByRole("button", { name: /Switch to light|Toggle theme|theme/i }).first().click().catch(async () => {
  await page.locator("header button").nth(1).click();
});
await page.waitForTimeout(300);
const themeAfter = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
rec("theme toggles dark→light", themeBefore !== themeAfter, `${themeBefore}→${themeAfter}`);
await page.locator("header button").nth(1).click();
await page.waitForTimeout(300);
rec("theme toggles back", (await page.evaluate(() => document.documentElement.getAttribute("data-theme"))) === themeBefore);

// ============ 5. ROI CALCULATOR — math verification ============
await page.goto(BASE + "/roi-calculator", { waitUntil: "networkidle" });
await acceptCookies();
await page.waitForTimeout(500);
const live = page.locator('[aria-live="polite"]').filter({ hasText: "Estimated outcome" });
const readCost = async () => {
  const t = await live.getByText("Annual manual cost").locator("..").textContent();
  return Number((t ?? "").replace(/[^\d]/g, ""));
};
const cost0 = await readCost();
rec("ROI default annual manual cost = $346,080", cost0 === 346080, `got ${fmt(cost0)}`);

// change headcount 12 → 20; expect annualManualCost = $568,800
await page.getByLabel("Current headcount on manual ops").fill("20");
await page.waitForTimeout(400);
const cost1 = await readCost();
rec("ROI recalculates on headcount 20 → $568,800", cost1 === 568800, `got ${fmt(cost1)}`);

const roiText = await page.getByText("Est. ROI").locator("..").textContent();
rec("ROI % shown", /%/.test(roiText ?? ""), (roiText ?? "").replace(/\s+/g, " ").slice(0, 40));

// industry select changes automation assumption
const industrySel = page.getByLabel("Industry");
await industrySel.selectOption("healthcare");
await page.waitForTimeout(400);
const selLabel = await industrySel.locator("option:checked").textContent();
rec("industry preset (healthcare 45%) applies", /45% automation/.test(selLabel ?? ""), (selLabel ?? "").trim());

// refine reveals advanced inputs
await page.getByRole("button", { name: /Refine this estimate/ }).click();
await page.waitForTimeout(300);
rec("refine reveals advanced inputs", await page.getByLabel("Average annual salary").isVisible().catch(() => false));

// methodology accordion
const method = page.getByText("Methodology & assumptions");
await method.click();
await page.waitForTimeout(400);
rec("methodology accordion opens", await page.getByText(/48 working weeks|2,080/).first().isVisible().catch(() => false));

// ============ 6. READINESS — full flow ============
await page.goto(BASE + "/ai-readiness", { waitUntil: "networkidle" });
await acceptCookies();
await page.getByRole("button", { name: /Start the Assessment/ }).click();
await page.waitForTimeout(300);
const scale = /^(Not at all|Partially|Moderately|Largely|Fully)/;
let answered = 0;
for (let i = 0; i < 12; i++) {
  const opt = page.getByRole("button", { name: scale });
  if (!(await opt.first().isVisible().catch(() => false))) break;
  await opt.last().click();
  answered++;
  await page.waitForTimeout(120);
}
rec("readiness answers 10 questions", answered === 10, `${answered}`);
await page.waitForTimeout(500);
const scoreVisible = await page.getByText(/out of 100/).isVisible().catch(() => false);
const nextStep = await page.getByText("Recommended next step").isVisible().catch(() => false);
rec("readiness shows score", scoreVisible);
rec("readiness shows recommendation", nextStep);
const retake = page.getByRole("button", { name: /Retake/ });
await retake.click();
await page.waitForTimeout(300);
// Retake returns to Question 1 (started stays true) — verify questions restart
const q1 = await page.getByText(/Question 1 \/ 10/).isVisible().catch(() => false);
rec("retake restarts at question 1", q1);

// ============ 7. INTAKE — validation + full submit ============
// LIVE=1 skips the final POST (no test briefs into a production inbox);
// validation and all wizard steps up to submit are still exercised.
const LIVE = !!process.env.LIVE;
await page.goto(BASE + "/start-a-project", { waitUntil: "networkidle" });
await acceptCookies();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Continue/ }).click();
await page.waitForTimeout(300);
rec("intake blocks empty step", await page.getByText("Company name is required.").isVisible().catch(() => false));

await page.locator("#f-companyName").fill("Predeploy Verify Co");
await page.locator("#f-companySize").selectOption({ index: 2 });
await page.locator("#f-industry").fill("Logistics");
await page.locator("#f-country").fill("Germany");
await page.getByRole("button", { name: /Continue/ }).click();
await page.locator("#f-problem").fill("Invoice processing is fully manual across three regional teams.");
await page.getByRole("button", { name: /Continue/ }).click();
await page.locator("#f-currentWorkflow").fill("Emails arrive as PDFs, staff key them into SAP by hand.");
await page.getByRole("button", { name: /Continue/ }).click();
await page.locator("#f-existingSoftware").fill("SAP, Outlook");
await page.getByRole("button", { name: /Continue/ }).click();
await page.locator("#f-desiredOutcome").fill("Automated intake with human approval on exceptions.");
await page.getByRole("button", { name: /Continue/ }).click();
await page.locator("#f-budgetRange").selectOption({ index: 1 });
await page.getByRole("button", { name: /Continue/ }).click();
await page.locator("#f-timeline").selectOption({ index: 2 });
await page.locator("#f-contactName").fill("QA User");
await page.locator("#f-contactEmail").fill("predeploy-verify@example.test");
await page.locator("#f-contactRole").fill("CTO");
await page.getByRole("checkbox").check();
if (LIVE) {
  rec("intake ready to submit (live: POST skipped)", true, "all 7 steps filled, consent checked");
} else {
  await page.getByRole("button", { name: /Submit Project Brief/ }).click();
  await page.waitForTimeout(1200);
  const refOk = await page.getByText(/Reference:\s*PB-/).isVisible().catch(() => false);
  rec("intake submits and issues reference ID", refOk);
}

// ============ 8. INSIGHTS FILTER (new) ============
await page.goto(BASE + "/insights", { waitUntil: "networkidle" });
await acceptCookies();
await page.waitForTimeout(400);
const allBtn = page.getByRole("button", { name: /^All/ });
await page.getByRole("button", { name: /Automation/ }).first().click();
await page.waitForTimeout(500);
let cards = await page.locator("main a[href^='/insights/']").count();
rec("insights filter 'Automation' → 1 card", cards === 1, `${cards} card(s)`);
await allBtn.click();
await page.waitForTimeout(500);
cards = await page.locator("main a[href^='/insights/']").count();
rec("insights filter 'All' → 6 cards", cards === 6, `${cards} card(s)`);

// ============ 9. 404 + back-to-top ============
const nf = await page.goto(BASE + "/definitely-not-a-page");
rec("branded 404", nf?.status() === 404, `HTTP ${nf?.status()}`);

await page.goto(BASE + "/technology", { waitUntil: "networkidle" });
await acceptCookies();
await page.evaluate(() => window.scrollTo(0, 2000));
await page.waitForTimeout(600);
const btt = page.getByRole("button", { name: /Back to top/i });
rec("back-to-top appears after scroll", await btt.isVisible().catch(() => false));
await btt.click().catch(() => page.locator("button[aria-label*='top' i]").first().click());
await page.waitForTimeout(700);
rec("back-to-top scrolls to top", (await page.evaluate(() => window.scrollY)) < 50);

// ============ health ============
// The deliberate 404-test navigation logs an expected console error whose
// generic message carries no URL — excluded only because the response check
// above proves the run's sole 4xx is that intentional request.
rec("no console errors across all journeys", consoleErrors.filter((e) => !e.includes("definitely-not-a-page") && /404 \(/.test(e) === false).length === 0, consoleErrors.slice(0, 3).join(" | "));
rec("no 4xx/5xx on happy path (except 404 test)", badResponses.filter((r) => !r.includes("definitely-not-a-page")).length === 0, badResponses.slice(0, 3).join(" | "));

await ctx.close();
await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n=== ${results.length - fails.length}/${results.length} PASS, ${fails.length} FAIL ===`);
process.exit(fails.length ? 1 : 0);
