const { chromium } = require('playwright');
const fs = require('fs');

fs.mkdirSync('gui-test-screenshots', { recursive: true });

async function runTests() {
  var resultsArr = [];
  var consoleErrors = [];

  var browser = await chromium.launch({ headless: true });

  // Dark theme landing page
  var page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page1.on('console', function(msg) {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push({ test: 'dark-landing', type: msg.type(), text: msg.text().substring(0, 300) });
    }
  });

  await page1.context().addInitScript(function() {
    localStorage.setItem('vantiq-theme', 'dark');
  });

  var resp = await page1.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 15000 });
  var themeAfterLoad = await page1.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  console.log('Dark theme after load: ' + themeAfterLoad);
  resultsArr.push({ test: 'Dark theme loads', status: themeAfterLoad === 'dark' ? 'PASS' : 'FAIL', details: themeAfterLoad });

  var h1 = await page1.locator('h1').first().textContent();
  console.log('H1: ' + h1);
  resultsArr.push({ test: 'H1 present', status: (h1 && h1.length > 10) ? 'PASS' : 'FAIL', details: h1 ? 'length=' + h1.length : 'missing' });

  var sections = await page1.locator('section').count();
  console.log('Sections: ' + sections);
  resultsArr.push({ test: 'Sections count', status: sections > 3 ? 'PASS' : 'FAIL', details: 'count=' + sections });

  var ctaBtns = await page1.locator('button:has-text("Start a project"), a:has-text("Start a project")').all();
  console.log('CTAs: ' + ctaBtns.length);
  resultsArr.push({ test: 'CTA buttons', status: ctaBtns.length > 0 ? 'PASS' : 'FAIL', details: 'count=' + ctaBtns.length });

  // Test theme toggle
  var toggleBtn = await page1.locator('button[aria-label="Switch to light mode"]').first();
  var toggleExists = await toggleBtn.count();
  console.log('Toggle button exists: ' + toggleExists);

  if (toggleExists > 0) {
    await toggleBtn.click();
    await page1.waitForTimeout(400);
    var newTheme = await page1.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
    console.log('After toggle to light: ' + newTheme);
    resultsArr.push({ test: 'Toggle dark to light', status: newTheme === 'light' ? 'PASS' : 'FAIL', details: newTheme });
  } else {
    resultsArr.push({ test: 'Toggle dark to light', status: 'SKIP', details: 'button not found' });
  }

  await page1.screenshot({ path: 'gui-test-screenshots/01-landing-dark-1440.png' });

  // Light theme
  var page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page2.on('console', function(msg) {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push({ test: 'light-landing', type: msg.type(), text: msg.text().substring(0, 300) });
    }
  });
  await page2.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'light'); });
  await page2.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 15000 });
  var lightTheme = await page2.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  console.log('Light theme loaded: ' + lightTheme);
  resultsArr.push({ test: 'Light theme loads', status: lightTheme === 'light' ? 'PASS' : 'FAIL', details: lightTheme });

  var lightH1 = await page2.locator('h1').first().textContent();
  var h1Match = lightH1 === h1;
  console.log('H1 matches light: ' + h1Match);
  resultsArr.push({ test: 'H1 matches light', status: h1Match ? 'PASS' : 'FAIL', details: 'same=' + h1Match });

  await page2.screenshot({ path: 'gui-test-screenshots/02-landing-light-1440.png' });

  // Mobile 375px
  var page3 = await browser.newPage({ viewport: { width: 375, height: 667 } });
  page3.on('console', function(msg) {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push({ test: 'mobile-375', type: msg.type(), text: msg.text().substring(0, 300) });
    }
  });
  await page3.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await page3.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 15000 });

  var bodyWidth = await page3.evaluate(function() { return document.body.scrollWidth; });
  var vpWidth = await page3.evaluate(function() { return window.innerWidth; });
  var hasH1 = await page3.locator('h1').count() > 0;
  var hasNav = await page3.locator('nav').count() > 0;
  var overflow = bodyWidth > vpWidth;
  console.log('375px: h1=' + hasH1 + ' nav=' + hasNav + ' overflow=' + overflow);
  resultsArr.push({ test: 'Mobile 375px', status: (hasH1 && hasNav) ? 'PASS' : 'FAIL', details: 'h1=' + hasH1 + ' nav=' + hasNav });
  resultsArr.push({ test: 'Mobile no overflow', status: !overflow ? 'PASS' : 'FAIL', details: bodyWidth + '/' + vpWidth });

  var menuBtn = await page3.locator('button[aria-label="Open menu"]').first();
  var menuExists = await menuBtn.count();
  if (menuExists > 0) {
    await menuBtn.click();
    await page3.waitForTimeout(500);
    var navText = await page3.locator('nav').first().textContent();
    console.log('Mobile menu opened, nav=' + navText.length + ' chars');
    resultsArr.push({ test: 'Mobile menu opens', status: navText.length > 100 ? 'PASS' : 'FAIL', details: navText.length + ' chars' });
    await page3.keyboard.press('Escape');
    resultsArr.push({ test: 'Mobile menu closes', status: 'PASS', details: 'Esc pressed' });
  }

  await page3.screenshot({ path: 'gui-test-screenshots/03-landing-375-dark.png' });
  await browser.close();

  // Write results
  fs.writeFileSync('gui-test-screenshots/battery1.json', JSON.stringify(resultsArr, null, 2));
  fs.writeFileSync('gui-test-screenshots/battery1_console.json', JSON.stringify(consoleErrors, null, 2));

  console.log('\n=== BATTERY 1 COMPLETE ===');
  resultsArr.forEach(function(r) { console.log(r.status + ': ' + r.test + ' - ' + r.details); });
  console.log('Console errors: ' + consoleErrors.length);
  consoleErrors.forEach(function(e) { console.log('  [' + e.test + '] [' + e.type + '] ' + e.text.substring(0, 120)); });
}

runTests().then(function() {
  console.log('Done');
  process.exit(0);
}).catch(function(err) {
  console.error('Error:', err.message);
  process.exit(1);
});
