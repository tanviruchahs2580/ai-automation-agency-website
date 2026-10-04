import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const w of [1024, 1440]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto("http://localhost:3117/", { waitUntil: "networkidle" });
  const labels = await p.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label="Primary"] a')].map((a) => a.textContent.replace(/\s+/g, " ").trim()),
  );
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(w, JSON.stringify(labels), "overflow=", overflow);
  await c.close();
}
await b.close();
