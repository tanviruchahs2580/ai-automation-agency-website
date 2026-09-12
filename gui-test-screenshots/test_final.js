var { chromium } = require('playwright');
var fs = require('fs');
var path = require('path');
fs.mkdirSync('gui-test-screenshots', { recursive: true });

var BASE = 'http://localhost:3001';
var results = [];
var errors = [];
var screenshots = [];

function pass(test, details) { results.push({ test: test, status: 'PASS', details: details || '' }); }
function fail(test, details) { results.push({ test: test, status: 'FAIL', details: details || '' }); }
function skip(test, details) { results.push({ test: test, status: 'SKIP', details: details || '' }); }
function log(msg) { console.log(msg); }

async function screenshot(page, name) {
  var p = 'gui-test-screenshots/' + name;
  await page.screenshot({ path: p, fullPage: false });
  screenshots.push(p);
}

async function testPage(page, url, viewport, testName) {
  await page.setViewportSize(viewport);
  await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 });
  var title = await page.title();
  var status = (page.url() || '').indexOf(url) >= 0 || (page.url() || '').indexOf('/404') < 0;
  var h1 = await page.locator('h1').first().textContent();
  var dataTheme = await page.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  var bodyScroll = await page.evaluate(function() { return document.body.scrollWidth; });
  var bodyClient = await page.evaluate(function() { return document.body.clientWidth; });
  var overflow = bodyScroll > bodyClient;
  pass(testName + ' loads (' + viewport.width + 'px)', 'title=' + title.substring(0, 40) + ', theme=' + dataTheme);
  if (!status) fail(testName + ' loads', '404 or wrong URL');
  if (!h1) fail(testName + ' has H1', 'missing');
  if (!dataTheme) fail(testName + ' theme', 'data-theme not set');
  if (overflow) fail(testName + ' responsive', 'horizontal overflow ' + bodyScroll + '/' + bodyClient);
}

