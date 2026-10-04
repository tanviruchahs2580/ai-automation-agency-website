import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const [name, vp] of [["mobile", { width: 375, height: 812 }], ["desktop", { width: 1440, height: 900 }]]) {
  const c = await b.newContext({ viewport: vp, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto("http://localhost:3117/", { waitUntil: "networkidle" });
  const info = {
    headerButtons: await p.evaluate(() =>
      [...document.querySelectorAll("header button")].map((x) => x.getAttribute("aria-label") || x.textContent.trim().slice(0, 24)),
    ),
    cta: await p.evaluate(() => {
      const a = [...document.querySelectorAll("header a")].find((x) => x.textContent.trim() === "Start a Project");
      if (!a) return null;
      const r = a.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    }),
  };
  if (name === "mobile") {
    await p.getByRole("button", { name: /menu/i }).click();
    await p.waitForTimeout(400);
    info.menuButtons = await p.evaluate(() =>
      [...document.querySelectorAll("#mobile-menu button")].map((x) => x.getAttribute("aria-label") || x.textContent.trim().slice(0, 24)),
    );
  }
  console.log(name, JSON.stringify(info, null, 1));
  await c.close();
}
await b.close();
