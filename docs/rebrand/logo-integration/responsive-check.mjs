// Responsive verification for the logo integration (master prompt §5).
// Checks at 320/360/390/430/768/1024/1280/1440: horizontal overflow, and that
// the brand lockup does not collide with the menu button or header CTA.
import { chromium } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:3117";
const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440];
const browser = await chromium.launch();
let failures = 0;

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  const collide = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 ? rect : null;
    };
    const logo = box('header a[aria-label*="home"]');
    const burger = box('header button[aria-label*="menu" i]');
    const cta = box('header a[href="/start-a-project"]');
    if (logo && burger && logo.right > burger.left + 1) return "logo overlaps menu button";
    if (logo && cta && logo.right > cta.left + 1) return "logo overlaps CTA";
    return false;
  });
  const ok = overflow <= 0 && !collide;
  if (!ok) failures += 1;
  console.log(`${width}px: overflow=${overflow}px collide=${collide || "none"} ${ok ? "ok" : "FAIL"}`);
  await context.close();
}

await browser.close();
console.log(failures === 0 ? "RESPONSIVE SWEEP OK" : `RESPONSIVE SWEEP: ${failures} FAILURES`);
process.exitCode = failures === 0 ? 0 : 1;
