import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const w of [1024, 1180, 1280, 1440, 1920]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto("http://localhost:3117/", { waitUntil: "networkidle" });
  const m = await p.evaluate(() => {
    const box = document.querySelector("header > .container-x");
    const word = document.querySelector("header .container-x > a, header .container-x > div:first-child");
    const nav = document.querySelector('nav[aria-label="Primary"]');
    const right = nav ? nav.nextElementSibling : null;
    const cta = [...document.querySelectorAll("header a")].find((x) => x.textContent.trim() === "Start a Project");
    if (cta) cta.style.whiteSpace = "nowrap";
    const r = (el) => (el ? Math.round(el.getBoundingClientRect().width) : null);
    return {
      container: r(box),
      wordmark: r(word),
      nav: r(nav),
      right: r(right),
      ctaNow: r(cta),
      ctaH: cta ? Math.round(cta.getBoundingClientRect().height) : null,
      overflowNow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  // total needed vs available
  const need = (m.wordmark ?? 0) + (m.nav ?? 0) + (m.right ?? 0);
  console.log(w, JSON.stringify(m), "need=", need, "avail=", m.container, "deficit=", need - m.container);
  await c.close();
}
await b.close();
