import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const browser = await chromium.launch();

// ---------- 1. mobile touch targets (>= 44x44) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  const collect = async (label) => {
    const small = await page.evaluate(() => {
      const out = [];
      const nodes = [...document.querySelectorAll('a[href], button, input, [role="button"], [role="menuitem"]')];
      for (const el of nodes) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.height < 44 || r.width < 44) {
          out.push({
            tag: el.tagName,
            text: (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34),
            w: Math.round(r.width),
            h: Math.round(r.height),
          });
        }
      }
      return out;
    });
    console.log(`\n[touch ${label}] under-44px targets: ${small.length}`);
    for (const s of small.slice(0, 20)) console.log(`   ${s.tag} ${s.w}x${s.h} "${s.text}"`);
  };

  await collect("header closed");
  await page.getByRole("button", { name: /menu/i }).click();
  await page.waitForTimeout(500);
  await collect("mobile menu open");
  await ctx.close();
}

// ---------- 2. route transition duration ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  const durations = await page.evaluate(() => {
    const el = document.querySelector("[data-route-fade], main");
    const out = [];
    const anims = document.getAnimations();
    for (const a of anims) {
      const t = a.effect?.target;
      if (!t) continue;
      const d = a.effect?.getTiming?.().duration ?? 0;
      if (d > 0) out.push({ name: a.animationName ?? a.id ?? "?", ms: Math.round(d) });
    }
    return { count: out.length, unique: [...new Set(out.map((x) => `${x.name}:${x.ms}`))], hasMain: !!el };
  });
  console.log(`\n[transitions] active animations=${durations.count} unique=${JSON.stringify(durations.unique)}`);

  // measure client-side navigation paint timing
  const t0 = Date.now();
  await page.click('header a[href="/solutions"]');
  await page.waitForURL("**/solutions");
  await page.waitForSelector("h1");
  console.log(`[nav] / -> /solutions visible h1 in ${Date.now() - t0}ms`);
  await ctx.close();
}

await browser.close();
