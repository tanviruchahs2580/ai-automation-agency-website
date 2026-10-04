import { chromium } from "@playwright/test";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 375, height: 812 }, colorScheme: "dark" });
const p = await c.newPage();
await p.goto("http://localhost:3117/", { waitUntil: "networkidle" });

await p.getByRole("button", { name: /menu/i }).click();
await p.waitForTimeout(400);

const visible = await p.evaluate(() =>
  [...document.querySelectorAll("#mobile-menu button, header button")]
    .filter((x) => x.getBoundingClientRect().width > 0)
    .map((x) => x.getAttribute("aria-label") || x.textContent.replace(/\s+/g, " ").trim().slice(0, 24)),
);
console.log("visible controls with menu open:", JSON.stringify(visible));

const themeReachable = visible.some((t) => /light|dark|theme/i.test(t));
const searchReachable = visible.some((t) => /^search/i.test(t));
console.log("theme toggle reachable:", themeReachable, "| search reachable:", searchReachable);

// exercise search
await p.getByRole("button", { name: "Search", exact: true }).click();
await p.waitForTimeout(600);
const modalOpen = await p.evaluate(() => !!document.querySelector('[role="dialog"] input, input[placeholder*="Search"]'));
console.log("search modal opened:", modalOpen);

// exercise theme toggle
await p.reload({ waitUntil: "networkidle" });
await p.getByRole("button", { name: /menu/i }).click();
await p.waitForTimeout(300);
const before = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
await p.getByRole("button", { name: /Switch to .+ mode/ }).click();
await p.waitForTimeout(300);
const after = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
console.log("theme before/after:", before, "->", after);

await b.close();
