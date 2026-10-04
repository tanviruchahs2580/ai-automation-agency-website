import { chromium } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const browser = await chromium.launch();

for (const route of ["/", "/solutions", "/start-a-project"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const scripts = new Set();
  page.on("response", (res) => {
    if (res.request().resourceType() === "script" && res.url().includes("/_next/")) {
      scripts.add(res.url());
    }
  });
  const t0 = Date.now();
  await page.goto(BASE + route, { waitUntil: "load" });
  const loadMs = Date.now() - t0;

  let raw = 0;
  let gz = 0;
  let missing = 0;
  for (const url of scripts) {
    const p = url.replace(BASE, "").replace(/^\//, "");
    const candidate = p.startsWith("_next/") ? resolve(".next", p.slice("_next/".length)) : null;
    if (candidate && existsSync(candidate)) {
      const buf = readFileSync(candidate);
      raw += buf.length;
      gz += gzipSync(buf, { level: 9 }).length;
    } else {
      missing += 1;
    }
  }
  console.log(
    `${route.padEnd(18)} scripts=${scripts.size} missing=${missing} JS raw=${(raw / 1024).toFixed(1)}KB gzip=${(gz / 1024).toFixed(1)}KB load=${loadMs}ms`,
  );
  await ctx.close();
}
await browser.close();
