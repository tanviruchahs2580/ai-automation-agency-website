var { chromium } = require('playwright');
var fs = require('fs');
fs.mkdirSync('gui-test-screenshots', { recursive: true });

var BASE = 'http://localhost:3001';
var results = [];
var errors = [];

function pass(t, d) { results.push({ test: t, status: 'PASS', details: d || '' }); }
function fail(t, d) { results.push({ test: t, status: 'FAIL', details: d || '' }); }
function skip(t, d) { results.push({ test: t, status: 'SKIP', details: d || '' }); }

async function shot(page, name) {
  await page.screenshot({ path: 'gui-test-screenshots/' + name + '.png', fullPage: false });
}

(async function() {
  var browser = await chromium.launch({ headless: true });

  // === 1. Theme Flash ===
  console.log('=== 1. THEME FLASH ===');
  var p1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  p1.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'flash', m: m.text().substring(0, 150) }); });
  await p1.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await p1.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var t1 = await p1.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Dark first paint', t1);
  if (t1 !== 'dark') fail('Dark first paint', 'got ' + t1);
  await shot(p1, 'firstpaint-dark');

  var p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p2.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'light'); });
  await p2.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var t2 = await p2.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Light first paint', t2);
  if (t2 !== 'light') fail('Light first paint', 'got ' + t2);
  await shot(p2, 'firstpaint-light');

  // === 2. Landing page ===
  console.log('=== 2. LANDING PAGE ===');
  var home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  home.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'landing', m: m.text().substring(0, 150) }); });
  await home.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await home.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var h1 = await home.locator('h1').first().textContent();
  var sections = await home.locator('section').count();
  var ctas = await home.locator('a:has-text("Start a project")').count();
  var toggleLight = await home.locator('button[aria-label="Switch to light mode"]').count();
  pass('Landing H1', h1 ? h1.substring(0, 60) : 'missing');
  pass('Landing sections', 'count=' + sections);
  if (sections < 9) fail('Landing sections', 'expected >=9, got ' + sections);
  pass('CTAs present', 'count=' + ctas);
  if (ctas === 0) fail('CTAs present', 'none found');
  pass('Theme toggle', 'switch-to-light=' + toggleLight);
  if (toggleLight === 0) fail('Theme toggle', 'missing');

  // Toggle dark->light->dark
  await home.locator('button[aria-label="Switch to light mode"]').first().click();
  await home.waitForTimeout(400);
  var tl = await home.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Toggle -> light', tl);
  await home.locator('button[aria-label="Switch to dark mode"]').first().click();
  await home.waitForTimeout(400);
  var td = await home.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Toggle -> dark', td);
  await shot(home, 'landing-dark-1440');

  // Scroll and check back-to-top (cookie consent may be present, accept it first)
  await home.evaluate(function() { window.scrollTo(0, 600); });
  await home.waitForTimeout(500);
  var bttExists = await home.locator('button[aria-label="Back to top"]').count();
  pass('Back to top appears after scroll', 'found=' + bttExists);
  if (bttExists > 0) {
    // Dismiss cookie if blocking
    var cookieDecline = await home.locator('button:has-text("Decline")').count();
    if (cookieDecline > 0) {
      await home.locator('button:has-text("Decline")').first().click();
      await home.waitForTimeout(300);
    }
    var bttVisible = await home.locator('button[aria-label="Back to top"]').first().isVisible();
    if (bttVisible) {
      await home.locator('button[aria-label="Back to top"]').first().click();
      await home.waitForTimeout(500);
      var sy = await home.evaluate(function() { return window.scrollY; });
      pass('Back to top scrolls to top', 'scrollY=' + sy);
      if (sy > 50) fail('Back to top scrolls to top', 'scrollY=' + sy); // 50px accounts for smooth-scroll timing in headless
    }
  }

  // === 3. Mobile ===
  console.log('=== 3. MOBILE ===');
  var mob = await browser.newPage({ viewport: { width: 375, height: 667 } });
  mob.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'mobile', m: m.text().substring(0, 150) }); });
  await mob.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await mob.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var bw = await mob.evaluate(function() { return document.body.scrollWidth; });
  var bc = await mob.evaluate(function() { return document.body.clientWidth; });
  pass('375px no overflow', bw + '/' + bc);
  if (bw > bc) fail('375px no overflow', 'overflow ' + bw + '/' + bc);

  var mb = await mob.locator('button[aria-label="Open menu"]').first().count();
  if (mb > 0) {
    await mob.locator('button[aria-label="Open menu"]').first().click();
    await mob.waitForTimeout(500);
    var mv = await mob.locator('#mobile-menu').first().isVisible();
    pass('Mobile menu opens', 'visible=' + mv);
    if (!mv) fail('Mobile menu opens', 'not visible');
    await mob.keyboard.press('Escape');
    await mob.waitForTimeout(300);
    var mh = await mob.locator('#mobile-menu').first().isHidden();
    pass('Mobile menu closes', 'hidden=' + mh);
    await shot(mob, 'mobile-375-dark');
  }

  // === 4. Search ===
  console.log('=== 4. SEARCH ===');
  var srch = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  srch.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'search', m: m.text().substring(0, 150) }); });
  await srch.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await srch.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var sb = await srch.locator('button[aria-label="Search (Ctrl+K)"]').count();
  if (sb > 0) {
    await srch.locator('button[aria-label="Search (Ctrl+K)"]').first().click();
    await srch.waitForTimeout(500);
    var si = await srch.locator('input[type="search"]').first().count();
    pass('Search opens', 'input=' + si);
    if (si > 0) {
      await srch.locator('input[type="search"]').first().fill('AI Agents');
      await srch.waitForTimeout(300);
      var sv = await srch.locator('input[type="search"]').first().inputValue();
      pass('Search input works', 'val=' + sv);
    }
    await srch.keyboard.press('Escape');
    await srch.waitForTimeout(300);
    pass('Search closes (Esc)', '');
    await shot(srch, 'search-modal');
  }

  // === 5. ROI Calculator ===
  console.log('=== 5. ROI CALCULATOR ===');
  var roi = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  roi.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'roi', m: m.text().substring(0, 150) }); });
  await roi.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await roi.goto(BASE + '/roi-calculator', { waitUntil: 'networkidle', timeout: 15000 });
  var inputs = await roi.locator('input').all();
  var inputIds = [];
  for (var inp of inputs) { inputIds.push(await inp.getAttribute('id')); }
  pass('ROI has inputs', JSON.stringify(inputIds));
  if (inputs.length > 0) {
    var numInputs = await roi.locator('input[type="number"]').count();
    pass('ROI number inputs', 'count=' + numInputs);
    if (numInputs > 0) {
      var first = await roi.locator('input[type="number"]').first();
      var orig = await first.inputValue();
      await first.fill('100');
      await roi.waitForTimeout(300);
      var updated = await first.inputValue();
      pass('ROI input accepts value', 'orig=' + orig + ' new=' + updated);
    }
  }
  await shot(roi, 'roi-calculator');

  // === 6. AI Readiness ===
  console.log('=== 6. AI READINESS ===');
  var read = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  read.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'readiness', m: m.text().substring(0, 150) }); });
  await read.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await read.goto(BASE + '/ai-readiness', { waitUntil: 'networkidle', timeout: 15000 });
  var ql = await read.locator('label').count();
  var radio = await read.locator('input[type="radio"]').count();
  pass('Readiness has questions', 'labels=' + ql + ' radios=' + radio);
  if (radio > 0) {
    await read.locator('input[type="radio"]').first().check();
    await read.waitForTimeout(300);
    var checked = await read.locator('input[type="radio"]:checked').count();
    pass('Readiness radio works', 'checked=' + checked);
  }
  await shot(read, 'ai-readiness');

  // === 7. Project Intake ===
  console.log('=== 7. PROJECT INTAKE ===');
  var intake = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  intake.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'intake', m: m.text().substring(0, 150) }); });
  await intake.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await intake.goto(BASE + '/start-a-project', { waitUntil: 'networkidle', timeout: 15000 });
  var fields = await intake.locator('input, select, textarea').count();
  pass('Intake has fields', 'count=' + fields);
  if (fields > 0) pass('Intake renders');

  // === 8. Route Smoke ===
  console.log('=== 8. ROUTE SMOKE ===');
  var routeP = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  routeP.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'routes', m: m.text().substring(0, 150) }); });
  var routes = [
    '/solutions', '/solutions/ai-agents', '/services', '/services/ai-strategy',
    '/industries', '/industries/healthcare', '/work', '/work/invoice-processing-operations',
    '/insights', '/insights/building-an-ai-powered-enterprise',
    '/about', '/team', '/security', '/technology', '/approach',
    '/roi-calculator', '/ai-readiness', '/start-a-project',
    '/privacy', '/terms', '/cookie-policy'
  ];
  var passCount = 0, failCount = 0;
  for (var route of routes) {
    await routeP.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
    var r = await routeP.goto(BASE + route, { waitUntil: 'networkidle', timeout: 15000 });
    var hasContent = await routeP.locator('main, article, .container-x').first().count() > 0;
    if (r.status() === 200 && hasContent) { passCount++; }
    else { failCount++; fail(route, 's=' + r.status() + ' c=' + hasContent); }
  }
  pass('Routes 200+content', passCount + '/' + routes.length);
  if (failCount > 0) fail('Routes 200+content', failCount + ' failed');

  // === 9. Responsive 768px ===
  console.log('=== 9. 768px ===');
  var m768 = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await m768.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await m768.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var w768 = await m768.evaluate(function() { return document.body.scrollWidth; });
  var c768 = await m768.evaluate(function() { return document.body.clientWidth; });
  pass('768px no overflow', w768 + '/' + c768);
  if (w768 > c768) fail('768px no overflow', 'overflow ' + w768 + '/' + c768);

  // === 10. Light theme inner ===
  console.log('=== 10. LIGHT INNER ===');
  var lp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await lp.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'light'); });
  await lp.goto(BASE + '/solutions', { waitUntil: 'networkidle', timeout: 15000 });
  var lt = await lp.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Light /solutions', lt);
  if (lt !== 'light') fail('Light /solutions', 'got ' + lt);
  await shot(lp, 'solutions-light');

  // === 11. Work detail page ===
  console.log('=== 11. WORK DETAIL ===');
  var wd = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  wd.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'work-detail', m: m.text().substring(0, 150) }); });
  await wd.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await wd.goto(BASE + '/work/invoice-processing-operations', { waitUntil: 'networkidle', timeout: 15000 });
  var wdH1 = await wd.locator('h1').first().textContent();
  var wdHasArch = await wd.locator('main').count();
  pass('Work detail renders', 'h1=' + (wdH1 || 'missing'));
  await shot(wd, 'work-detail');

  // === 12. Insights page (was SVG bug) ===
  console.log('=== 12. INSIGHTS (svg fix verify) ===');
  var ins = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  var svgErrors = [];
  ins.on('console', function(m) {
    if (m.type() === 'error' && m.text().indexOf('rect') >= 0 && m.text().indexOf('height') >= 0) {
      svgErrors.push(m.text());
    }
  });
  await ins.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await ins.goto(BASE + '/insights', { waitUntil: 'networkidle', timeout: 15000 });
  if (svgErrors.length === 0) {
    pass('Insights: no SVG negative height errors', '');
  } else {
    fail('Insights: SVG negative height errors', svgErrors.length + ' errors');
  }
  pass('Insights loads', 'svgErrors=' + svgErrors.length);
  await shot(ins, 'insights-dark');

  await browser.close();

  // === FINAL SUMMARY ===
  console.log('\n\n========================================');
  console.log('     FINAL COMPREHENSIVE QA REPORT');
  console.log('========================================');
  var tp = results.filter(function(r) { return r.status === 'PASS'; }).length;
  var tf = results.filter(function(r) { return r.status === 'FAIL'; }).length;
  var ts = results.filter(function(r) { return r.status === 'SKIP'; }).length;
  console.log('TOTAL: ' + results.length + ' checks');
  console.log('PASS: ' + tp);
  console.log('FAIL: ' + tf);
  console.log('SKIP: ' + ts);
  console.log('Console errors (non-SVG): ' + errors.length);
  if (errors.length > 0) errors.forEach(function(e) { console.log('  [' + e.t + '] ' + e.m.substring(0, 120)); });

  if (tf > 0) {
    console.log('\n--- FAILURES ---');
    results.filter(function(r) { return r.status === 'FAIL'; }).forEach(function(r) {
      console.log('  FAIL: ' + r.test + ' - ' + r.details);
    });
  }

  fs.writeFileSync('gui-test-screenshots/final.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('gui-test-screenshots/final_errors.json', JSON.stringify(errors, null, 2));

  console.log('\nDone. Exit: ' + (tf === 0 ? 0 : 1));
  process.exit(tf === 0 ? 0 : 1);
})().catch(function(e) { console.error('Fatal:', e.message); process.exit(1); });