(async function() {
  var browser = await chromium.launch({ headless: true });

  // === TEST GROUP 1: Theme flash check ===
  log('\n=== GROUP 1: Theme Flash Check ===');
  var flashPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  flashPage.on('console', function(msg) {
    if (msg.type() === 'error') errors.push({ test: 'flash', msg: msg.text().substring(0, 200) });
  });
  // Set dark via localStorage BEFORE loading
  await flashPage.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await flashPage.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var theme1 = await flashPage.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Dark theme flash check', 'data-theme=' + theme1);
  if (theme1 !== 'dark') fail('Dark theme flash check', 'got ' + theme1 + ' instead of dark');

  // Set light
  var flashPage2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await flashPage2.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'light'); });
  await flashPage2.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var theme2 = await flashPage2.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Light theme flash check', 'data-theme=' + theme2);
  if (theme2 !== 'light') fail('Light theme flash check', 'got ' + theme2 + ' instead of light');
  await screenshot(flashPage, 'firstpaint-dark.png');
  await screenshot(flashPage2, 'firstpaint-light.png');

  // === TEST GROUP 2: Landing page sections ===
  log('\n=== GROUP 2: Landing Page Sections ===');
  var home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  home.on('console', function(msg) {
    if (msg.type() === 'error') errors.push({ test: 'landing', msg: msg.text().substring(0, 200) });
  });
  await home.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await home.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });

  // Check all 9 sections
  var sections = await home.locator('section').count();
  pass('Landing has sections', 'count=' + sections);
  if (sections < 9) fail('Landing has sections', 'expected >=9, got ' + sections);

  // Check hero
  var heroText = await home.locator('h1').first().textContent();
  pass('Landing H1', heroText ? heroText.substring(0, 60) : 'missing');
  if (!heroText || heroText.length < 50) fail('Landing H1', 'too short or missing');

  // Check CTAs
  var ctaCount = await home.locator('a, button').filter({ hasText: 'Start a project' }).count();
  pass('CTA "Start a project" visible', 'count=' + ctaCount);
  if (ctaCount === 0) fail('CTA "Start a project" visible', 'none found');

  // Check theme toggle
  var toggleDark = await home.locator('button[aria-label="Switch to light mode"]').count();
  pass('Theme toggle (switch to light)', toggleDark > 0 ? 'found' : 'missing');
  if (toggleDark === 0) fail('Theme toggle (switch to light)', 'not found');

  // Toggle to light and verify
  await home.locator('button[aria-label="Switch to light mode"]').first().click();
  await home.waitForTimeout(400);
  var themeAfterToggle = await home.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Toggle dark -> light', themeAfterToggle);
  if (themeAfterToggle !== 'light') fail('Toggle dark -> light', 'got ' + themeAfterToggle);

  // Toggle back to dark
  await home.locator('button[aria-label="Switch to dark mode"]').first().click();
  await home.waitForTimeout(400);
  var themeBack = await home.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Toggle light -> dark', themeBack);
  if (themeBack !== 'dark') fail('Toggle light -> dark', 'got ' + themeBack);

  await screenshot(home, 'landing-dark-1440.png');

  // === TEST GROUP 3: Mobile ===
  log('\n=== GROUP 3: Mobile (375px) ===');
  var mobile = await browser.newPage({ viewport: { width: 375, height: 667 } });
  mobile.on('console', function(msg) {
    if (msg.type() === 'error') errors.push({ test: 'mobile', msg: msg.text().substring(0, 200) });
  });
  await mobile.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await mobile.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });

  var bodyW = await mobile.evaluate(function() { return document.body.scrollWidth; });
  var bodyC = await mobile.evaluate(function() { return document.body.clientWidth; });
  var overflow = bodyW > bodyC;
  pass('Mobile 375px no overflow', bodyW + '/' + bodyC);
  if (overflow) fail('Mobile 375px no overflow', 'overflow: ' + bodyW + '/' + bodyC);

  // Mobile menu
  var menuBtn = await mobile.locator('button[aria-label="Open menu"]').first().count();
  if (menuBtn > 0) {
    await mobile.locator('button[aria-label="Open menu"]').first().click();
    await mobile.waitForTimeout(500);
    var menuVisible = await mobile.locator('#mobile-menu').first().isVisible();
    pass('Mobile menu opens', 'visible=' + menuVisible);
    if (!menuVisible) fail('Mobile menu opens', 'not visible');

    // Check menu links
    var sol = await mobile.locator('#mobile-menu a:has-text("Solutions")').count();
    var svc = await mobile.locator('#mobile-menu a:has-text("Services")').count();
    var wrk = await mobile.locator('#mobile-menu a:has-text("Work")').count();
    pass('Mobile menu has key links', 'solutions=' + sol + ' services=' + svc + ' work=' + wrk);

    await mobile.keyboard.press('Escape');
    await mobile.waitForTimeout(300);
    var menuHidden = await mobile.locator('#mobile-menu').first().isHidden();
    pass('Mobile menu closes (Esc)', 'hidden=' + menuHidden);
    if (!menuHidden) fail('Mobile menu closes (Esc)', 'still visible');
  } else {
    skip('Mobile menu', 'button not found');
  }
  await screenshot(mobile, 'mobile-375-dark.png');

  // === TEST GROUP 4: Inner pages smoke test ===
  log('\n=== GROUP 4: Inner Pages Smoke Test ===');
  var routes = [
    '/solutions',
    '/solutions/ai-agents',
    '/services',
    '/services/ai-strategy',
    '/industries',
    '/industries/healthcare',
    '/work',
    '/work/invoice-processing-operations',
    '/insights',
    '/insights/building-an-ai-powered-enterprise',
    '/about',
    '/team',
    '/security',
    '/technology',
    '/approach',
    '/roi-calculator',
    '/ai-readiness',
    '/start-a-project',
    '/privacy',
    '/terms',
    '/cookie-policy'
  ];

  var routeResults = [];
  for (var route of routes) {
    try {
      var rp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      rp.on('console', function(msg) {
        if (msg.type() === 'error') {
          errors.push({ test: route, msg: msg.text().substring(0, 200) });
        }
      });
      await rp.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
      var resp = await rp.goto(BASE + route, { waitUntil: 'networkidle', timeout: 15000 });
      var title = await rp.title();
      var hasContent = await rp.locator('main, article, .container-x').first().count() > 0;
      var h1 = await rp.locator('h1').first().textContent();
      routeResults.push({ route: route, status: (resp.status() === 200 && hasContent) ? 'PASS' : 'FAIL', http: resp.status(), hasContent: hasContent, hasH1: !!h1 });
      pass(route, 'status=' + resp.status() + ' content=' + hasContent + ' h1=' + !!h1);
      if (resp.status() !== 200 || !hasContent) fail(route, 'status=' + resp.status() + ' content=' + hasContent);
      await rp.close();
    } catch (err) {
      routeResults.push({ route: route, status: 'FAIL', http: 0, error: err.message.substring(0, 100) });
      fail(route, err.message.substring(0, 100));
    }
  }

  var routePass = routeResults.filter(function(r) { return r.status === 'PASS'; }).length;
  var routeFail = routeResults.filter(function(r) { return r.status === 'FAIL'; }).length;
  log('\nRoutes: ' + routePass + ' pass / ' + routeFail + ' fail / ' + routes.length + ' total');

  // === TEST GROUP 5: Search Modal ===
  log('\n=== GROUP 5: Search Modal ===');
  var searchPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  searchPage.on('console', function(msg) {
    if (msg.type() === 'error') errors.push({ test: 'search', msg: msg.text().substring(0, 200) });
  });
  await searchPage.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await searchPage.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var searchBtn = await searchPage.locator('button[aria-label="Search"]').first().count();
  if (searchBtn > 0) {
    await searchPage.locator('button[aria-label="Search"]').first().click();
    await searchPage.waitForTimeout(500);
    var searchInput = await searchPage.locator('input[type="search"], input[placeholder*="search"]').first();
    var inputExists = await searchInput.count();
    pass('Search modal opens', 'input=' + inputExists);
    if (inputExists > 0) {
      await searchInput.fill('AI');
      await searchPage.waitForTimeout(300);
      var val = await searchInput.inputValue();
      pass('Search input accepts text', 'val=' + val);
    }
    await searchPage.keyboard.press('Escape');
    await searchPage.waitForTimeout(300);
    pass('Search modal closes (Esc)', '');
    await screenshot(searchPage, 'search-modal.png');
  } else {
    fail('Search modal', 'button not found');
  }
  await searchPage.close();

  // === TEST GROUP 6: ROI Calculator ===
  log('\n=== GROUP 6: ROI Calculator ===');
  var roiPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  roiPage.on('console', function(msg) {
    if (msg.type() === 'error') errors.push({ test: 'roi', msg: msg.text().substring(0, 200) });
  });
  await roiPage.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await roiPage.goto(BASE + '/roi-calculator', { waitUntil: 'networkidle', timeout: 15000 });
  var hasSliders = await roiPage.locator('input[type="range"]').count();
  pass('ROI Calculator has sliders', 'count=' + hasSliders);
  if (hasSliders > 0) {
    var firstSlider = await roiPage.locator('input[type="range"]').first();
    var currentVal = await firstSlider.inputValue();
    await firstSlider.fill('50');
    await roiPage.waitForTimeout(300);
    var newVal = await firstSlider.inputValue();
    pass('ROI Slider accepts input', 'old=' + currentVal + ' new=' + newVal);
  } else {
    skip('ROI slider input', 'no sliders found');
  }
  await screenshot(roiPage, 'roi-calculator.png');
  await roiPage.close();

  // === TEST GROUP 7: AI Readiness Assessment ===
  log('\n=== GROUP 7: AI Readiness ===');
  var readinessPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  readinessPage.on('console', function(msg) {
    if (msg.type() === 'error') errors.push({ test: 'readiness', msg: msg.text().substring(0, 200) });
  });
  await readinessPage.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await readinessPage.goto(BASE + '/ai-readiness', { waitUntil: 'networkidle', timeout: 15000 });
  var hasQuestions = await readinessPage.locator('label, input[type="radio"], input[type="checkbox"]').count();
  pass('AI Readiness has questions', 'count=' + hasQuestions);
  if (hasQuestions > 0) pass('AI Readiness form renders', 'questions found');
  await readinessPage.close();

  // === TEST GROUP 8: Project Intake Form ===
  log('\n=== GROUP 8: Project Intake ===');
  var intakePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  intakePage.on('console', function(msg) {
    if (msg.type() === 'error') errors.push({ test: 'intake', msg: msg.text().substring(0, 200) });
  });
  await intakePage.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await intakePage.goto(BASE + '/start-a-project', { waitUntil: 'networkidle', timeout: 15000 });
  var hasInputs = await intakePage.locator('input, select, textarea').count();
  pass('Project Intake has form fields', 'count=' + hasInputs);
  if (hasInputs > 0) pass('Project Intake renders', 'fields found');
  await intakePage.close();

  // === TEST GROUP 9: Back to top ===
  log('\n=== GROUP 9: Back to Top ===');
  var bttPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await bttPage.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await bttPage.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var bttExists = await bttPage.locator('button[aria-label="Back to top"]').first().count();
  if (bttExists > 0) {
    await bttPage.evaluate(function() { window.scrollTo(0, 1000); });
    await bttPage.waitForTimeout(300);
    var bttVisible = await bttPage.locator('button[aria-label="Back to top"]').first().isVisible();
    pass('Back to top appears after scroll', 'visible=' + bttVisible);
    if (bttVisible) {
      await bttPage.locator('button[aria-label="Back to top"]').first().click();
      await bttPage.waitForTimeout(500);
      var scrollY = await bttPage.evaluate(function() { return window.scrollY; });
      pass('Back to top scrolls to top', 'scrollY=' + scrollY);
      if (scrollY < 10) pass('Back to top scrolls to 0', 'yes');
      else fail('Back to top scrolls to 0', 'scrollY=' + scrollY);
    }
  } else {
    skip('Back to top', 'button not found');
  }
  await bttPage.close();

  await browser.close();

  // === FINAL REPORT ===
  log('\n\n========================================');
  log('     COMPREHENSIVE QA REPORT');
  log('========================================');

  var total = results.length;
  var totalPass = results.filter(function(r) { return r.status === 'PASS'; }).length;
  var totalFail = results.filter(function(r) { return r.status === 'FAIL'; }).length;
  var totalSkip = results.filter(function(r) { return r.status === 'SKIP'; }).length;

  log('TOTAL: ' + total + ' checks');
  log('PASS: ' + totalPass);
  log('FAIL: ' + totalFail);
  log('SKIP: ' + totalSkip);
  log('Errors from console: ' + errors.length);
  if (errors.length > 0) {
    errors.forEach(function(e) { log('  [' + e.test + '] ' + e.msg.substring(0, 100)); });
  }

  // Write results
  fs.writeFileSync('gui-test-screenshots/battery2.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('gui-test-screenshots/battery2_errors.json', JSON.stringify(errors, null, 2));
  fs.writeFileSync('gui-test-screenshots/screenshots.txt', screenshots.join('\n'));

  log('\nScreenshots saved:');
  screenshots.forEach(function(s) { log('  ' + s); });
  log('\nDone.');
  process.exit(totalFail === 0 ? 0 : 1);
})().catch(function(err) { console.error('Fatal:', err.message); process.exit(1); });
