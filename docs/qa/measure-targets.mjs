import { chromium } from "@playwright/test";
const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });

const report = await page.evaluate(() => {
  const rows = [];
  const push = (label, el) => {
    const r = el.getBoundingClientRect();
    rows.push({ label, w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) });
  };
  // footer link rows: spacing between consecutive links
  const footLinks = [...document.querySelectorAll("footer a[href]")];
  const boxes = footLinks.map((a) => ({ text: a.textContent.trim().slice(0, 22), r: a.getBoundingClientRect() }));
  const gaps = [];
  for (let i = 1; i < boxes.length; i++) {
    const prev = boxes[i - 1].r;
    const cur = boxes[i].r;
    if (Math.abs(prev.left - cur.left) < 4 && cur.top > prev.top) {
      gaps.push(Math.round(cur.top - prev.bottom));
    }
  }
  // accordion toggles
  const toggles = [...document.querySelectorAll("button")].filter((b) => /Show .* options/.test(b.getAttribute("aria-label") || ""));
  toggles.forEach((b) => push("accordion-toggle", b));
  return {
    footerLinkCount: boxes.length,
    footerLinkHeights: [...new Set(boxes.map((b) => Math.round(b.r.height)))],
    verticalGapsBetweenStackedFooterLinks: [...new Set(gaps)],
    toggles: rows,
  };
});
console.log(JSON.stringify(report, null, 2));
await browser.close();
