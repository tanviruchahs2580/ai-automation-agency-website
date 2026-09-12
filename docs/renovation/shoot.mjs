import { chromium } from "playwright";

const BASE = "http://localhost:3117";
const OUT = "docs/renovation";
const shots = [];
const shot = async (page, name, selector = null) => {
  if (selector) {
    await page.locator(selector).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: `${OUT}/${name}.png` });
  shots.push(name);
};

for (const theme of ["dark", "light"]) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme === "dark" ? "dark" : "light",
  });
  await context.addInitScript((t) => {
    try { localStorage.setItem("vantiq-theme", t); } catch { /* noop */ }
  }, theme);
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot(page, `home-hero-${theme}-1440`);
  await shot(page, `home-bento-${theme}-1440`, "text=From business problem");
  await shot(page, `home-landscape-${theme}-1440`, "text=We don't just add AI");
  await shot(page, `home-services-${theme}-1440`, "text=Seven services");
  await shot(page, `home-roi-${theme}-1440`, "text=Estimate what manual work");
  await shot(page, `home-cta-${theme}-1440`, "text=Start a project");
  await page.goto(BASE + "/solutions/ai-agents", { waitUntil: "networkidle" });
  await shot(page, `solution-detail-${theme}-1440`, "text=What this includes");
  await page.goto(BASE + "/work/invoice-processing-operations", { waitUntil: "networkidle" });
  await shot(page, `work-detail-${theme}-1440`);
  await page.goto(BASE + "/insights/why-most-ai-pilots-never-reach-production", { waitUntil: "networkidle" });
  await shot(page, `insight-article-${theme}-1440`, "text=Contents");
  await browser.close();
}

{
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    colorScheme: "dark",
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot(page, "home-hero-dark-375");
  await shot(page, "home-services-dark-375", "text=Seven services");
  await page.goto(BASE + "/roi-calculator", { waitUntil: "networkidle" });
  await shot(page, "roi-dark-375");
  await browser.close();
}

console.log("SHOTS " + shots.length + ": " + shots.join(", "));
