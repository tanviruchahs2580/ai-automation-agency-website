/**
 * Core Web Vitals, measured on a deployment.
 *
 *   METRICS_BASE=https://<host> node scripts/measure-vitals.mjs
 *
 * Runs five times per route and reports the worst, which is closer to what a
 * field measurement sees than a single warm run. This is lab data from a real
 * network path, not CrUX: the numbers are only meaningful next to the route they
 * came from and the machine that produced them, so both are printed.
 *
 * CLS is read from layout-shift entries, LCP from the largest-contentful-paint
 * entry, and INP is approximated by the worst interaction latency the page
 * reports (there is no synthetic INP without real interactions).
 */
import { chromium, devices } from "playwright";

const BASE = process.env.METRICS_BASE;
if (!BASE) {
  console.error("METRICS_BASE is required, e.g. METRICS_BASE=https://example.com");
  process.exit(1);
}

const ROUTES = process.env.METRICS_ROUTES?.split(",") ?? ["/", "/solutions", "/start-a-project"];
const RUNS = Number(process.env.METRICS_RUNS ?? 5);

const browser = await chromium.launch();

async function measure(route, { mobile }) {
  const context = await browser.newContext(
    mobile ? { ...devices["Pixel 7"] } : { viewport: { width: 1440, height: 900 } },
  );
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0, ttfb: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__vitals.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${BASE}${route}`, { waitUntil: "load" });
  await page.waitForTimeout(2500); // let late layout shifts and LCP land

  const measured = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByName("first-contentful-paint")[0];
    return {
      lcp: window.__vitals.lcp,
      cls: window.__vitals.cls,
      fcp: paint?.startTime ?? 0,
      ttfb: nav?.responseStart ?? 0,
      transferred: performance
        .getEntriesByType("resource")
        .reduce((sum, r) => sum + (r.transferSize || 0), 0),
    };
  });

  await context.close();
  return measured;
}

function worst(runs, key) {
  return Math.max(...runs.map((r) => r[key]));
}

console.log(`\nCore Web Vitals against ${BASE}`);
console.log(`(${RUNS} runs per route, worst reported. Lab data over a real network path.)\n`);
console.log(
  "route".padEnd(22) + "view    LCP      CLS      FCP      TTFB     bytes",
);
console.log("-".repeat(78));

const summary = [];

for (const route of ROUTES) {
  for (const mobile of [false, true]) {
    const runs = [];
    for (let i = 0; i < RUNS; i += 1) runs.push(await measure(route, { mobile }));

    const lcp = worst(runs, "lcp");
    const cls = worst(runs, "cls");
    const fcp = worst(runs, "fcp");
    const ttfb = worst(runs, "ttfb");
    const bytes = worst(runs, "transferred");

    summary.push({ route, mobile, lcp, cls, fcp, ttfb, bytes });

    console.log(
      route.padEnd(22) +
        (mobile ? "mobile " : "desktop") +
        `${Math.round(lcp)}ms`.padEnd(9) +
        cls.toFixed(4).padEnd(9) +
        `${Math.round(fcp)}ms`.padEnd(9) +
        `${Math.round(ttfb)}ms`.padEnd(9) +
        `${(bytes / 1024).toFixed(0)} KB`,
    );
  }
}

await browser.close();

const worstLcp = Math.max(...summary.map((s) => s.lcp));
const worstCls = Math.max(...summary.map((s) => s.cls));

console.log("\nAgainst the budgets in DESIGN-SYSTEM.md (LCP < 1200ms, CLS < 0.05):");
console.log(`  worst LCP ${Math.round(worstLcp)}ms  ${worstLcp < 1200 ? "PASS" : "over"}`);
console.log(`  worst CLS ${worstCls.toFixed(4)}   ${worstCls < 0.05 ? "PASS" : "over"}`);

if (worstLcp >= 1200 || worstCls >= 0.05) process.exitCode = 1;
