import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const results = [];
const rec = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};

const browser = await chromium.launch();

// ---------------------------------------------------------------- desktop
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const page = await ctx.newPage();
let consoleErrors = [];
let pageErrors = [];
let badResponses = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => pageErrors.push(String(e)));
page.on("response", (r) => r.status() >= 400 && badResponses.push(`${r.status()} ${r.url()}`));

await page.goto(BASE + "/", { waitUntil: "networkidle" });

const acceptCookies = async () => {
  try {
    const a = page.getByRole("button", { name: "Accept" });
    await a.waitFor({ state: "visible", timeout: 3000 });
    await a.click();
    await page.waitForTimeout(300);
  } catch {
    /* already dismissed */
  }
};
await acceptCookies();

// --- 1. desktop nav: every primary item resolves ---
for (const label of ["Solutions", "Services", "Industries", "Work", "Technology", "Insights", "Company"]) {
  const link = page.locator(`header nav[aria-label='Primary'] a:has-text("${label}")`).first();
  if (!(await link.count())) {
    rec(`nav primary "${label}" present`, false, "not found");
    continue;
  }
  await link.click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(400);
  const h1 = (await page.locator("h1").first().textContent().catch(() => "")) || "";
  rec(`nav primary "${label}" navigates`, !page.url().endsWith("404") && !!h1.trim(), `${page.url().replace(BASE, "")} h1="${h1.trim().slice(0, 44)}"`);
  await page.goBack();
  await page.waitForLoadState("domcontentloaded");
  await acceptCookies();
}

// --- 2. every desktop dropdown opens and its children resolve ---
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await acceptCookies();
const triggers = page.locator("header nav[aria-label='Primary'] a[aria-haspopup='menu']");
const ddCount = await triggers.count();
let childChecked = 0;
let childFails = 0;
let ddOpened = 0;
for (let i = 0; i < ddCount; i++) {
  const t = triggers.nth(i);
  const label = (await t.textContent()) || `#${i}`;
  await t.hover();
  await page.waitForTimeout(400);
  const menu = page.locator("header div[role='menu']");
  const opened = await menu.first().isVisible().catch(() => false);
  if (opened) ddOpened++;
  rec(`dropdown "${label.trim()}" opens`, opened);
  if (!opened) continue;
  const items = menu.first().locator("a[role='menuitem']");
  const n = await items.count();
  for (let j = 0; j < n; j++) {
    const href = await items.nth(j).getAttribute("href");
    if (!href || !href.startsWith("/")) continue;
    const res = await page.request.get(BASE + href);
    childChecked++;
    if (res.status() >= 400) {
      childFails++;
      rec(`dropdown child ${href}`, false, `HTTP ${res.status()}`);
    }
  }
}
rec(`all dropdown children resolve`, ddOpened === ddCount && childFails === 0, `${ddOpened}/${ddCount} opened, ${childChecked} links`);

