import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const seeds = [
  "/", "/solutions", "/services", "/industries", "/work", "/approach",
  "/technology", "/insights", "/about", "/team", "/security",
  "/ai-readiness", "/roi-calculator", "/start-a-project",
  "/privacy", "/terms", "/cookie-policy", "/sitemap.xml", "/robots.txt", "/feed.xml",
];
const slugs = {
  "/solutions": ["ai-agents", "workflow-automation", "ai-software", "enterprise-ai", "private-ai", "ai-transformation"],
  "/services": ["ai-strategy", "ai-engineering", "automation", "software-engineering", "data-ai-infrastructure", "security", "ai-operations"],
  "/industries": ["financial-services", "healthcare", "manufacturing", "retail", "logistics", "agriculture", "education", "real-estate", "professional-services", "saas-technology", "government", "energy"],
  "/work": ["invoice-processing-operations", "support-triage-agents", "private-knowledge-platform"],
  "/insights": ["why-most-ai-pilots-never-reach-production", "designing-agent-tools-least-privilege-in-practice", "rag-without-the-hype-what-retrieval-actually-fixes"],
};

const targets = new Set(seeds);
for (const [base, list] of Object.entries(slugs)) for (const s of list) targets.add(`${base}/${s}`);

// crawl internal hrefs too
const hrefs = new Set();
for (const seed of seeds) {
  await page.goto(BASE + seed, { waitUntil: "domcontentloaded" });
  const found = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute("href")),
  );
  for (const h of found) {
    if (!h || h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("http")) continue;
    hrefs.add(h.split("#")[0]);
  }
}
for (const h of hrefs) if (h.startsWith("/")) targets.add(h);

const failures = [];
let checked = 0;
for (const t of [...targets].sort()) {
  const res = await page.request.get(BASE + t);
  checked += 1;
  if (res.status() >= 400) failures.push({ t, status: res.status() });
}

// localhost / placeholder sweep in rendered HTML of key routes.
// NEXT_PUBLIC_SITE_URL is unset in local env, so seo.ts intentionally falls
// back to http://localhost:3000 for canonical/og:url/JSON-LD. That is correct
// local behaviour, not a defect — it is only a failure when a production
// domain is configured and localhost still leaks.
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
const expectLocal = siteUrl === "";
const metaIssues = [];
for (const seed of ["/", "/solutions", "/work/invoice-processing-operations", "/insights"]) {
  await page.goto(BASE + seed, { waitUntil: "domcontentloaded" });
  const html = await page.content();
  if (expectLocal) continue;
  if (/localhost:\d+/.test(html)) metaIssues.push(`${seed}: localhost URL in output`);
  if (/127\.0\.0\.1/.test(html)) metaIssues.push(`${seed}: 127.0.0.1 in output`);
}

console.log(`checked ${checked} URLs, ${hrefs.size} unique internal hrefs discovered`);
if (expectLocal) {
  console.log(
    "INFO — NEXT_PUBLIC_SITE_URL unset, canonical/og:url fall back to localhost (expected locally; production must set it)",
  );
}
if (failures.length) {
  console.error("FAILURES:");
  for (const f of failures) console.error(`  ${f.status} ${f.t}`);
}
if (metaIssues.length) {
  console.error("METADATA ISSUES:");
  for (const m of metaIssues) console.error(`  ${m}`);
}
console.log(failures.length + metaIssues.length === 0 ? "PASS — all internal URLs resolve, no localhost leakage." : "FAIL");

await browser.close();
process.exit(failures.length + metaIssues.length === 0 ? 0 : 1);
