/**
 * Responsive / overflow QA harness.
 *
 * Run against a production server: `npx next start -p 3117` (or `npm run dev`
 * with `PORT=3117`), then `node docs/qa/check-responsive.mjs`.
 *
 * Fails (exit 1) when any audited route develops horizontal overflow at a
 * breakpoint the renovation brief requires us to support.
 */
import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const ROUTES = [
  "/",
  "/solutions",
  "/services",
  "/industries",
  "/work",
  "/approach",
  "/technology",
  "/insights",
  "/about",
  "/team",
  "/security",
  "/ai-readiness",
  "/roi-calculator",
  "/start-a-project",
  "/privacy",
  "/terms",
  "/cookie-policy",
];
const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];

const browser = await chromium.launch();
const failures = [];
let checked = 0;

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    checked += 1;
    if (overflow > 1) failures.push({ width, route, overflow });
  }
  await ctx.close();
}

await browser.close();

if (failures.length > 0) {
  console.error(`FAIL — ${failures.length}/${checked} route×viewport combinations overflow:`);
  for (const f of failures) console.error(`  ${f.width}px ${f.route} → ${f.overflow}px`);
  process.exit(1);
}
console.log(`PASS — ${checked} route×viewport combinations, zero horizontal overflow.`);