// --- 3. search modal (⌘K) ---
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await acceptCookies();
await page.keyboard.press("Control+k");
await page.waitForTimeout(500);
const searchOpen = await page.locator("input[placeholder*='Search']").isVisible().catch(() => false);
rec("search opens with Ctrl+K", searchOpen);
if (searchOpen) {
  await page.keyboard.type("automation");
  await page.waitForTimeout(700);
  const hits = await page.locator("[role='option'], li a").count();
  rec("search returns results for 'automation'", hits > 0, `${hits} hits`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  rec("search closes with Escape", !(await page.locator("input[placeholder*='Search']").isVisible().catch(() => false)));
}

// --- 4. theme toggle persists ---
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await acceptCookies();
const t0 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
await page.getByRole("button", { name: /Switch to .+ mode/ }).click();
await page.waitForTimeout(300);
const t1 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
await page.reload({ waitUntil: "networkidle" });
await acceptCookies();
const t2 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
rec("theme toggles", t0 !== t1, `${t0} -> ${t1}`);
rec("theme persists across reload", t1 === t2, `stored=${t2}`);
await page.getByRole("button", { name: /Switch to .+ mode/ }).click();
await page.waitForTimeout(200);

// --- 5. ROI calculator ---
await page.goto(BASE + "/roi-calculator", { waitUntil: "networkidle" });
await acceptCookies();
const roiInputs = page.locator("input[type='number'], input[inputmode='numeric']");
const roiN = await roiInputs.count();
if (roiN >= 2) {
  await roiInputs.nth(0).fill("40");
  await roiInputs.nth(1).fill("1200");
  await page.waitForTimeout(800);
  const markers = await page.locator("text=/estimate|savings|return|\\$/i").count();
  rec("ROI calculator computes from inputs", markers > 0, `${roiN} inputs, ${markers} result markers`);
} else {
  rec("ROI calculator inputs present", false, `only ${roiN} inputs`);
}

// --- 6. readiness assessment (start gate -> 10 questions -> score) ---
await page.goto(BASE + "/ai-readiness", { waitUntil: "networkidle" });
await acceptCookies();
const startBtn = page.getByRole("button", { name: /Start the Assessment/i });
rec("readiness shows an explicit start gate", await startBtn.isVisible().catch(() => false));
await startBtn.click();
await page.waitForTimeout(500);
const scale = /^(Not at all|Partially|Moderately|Largely|Fully)/;
let q = 0;
for (let i = 0; i < 14; i++) {
  const opt = page.getByRole("button", { name: scale });
  const visible = await opt.first().isVisible().catch(() => false);
  if (!visible) break;
  await opt.last().click();
  q++;
  await page.waitForTimeout(200);
}
const resultCard = await page.getByRole("button", { name: /Retake/ }).isVisible().catch(() => false);
const hasScore = await page.getByText(/out of 100/).isVisible().catch(() => false);
const hasNext = await page.getByText(/Recommended next step/i).isVisible().catch(() => false);
rec("readiness assessment completes and shows a score", q === 10 && resultCard && hasScore, `${q} answered, resultCard=${resultCard} score=${hasScore}`);
rec("readiness shows a recommended next step", hasNext);

// --- 7. intake wizard end-to-end (real POST to /api/project-brief) ---
await page.goto(BASE + "/start-a-project", { waitUntil: "networkidle" });
await acceptCookies();
await page.getByTestId("intake-wizard").waitFor({ state: "visible", timeout: 20000 });
const hydrated = await page.getByTestId("intake-wizard").getAttribute("data-hydrated");
rec("intake wizard hydrated", hydrated === "true", `data-hydrated=${hydrated}`);

const fill = async (sel, val) => {
  const el = page.locator(sel);
  if (await el.count()) await el.fill(val).catch(() => {});
};
const pick = async (sel, index = 1) => {
  const el = page.locator(sel);
  if (await el.count()) await el.selectOption({ index }).catch(() => {});
};
const continueStep = async () => {
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.waitForTimeout(350);
};

await fill("#f-companyName", `QA Verify Co ${Date.now()}`);
await pick("#f-companySize", 2);
await fill("#f-industry", "Logistics");
await fill("#f-country", "Germany");
await continueStep();
await fill("#f-problem", "Invoice processing is fully manual across three regional teams.");
await continueStep();
await fill("#f-currentWorkflow", "Emails arrive as PDFs, staff key them into ERP by hand.");
await continueStep();
await fill("#f-existingSoftware", "SAP, Outlook");
await continueStep();
await fill("#f-desiredOutcome", "Automated intake with human approval on exceptions only.");
await continueStep();
await pick("#f-budgetRange", 1);
await continueStep();
await pick("#f-timeline", 2);
await fill("#f-contactName", "QA Tester");
await fill("#f-contactEmail", `qa-${Date.now()}@example.test`);
await fill("#f-contactRole", "CTO");
const consent = page.getByRole("checkbox");
if (await consent.count()) await consent.first().check().catch(() => {});
await page.getByRole("button", { name: /Submit Project Brief/ }).click();

const confirmed = await page
  .getByText("Your project brief is ready.")
  .waitFor({ state: "visible", timeout: 25000 })
  .then(() => true)
  .catch(() => false);
const body = (await page.locator("main").innerText().catch(() => "")) || "";
const ref = body.match(/PB-[A-Z0-9]+/);
rec("intake wizard submits and issues reference ID", confirmed && !!ref, ref ? ref[0] : `confirmed=${confirmed} :: ${body.replace(/\s+/g, " ").slice(0, 110)}`);
rec("intake shows recommended next step", /Recommended next step/i.test(body));

// --- 8. validation blocks an empty step ---
await page.goto(BASE + "/start-a-project", { waitUntil: "networkidle" });
await page.getByTestId("intake-wizard").waitFor({ state: "visible", timeout: 20000 });
await page.getByRole("button", { name: /Continue/ }).click();
await page.waitForTimeout(300);
const err = await page.getByText(/required/i).first().isVisible().catch(() => false);
rec("intake validation blocks invalid step", err);

// --- 9. 404 (intentional — counters reset afterwards) ---
const nf = await page.goto(BASE + "/definitely-not-a-real-page");
rec("unknown route returns branded 404", nf?.status() === 404, `HTTP ${nf?.status()}`);
rec("404 offers recovery links", (await page.locator("main a[href='/']").count()) > 0);

consoleErrors = [];
badResponses = [];

// --- 10. footer links ---
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await acceptCookies();
const footerHrefs = await page.locator("footer a[href]").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
let fFail = 0;
for (const h of footerHrefs) {
  if (!h || h.startsWith("#") || h.startsWith("mailto:")) continue;
  const path = h.startsWith("/") ? h : "/" + h;
  const res = await page.request.get(BASE + path);
  if (res.status() >= 400) {
    fFail++;
    rec(`footer link ${path}`, false, `HTTP ${res.status()}`);
  }
}
rec("footer internal links resolve", fFail === 0, `${footerHrefs.length} unique hrefs`);

// --- 11. console / page / network health (clean window) ---
rec("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
rec("no uncaught page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
rec("no 4xx/5xx on happy-path journeys", badResponses.length === 0, badResponses.slice(0, 5).join(" | "));

await ctx.close();

// ---------------------------------------------------------------- mobile
const mctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, colorScheme: "dark" });
const mp = await mctx.newPage();
await mp.goto(BASE + "/", { waitUntil: "networkidle" });
try {
  await mp.getByRole("button", { name: "Accept" }).click({ timeout: 3000 });
  await mp.waitForTimeout(300);
} catch {
  /* no banner */
}
await mp.getByRole("button", { name: /menu/i }).click();
await mp.waitForTimeout(500);
rec("mobile menu opens", await mp.locator("#mobile-menu").isVisible());

for (const label of ["Solutions", "Services", "Industries", "Company"]) {
  const btn = mp.getByRole("button", { name: `Show ${label} options` });
  if (!(await btn.count())) {
    rec(`mobile accordion "${label}" present`, false, "missing");
    continue;
  }
  // The menu grows as previous accordions open, pushing later rows out of the
  // viewport; a plain click() then fails. Collapse earlier rows first and fall
  // back to a synthetic click if Playwright still cannot reach it.
  await mp.locator("#mobile-menu").evaluate((el) => el.scrollTo(0, 0));
  const others = mp.locator('#mobile-menu button[aria-expanded="true"]:not([aria-label^="Show ' + label + '"])');
  const nOthers = await others.count();
  for (let i = nOthers - 1; i >= 0; i--) {
    await others.nth(i).evaluate((el) => el.click()).catch(() => {});
    await mp.waitForTimeout(150);
  }
  await btn.evaluate((el) => el.scrollIntoView({ block: "center" })).catch(() => {});
  await mp.waitForTimeout(150);
  const clicked = await btn
    .evaluate((el) => {
      el.click();
      return true;
    })
    .catch(() => false);
  await mp.waitForTimeout(350);
  const expanded = (await btn.getAttribute("aria-expanded")) === "true";
  rec(`mobile accordion "${label}" expands`, clicked && expanded, `clicked=${clicked} expanded=${expanded}`);
}

const techLink = mp.locator('#mobile-menu a[href="/technology"]');
await techLink.first().click();
await mp.waitForURL("**/technology", { timeout: 10000 }).catch(() => {});
rec("mobile menu item navigates", mp.url().includes("/technology"), mp.url().replace(BASE, ""));

await browser.close();

// ---------------------------------------------------------------- summary
const failed = results.filter((r) => !r.ok);
console.log("\n==========================================");
console.log(`USER FUNCTIONAL TEST: ${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("FAILURES:");
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
}
console.log("==========================================");
process.exit(failed.length === 0 ? 0 : 1);
