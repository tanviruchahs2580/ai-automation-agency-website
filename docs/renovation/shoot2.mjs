import { chromium } from "playwright";

const BASE = "http://localhost:3117";
const OUT = "docs/renovation";
const shots = [];
const shot = async (page, name, selector = null) => {
  if (selector) {
    await page.locator(selector).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: `${OUT}/${name}.png` });
  shots.push(name);
};

const themeContext = async (browser, theme, width = 1440) => {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: theme === "dark" ? "dark" : "light",
  });
  await context.addInitScript((t) => {
    try { localStorage.setItem("vantiq-theme", t); } catch { /* noop */ }
  }, theme);
  return context;
};

{
  const browser = await chromium.launch();
  // Theme-flash check: capture at commit time, before hydration settles.
  for (const theme of ["dark", "light"]) {
    const context = await themeContext(browser, theme);
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "commit" });
    const firstPaint = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const settled = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    console.log(`FLASH_CHECK ${theme}: first-paint=${firstPaint} settled=${settled}`);
    await context.close();
  }
  // Renovated inner pages, dark.
  const context = await themeContext(browser, "dark");
  const page = await context.newPage();
  const routes = [
    ["solutions-index", "/solutions", "text=Engineered systems"],
    ["services-index", "/services", "text=Engineering capacity"],
    ["work-index", "/work", "text=Evidence over hype"],
    ["insights-index", "/insights", "text=Notes from inside"],
    ["technology", "/technology", "text=The platform behind"],
    ["roi-page", "/roi-calculator", "text=What is manual work"],
    ["readiness-page", "/ai-readiness", "text=Get your AI readiness"],
    ["start-page", "/start-a-project", "text=Tell us what you"],
    ["team-page", "/team", "text=shared byline"],
  ];
  for (const [name, path, sel] of routes) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    await shot(page, `${name}-dark-1440`, sel);
  }
  await browser.close();
}
console.log("SHOTS " + shots.length);
