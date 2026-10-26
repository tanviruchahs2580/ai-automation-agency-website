/**
 * User-journey verification.
 *
 * Exercises the site the way a visitor does — clicking, typing, submitting —
 * against whatever base URL is supplied. Written to run against a Vercel
 * deployment as well as a local build:
 *
 *   JOURNEY_BASE=https://<host> node scripts/user-journey.mjs
 *
 * Exits non-zero if any step fails, and prints what it observed at each one so a
 * pass is evidence rather than an assertion.
 */
import { chromium, devices } from "playwright";

const BASE = process.env.JOURNEY_BASE;
if (!BASE) {
  console.error("JOURNEY_BASE is required, e.g. JOURNEY_BASE=https://example.com");
  process.exit(1);
}

const browser = await chromium.launch();
const results = [];
let failures = 0;

function record(step, ok, detail = "") {
  results.push({ step, ok, detail });
  if (!ok) failures += 1;
  console.log(`${ok ? "  ok  " : " FAIL "} ${step}${detail ? "  — " + detail : ""}`);
}

async function hydrate(page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === "true",
    undefined,
    { timeout: 30_000 },
  );
}

/* ---------- desktop journeys ---------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  /* 1. Home: hero, primary CTA, above the fold. */
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await hydrate(page);
  const h1 = await page.locator("h1").first().innerText();
  const cta = page.getByRole("link", { name: /Start a Project/i }).first();
  const ctaBox = await cta.boundingBox();
  record("home renders hero + primary CTA", h1.length > 20 && !!ctaBox, `h1 "${h1.slice(0, 34)}…"`);
  record("primary CTA above the 900px fold", !!ctaBox && ctaBox.y + ctaBox.height <= 900, `bottom ${Math.round(ctaBox?.y + ctaBox?.height)}px`);

  /* 2. Internal navigation is client-side and lands correctly. */
  await cta.click();
  await page.waitForURL("**/start-a-project", { timeout: 20_000 });
  record("CTA navigates to the intake", page.url().endsWith("/start-a-project"));

  /* 3. Intake wizard: validation, step advance, consent gate. */
  await hydrate(page);
  await page.getByRole("button", { name: /continue/i }).click();
  const firstError = await page.locator("p[role='alert']").first().innerText().catch(() => "");
  record("empty step blocks with an inline error", firstError.length > 0, `"${firstError.slice(0, 40)}"`);

  await page.getByLabel("Company name").fill("Northwind Freight");
  await page.locator("#f-companySize").selectOption({ index: 1 });
  await page.getByLabel("Industry").fill("Logistics");
  await page.getByLabel("Country").fill("Netherlands");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/problem are you trying to solve/i).fill(
    "Invoices arrive by email in mixed formats and three people key them into the ERP by hand every morning.",
  );
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/work get done today/i).fill("Email intake, manual keying, spreadsheet reconciliation.");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/success look like/i).fill("Straight-through processing with review only on exceptions.");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.locator("#f-budgetRange").selectOption({ index: 2 });
  await page.getByRole("button", { name: /continue/i }).click();
  record("wizard advances to the final step", await page.locator("#f-timeline").isVisible());

  await page.locator("#f-timeline").selectOption({ index: 1 });
  await page.getByLabel("Your name").fill("Ravi Kaur");
  await page.getByLabel("Work email").fill("ravi@northwind.example");
  await page.getByLabel("Role").fill("Head of Operations");
  /* Submit without consent: must be refused. */
  await page.getByRole("button", { name: /submit project brief/i }).click();
  const consentError = await page.locator("#f-consent-error").innerText().catch(() => "");
  record("submission refused without consent", consentError.length > 0, `"${consentError.slice(0, 40)}"`);

  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /submit project brief/i }).click();
  const receipt = await page.getByText(/Your project brief is ready/i).waitFor({ timeout: 30_000 }).then(() => true).catch(() => false);
  const reference = receipt ? await page.locator("text=/Reference:/").first().innerText().catch(() => "") : "";
  record("real submission returns a receipt", receipt, reference.trim());

  /* 4. ROI calculator recomputes from inputs. */
  await page.goto(`${BASE}/roi-calculator`, { waitUntil: "networkidle" });
  await hydrate(page);
  const readSavings = () =>
    page.locator('[data-testid="roi-results"]').locator("dd, div").filter({ hasText: /\$/ }).first().innerText();
  const before = await readSavings();
  await page.getByLabel("Current headcount on manual ops").fill("120");
  const after = await readSavings();
  record("ROI recalculates when inputs change", before !== after, `${before.trim()} -> ${after.trim()}`);
  const summary = await page.getByRole("status").filter({ hasText: "Estimate updated" }).innerText({ timeout: 10_000 }).catch(() => "");
  record("debounced live summary announced", summary.includes("Annual savings"), summary.slice(0, 60));

  /* 5. Readiness assessment completes. */
  await page.goto(`${BASE}/ai-readiness`, { waitUntil: "networkidle" });
  await hydrate(page);
  await page.getByRole("button", { name: /start/i }).first().click();
  for (let i = 0; i < 12; i += 1) {
    const option = page.getByRole("button", { name: /^(Not at all|Partially|Moderately|Largely|Fully)/ }).last();
    if (!(await option.isVisible().catch(() => false))) break;
    await option.click();
    await page.waitForTimeout(120);
  }
  const score = await page.getByText(/readiness score|your score/i).first().innerText({ timeout: 15_000 }).catch(() => "");
  record("readiness assessment produces a score", score.length > 0, score.slice(0, 50));

  /* 6. Search dialog: opens, filters, closes, restores focus. */
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await hydrate(page);
  await page.getByRole("button", { name: "Search" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Site search" });
  await dialog.waitFor({ timeout: 15_000 });
  await page.locator("#site-search-input").fill("agent");
  const status = await page.locator("#site-search-status").innerText();
  record("search opens and reports results", /result/i.test(status), status);
  await page.keyboard.press("Escape");
  record("Escape closes the search dialog", !(await dialog.isVisible().catch(() => false)));

  /* 7. Theme toggle persists. */
  await page.getByRole("button", { name: /switch to light|switch to dark|theme/i }).first().click();
  await page.waitForTimeout(400);
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  const stored = await page.evaluate(() => localStorage.getItem("vantiq-theme"));
  record("theme toggle switches and persists", theme === stored, `theme=${theme} stored=${stored}`);

  /*
    8. Desktop nav disclosure.

    The trigger is a `<Link>` carrying `aria-expanded`, not a button, and it
    opens on hover *and* on focus — so the meaningful test is the keyboard path.
    An earlier version of this script looked for a button and reported a failure
    that was the selector's fault, not the component's.
  */
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await hydrate(page);
  const navTrigger = page.locator("header nav a[aria-expanded]").first();
  if (await navTrigger.isVisible().catch(() => false)) {
    const label = (await navTrigger.innerText()).trim();
    await navTrigger.focus();
    await page.waitForTimeout(300);
    const opened = await navTrigger.getAttribute("aria-expanded");
    const panelId = await navTrigger.getAttribute("aria-controls");
    const panelVisible = panelId
      ? await page.locator(`#${panelId}`).isVisible().catch(() => false)
      : false;
    record(
      `nav disclosure opens on focus (${label})`,
      opened === "true" && panelVisible,
      `aria-expanded=${opened}, panel ${panelVisible ? "visible" : "hidden"}`,
    );

    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    const closed = await navTrigger.getAttribute("aria-expanded");
    const focusReturned = await navTrigger.evaluate((el) => el === document.activeElement);
    record(
      "Escape closes it and returns focus to the trigger",
      closed === "false" && focusReturned,
      `aria-expanded=${closed}, focused=${focusReturned}`,
    );
  } else {
    record("nav disclosure opens on focus", false, "no link with aria-expanded in the header");
  }

  /* 9. 404 renders the not-found page, and legal pages carry the draft banner. */
  const notFound = await page.goto(`${BASE}/this-route-does-not-exist`);
  record("unknown route returns 404", notFound.status() === 404, `status ${notFound.status()}`);
  await page.goto(`${BASE}/privacy`, { waitUntil: "networkidle" });
  const draft = await page.getByText(/legal review required/i).first().isVisible().catch(() => false);
  record("legal page shows the pending-review banner", draft);

  /* 10. Exactly one call to action in the header, and it says what it does.
   *
   * This started as a bug report: the header showed a compact "Start" pill beside
   * the desktop cluster's "Start a Project", because the pill's `lg:hidden` was
   * silently ignored (`.btn` declared `display` in unlayered CSS, which outranks
   * Tailwind's layers). The pill is gone and the cascade is fixed; this asserts
   * the outcome at every width, so a second header CTA cannot come back unnoticed.
   */
  for (const [label, width] of [["desktop", 1440], ["tablet", 900], ["mobile", 412], ["narrow", 320]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await hydrate(page).catch(() => {});
    const headerCtas = await page.evaluate(() => {
      const header = document.querySelector("header");
      if (!header) return null;
      return [...header.querySelectorAll("a")].filter((a) => {
        const rect = a.getBoundingClientRect();
        const style = getComputedStyle(a);
        return (
          /start-a-project/i.test(a.getAttribute("href") || "") &&
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden"
        );
      }).map((a) => (a.innerText || "").trim().replace(/\s+/g, " "));
    });
    const ok =
      headerCtas !== null &&
      (headerCtas.length === 0 ||
        (headerCtas.length === 1 && headerCtas[0] === "Start a Project"));
    record(
      `one header CTA at ${label} (${width}px)`,
      ok,
      headerCtas === null ? "no header" : headerCtas.length ? JSON.stringify(headerCtas) : "none (menu + hero carry it)",
    );
  }
  await page.setViewportSize({ width: 1440, height: 900 });

  /* 11. Social card actually resolves as an image.
   *
   * The page advertises an absolute URL built from the site's canonical origin,
   * which on a local build is `http://localhost:3000` (the fallback) while the
   * server under test may be on another port. Fetching the advertised URL
   * directly therefore failed with ECONNREFUSED and crashed the harness — the
   * harness's bug, not the site's. It now fetches the advertised *path* from the
   * base under test and reports the advertised origin, so a canonical mismatch is
   * visible in the output instead of being an unhandled rejection.
   */
  await page.goto(`${BASE}/insights`, { waitUntil: "networkidle" });
  const advertised = await page.locator('meta[property="og:image"]').getAttribute("content");
  let ogOk = false;
  let ogDetail = "no og:image meta tag";
  if (advertised) {
    try {
      const parsed = new URL(advertised);
      const response = await page.request.get(`${BASE}${parsed.pathname}${parsed.search}`, {
        failOnStatusCode: false,
      });
      const type = response.headers()["content-type"] ?? "";
      ogOk = response.status() === 200 && type.includes("image");
      ogDetail = `${response.status()} ${type} · advertised origin ${parsed.origin}`;
    } catch (error) {
      ogDetail = `request failed: ${error.message}`;
    }
  }
  record("social card resolves as an image", ogOk, ogDetail);

  await context.close();
}

/* ---------- mobile journey ---------- */
{
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await hydrate(page);

  const menu = page.getByRole("button", { name: /open menu/i });
  await menu.click();
  const menuVisible = await page.locator("#mobile-menu").isVisible();
  record("mobile menu opens", menuVisible);
  const searchInMenu = await page.getByRole("button", { name: /search/i }).first().isVisible().catch(() => false);
  record("mobile menu exposes search", searchInMenu);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  record("Escape closes the mobile menu", !(await page.locator("#mobile-menu").isVisible().catch(() => false)));

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  record("no horizontal overflow at 412px", overflow <= 1, `${overflow}px`);

  await context.close();
}

await browser.close();

console.log(`\n${results.length - failures}/${results.length} journey steps passed against ${BASE}`);
if (failures > 0) {
  console.log("\nFailed steps:");
  for (const r of results.filter((x) => !x.ok)) console.log(`  - ${r.step} ${r.detail}`);
  process.exitCode = 1;
}
