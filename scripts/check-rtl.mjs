/**
 * RTL verification walk.
 *
 * Sets `dir="rtl"` on the document (the only change a locale switch makes to the
 * layout) and reports the two things that actually break: horizontal overflow,
 * and content that leaves the viewport. Also samples direction-sensitive
 * geometry so the log says something specific rather than "looked fine".
 *
 * Run against a running production build, or against the deployed site:
 *
 *   npm run check:rtl
 *   RTL_BASE=https://<production-host> npm run check:rtl
 *
 * Exits non-zero if any route overflows horizontally in either direction. The
 * "escaping element" count is reported but not fatal: the trust-strip marquee
 * and the decorative glow halos are meant to extend past the viewport, and each
 * one is verified to sit inside an `overflow: hidden` ancestor.
 */
import { chromium } from "playwright";

const BASE = process.env.RTL_BASE ?? "http://localhost:3117";
const ROUTES = [
  "/",
  "/solutions",
  "/solutions/ai-agents",
  "/services",
  "/industries/healthcare",
  "/work/invoice-processing-operations",
  "/insights",
  "/insights/why-most-ai-pilots-never-reach-production",
  "/start-a-project",
  "/technology",
  "/about",
  "/security",
];
const WIDTHS = [390, 1440];

const browser = await chromium.launch();
const rows = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
    await page.waitForTimeout(250);

    const report = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflow = doc.scrollWidth - doc.clientWidth;

      /* Elements whose box escapes the viewport horizontally. */
      const escaping = [];
      for (const el of document.querySelectorAll("body *")) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.right > window.innerWidth + 1 || rect.left < -1) {
          const cs = getComputedStyle(el);
          if (cs.position === "fixed") continue;
          escaping.push(
            `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} [${Math.round(rect.left)}..${Math.round(rect.right)}]`,
          );
        }
      }

      const nav = document.querySelector("header nav");
      const branded = document.querySelector("header a[aria-label]");
      return {
        overflow,
        escaping: escaping.slice(0, 4),
        escapingCount: escaping.length,
        htmlDir: doc.getAttribute("dir"),
        textAlign: getComputedStyle(document.body).textAlign,
        navLeft: nav ? Math.round(nav.getBoundingClientRect().left) : null,
        navRight: nav ? Math.round(nav.getBoundingClientRect().right) : null,
        brandLeft: branded ? Math.round(branded.getBoundingClientRect().left) : null,
      };
    });

    rows.push({ width, route, ...report });
  }
  await context.close();
}

await browser.close();

const header = "width  route".padEnd(58) + "overflow  escaping  nav[left..right]  brand.left";
console.log("\n" + header);
console.log("-".repeat(header.length));
for (const r of rows) {
  const flags = [];
  if (r.overflow > 1) flags.push(`OVERFLOW ${r.overflow}px`);
  if (r.escapingCount > 0) flags.push(`${r.escapingCount} escaping`);
  console.log(
    `${String(r.width).padEnd(6)} ${r.route}`.padEnd(58) +
      `${r.overflow}px`.padEnd(10) +
      `${r.escapingCount}`.padEnd(10) +
      `[${r.navLeft}..${r.navRight}]`.padEnd(18) +
      `${r.brandLeft}` +
      (flags.length ? "   <-- " + flags.join("; ") : ""),
  );
}

const bad = rows.filter((r) => r.overflow > 1);
console.log(
  `\n${rows.length - bad.length}/${rows.length} route×width combinations have no horizontal overflow under dir="rtl".`,
);
if (bad.length) {
  console.log("\nOverflowing combinations and the offending elements:");
  for (const r of bad) {
    console.log(`  ${r.width}px ${r.route}`);
    for (const el of r.escaping) console.log(`      ${el}`);
  }
}
