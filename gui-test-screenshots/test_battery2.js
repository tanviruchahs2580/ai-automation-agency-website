var { chromium } = require('playwright');
var fs = require('fs');
fs.mkdirSync('gui-test-screenshots', { recursive: true });

async function runBattery2() {
  var browser = await chromium.launch({ headless: true });

  // === 1. Mobile menu verification ===
  console.log('=== MOBILE MENU VERIFICATION ===');
  var page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  page.on('console', function(msg) {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log('  [console ' + msg.type() + '] ' + msg.text().substring(0, 150));
    }
  });
  await page.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 15000 });

  var menuBtn = await page.locator('button[aria-label="Open menu"]').first();
  var menuExists = await menuBtn.count();
  console.log('Menu button exists: ' + menuExists);

  if (menuExists > 0) {
    await menuBtn.click();
    await page.waitForTimeout(500);

    // Check the mobile menu element specifically
    var mobileMenu = await page.locator('#mobile-menu').first();
    var menuVisible = await mobileMenu.isVisible();
    var menuText = await mobileMenu.textContent();
    console.log('Mobile menu visible: ' + menuVisible);
    console.log('Mobile menu text length: ' + menuText.length);
    console.log('Mobile menu text: ' + menuText);

    // Check for key links
    var solutionsLink = await page.locator('#mobile-menu a:has-text("Solutions")').count();
    var servicesLink = await page.locator('#mobile-menu a:has-text("Services")').count();
    var workLink = await page.locator('#mobile-menu a:has-text("Work")').count();
    var insightsLink = await page.locator('#mobile-menu a:has-text("Insights")').count();
    var startLink = await page.locator('#mobile-menu a:has-text("Start a project")').count();
    console.log('Solutions: ' + solutionsLink + ' Services: ' + servicesLink + ' Work: ' + workLink + ' Insights: ' + insightsLink + ' Start: ' + startLink);

    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    var menuClosed = await mobileMenu.isHidden();
    console.log('Menu closed after Escape: ' + menuClosed);

    await page.screenshot({ path: 'gui-test-screenshots/05-mobile-menu-open.png' });
  }

  await page.close();

  // === 2. Search modal ===
  console.log('\n=== SEARCH MODAL ===');
  var page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page2.on('console', function(msg) {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log('  [console ' + msg.type() + '] ' + msg.text().substring(0, 150));
    }
  });
  await page2.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await page2.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 15000 });

  var searchBtn = await page2.locator('button[aria-label="Search"]').first();
  var searchExists = await searchBtn.count();
  console.log('Search button exists: ' + searchExists);
  if (searchExists > 0) {
    await searchBtn.click();
    await page2.waitForTimeout(500);
    var searchVisible = await page2.locator('[role="dialog"], #search-modal, .search-modal').first().isVisible();
    console.log('Search modal visible after click: ' + searchVisible);

    // Test search input
    var searchInput = await page2.locator('input[placeholder*="Search"], input[placeholder*="search"], input[type="search"]').first();
    var inputExists = await searchInput.count();
    console.log('Search input exists: ' + inputExists);
    if (inputExists > 0) {
      await searchInput.fill('AI');
      await page2.waitForTimeout(300);
      var searchResult = await page2.locator('input[placeholder*="Search"], input[type="search"]').first().inputValue();
      console.log('Search input value: ' + searchResult);
    }

    // Close with Escape
    await page2.keyboard.press('Escape');
    await page2.waitForTimeout(300);
    console.log('Search closed');
    await page2.screenshot({ path: 'gui-test-screenshots/06-search-modal.png' });
  }

  await page2.close();

  // === 3. Inner pages smoke test ===
  console.log('\n=== INNER PAGES SMOKE TEST ===');
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
    '/start-a-project'
  ];

  var results = [];
  for (var route of routes) {
    try {
      var pageR = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      pageR.on('console', function(msg) {
        if (msg.type() === 'error') {
          console.log('  [ERROR ' + route + '] ' + msg.text().substring(0, 120));
        }
      });
      await pageR.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
      var resp = await pageR.goto('http://localhost:3001' + route, { waitUntil: 'networkidle', timeout: 15000 });
      var title = await pageR.title();
      var status = resp.status();
      var hasContent = await pageR.locator('main, article, .container-x').first().count() > 0;
      results.push({ route: route, status: status === 200 ? 'PASS' : 'FAIL', http: status, hasContent: hasContent });
      console.log('  ' + (status === 200 ? 'PASS' : 'FAIL') + ' ' + route + ' (title: ' + title.substring(0, 40) + ')');
      await pageR.close();
    } catch (err) {
      results.push({ route: route, status: 'FAIL', http: 0, hasContent: false, error: err.message });
      console.log('  FAIL ' + route + ' - ' + err.message);
    }
  }

  // Summary
  var passCount = 0;
  var failCount = 0;
  results.forEach(function(r) { if (r.status === 'PASS') passCount++; else failCount++; });
  console.log('\n=== ROUTE SMOKE SUMMARY ===');
  console.log('Passed: ' + passCount + ' / ' + routes.length);
  console.log('Failed: ' + failCount + ' / ' + routes.length);

  await pageR ? pageR.close() : null;
  await browser.close();
  console.log('Done');
}

runBattery2().then(function() { process.exit(0); }).catch(function(err) { console.error('Error:', err.message); process.exit(1); });
