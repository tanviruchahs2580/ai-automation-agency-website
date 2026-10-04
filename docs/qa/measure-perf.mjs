import { chromium } from "@playwright/test";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3117";
const ROUTES = ["/", "/solutions", "/start-a-project", "/technology", "/insights"];
const browser = await chromium.launch();

for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  const resources = [];
  page.on("response", async (res) => {
    try {
      const buf = await res.body();
      resources.push({ url: res.url(), type: res.request().resourceType(), bytes: buf.length });
    } catch {
      /* ignore body-less responses */
    }
  });

  await page.goto(BASE + route, { waitUntil: "load" });
  const metrics = await page.evaluate(async () => {
    const nav = performance.getEntriesByType("navigation")[0];
    let lcp = 0;
    let cls = 0;
    await new Promise((resolve) => {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) lcp = Math.max(lcp, e.startTime);
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
      setTimeout(resolve, 2500);
    });
    return {
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
      lcp: Math.round(lcp),
      cls: Number(cls.toFixed(4)),
      resources: performance.getEntriesByType("resource").length,
    };
  });

  const byType = {};
  for (const r of resources) byType[r.type] = (byType[r.type] ?? 0) + r.bytes;
  const total = resources.reduce((s, r) => s + r.bytes, 0);
  const js = (byType.script ?? 0);
  const css = (byType.style ?? 0);
  const font = (byType.font ?? 0);
  console.log(
    `${route.padEnd(18)} TTFB=${metrics.ttfb}ms DCL=${metrics.domContentLoaded}ms load=${metrics.load}ms LCP=${metrics.lcp}ms CLS=${metrics.cls} res=${metrics.resources}`,
  );
  console.log(
    `  bytes: total=${(total / 1024).toFixed(1)}KB js=${(js / 1024).toFixed(1)}KB css=${(css / 1024).toFixed(1)}KB font=${(font / 1024).toFixed(1)}KB img=${((byType.image ?? 0) / 1024).toFixed(1)}KB`,
  );
  await ctx.close();
}
await browser.close();
