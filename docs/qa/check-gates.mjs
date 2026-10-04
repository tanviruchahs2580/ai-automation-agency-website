import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";

const rg = (pattern, extra = []) => {
  try {
    return execSync(`rg -n -i "${pattern}" src/ ${extra.join(" ")}`, { encoding: "utf8" }).trim();
  } catch {
    return ""; // rg exits 1 with no matches
  }
};

console.log("=== 1. FORBIDDEN MARKETING WORDS ===");
const words =
  "revolutionary|game-changing|world-class|cutting-edge|seamless|synergy|unlock the power|supercharge|revolutionize|paradigm shift|next-generation|bleeding-edge|best-in-class";
console.log(rg(words) || "0 matches");

console.log("=== 2. FAKE / UNSUBSTANTIATED NUMERIC CLAIMS ===");
console.log(rg("[0-9]+% (faster|reduction|increase|improvement|savings)", ["--glob", "'!**/__tests__/**'"]) || "0 matches");

console.log("=== 3. PLACEHOLDER SWEEP (src) ===");
console.log(rg("placeholder|lorem ipsum|TODO|FIXME|coming soon") || "0 matches");

console.log("=== 4. HOMEPAGE SECTION INDEXES ===");
console.log(rg('index="0'));

// --- landmark / heading structure ---
console.log("=== 5. LANDMARK + HEADING STRUCTURE ===");
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const r of ["/", "/solutions", "/start-a-project", "/roi-calculator", "/insights"]) {
  await page.goto(BASE + r, { waitUntil: "domcontentloaded" });
  const o = await page.evaluate(() => {
    const hs = {};
    for (const n of [1, 2, 3, 4]) hs[`h${n}`] = document.querySelectorAll(`h${n}`).length;
    let skip = false;
    for (const a of document.querySelectorAll("a[href]")) {
      const h = a.getAttribute("href") || "";
      if (h.startsWith("#") && h.length > 1 && document.querySelector(h)) { skip = true; break; }
    }
    return {
      ...hs,
      main: document.querySelectorAll("main").length,
      nav: document.querySelectorAll("nav").length,
      footer: document.querySelectorAll("footer").length,
      skip,
      lang: document.documentElement.lang || "(missing)",
      imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      btnNoName: [...document.querySelectorAll("button")].filter(
        (b) => !(b.getAttribute("aria-label") || b.textContent.trim()),
      ).length,
      linkNoName: [...document.querySelectorAll("a[href]")].filter(
        (a) => !(a.getAttribute("aria-label") || a.textContent.trim() || a.querySelector("img[alt]")),
      ).length,
    };
  });
  console.log(r.padEnd(18), JSON.stringify(o));
}
await browser.close();
