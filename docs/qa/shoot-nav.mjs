import { chromium } from "@playwright/test";
const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const b = await chromium.launch();

// Desktop header states
for (const w of [1024, 1440]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `docs/qa/shots/hdr-${w}.png`, clip: { x: 0, y: 0, width: w, height: 96 } });
  // measure every header text node line count
  const m = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("header a, header button, header span, header p").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 26 && el.children.length === 0) {
        out.push({ t: el.textContent.trim().slice(0, 28), h: Math.round(r.height), w: Math.round(r.width) });
      }
    });
    return out;
  });
  console.log(w, JSON.stringify(m));
  await c.close();
}

// Mobile menu with new Company accordion
{
  const c = await b.newContext({ viewport: { width: 375, height: 812 }, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /menu/i }).click();
  await p.waitForTimeout(400);
  await p.getByRole("button", { name: "Show Company options" }).click();
  await p.waitForTimeout(400);
  await p.screenshot({ path: "docs/qa/shots/mobile-menu-company.png", clip: { x: 0, y: 0, width: 375, height: 812 } });
  await c.close();
}

// Desktop Company dropdown open
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Company", exact: true }).hover();
  await p.waitForTimeout(500);
  await p.screenshot({ path: "docs/qa/shots/dropdown-company.png", clip: { x: 0, y: 0, width: 1440, height: 420 } });
  await c.close();
}
await b.close();
console.log("done");
