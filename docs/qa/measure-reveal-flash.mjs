import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const browser = await chromium.launch();

for (let run = 1; run <= 3; run++) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__samples = [];
    const sample = () => {
      const h1 = document.querySelector("h1.text-hero");
      if (h1) {
        let el = h1;
        let combined = 1;
        let hasMotion = false;
        while (el && el !== document.documentElement) {
          const cs = getComputedStyle(el);
          combined *= Number(cs.opacity);
          if (el.style && (el.style.opacity || el.style.transform)) hasMotion = true;
          el = el.parentElement;
        }
        window.__samples.push({ t: Math.round(performance.now()), o: Number(combined.toFixed(3)), m: hasMotion });
      }
      if (performance.now() < 2500) setTimeout(sample, 40);
    };
    setTimeout(sample, 0);
  });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(2600);
  const samples = await page.evaluate(() => window.__samples);
  const compact = samples.filter((_, i) => i < 6 || i % 5 === 0).map((s) => `${s.t}:${s.o}`);
  console.log(`run ${run}: ${compact.join(" ")}`);
  const seq = samples.map((s) => s.o > 0.05);
  let flash = false;
  for (let i = 2; i < seq.length; i++) if (seq[i - 2] && !seq[i - 1] && seq[i]) flash = true;
  const minO = Math.min(...samples.map((s) => s.o));
  console.log(`   min combined opacity=${minO}  FLASH=${flash}  motion-node-seen=${samples.some((s) => s.m)}`);
  await ctx.close();
}
await browser.close();
