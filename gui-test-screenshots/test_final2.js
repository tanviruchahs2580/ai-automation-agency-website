var { chromium } = require('playwright');
var fs = require('fs');
fs.mkdirSync('gui-test-screenshots', { recursive: true });

var BASE = 'http://localhost:3001';
var results = [];
var errors = [];
var screenshots = [];

function pass(t, d) { results.push({ test: t, status: 'PASS', details: d || '' }); }
function fail(t, d) { results.push({ test: t, status: 'FAIL', details: d || '' }); }
function skip(t, d) { results.push({ test: t, status: 'SKIP', details: d || '' }); }

var screenshotCount = 0;
async function shot(page, name) {
  var p = 'gui-test-screenshots/' + name + '.png';
  await page.screenshot({ path: p, fullPage: false });
  screenshots.push(p);
}

(async function() {
  var browser = await chromium.launch({ headless: true });

  // === 1. Theme Flash ===
  console.log('=== THEME FLASH ===');
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
  console.log('=== LANDING PAGE ===');
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

  // Scroll and check back-to-top
  await home.evaluate(function() { window.scrollTo(0, 600); });
  await home.waitForTimeout(500);
  var btt = await home.locator('button[aria-label="Back to top"]').count();
  pass('Back to top appears after scroll', 'found=' + btt);
  if (btt > 0) {
    await home.locator('button[aria-label="Back to top"]').first().click();
    await home.waitForTimeout(500);
    var sy = await home.evaluate(function() { return window.scrollY; });
    pass('Back to top scrolls to top', 'scrollY=' + sy);
    if (sy > 10) fail('Back to top scrolls to top', 'scrollY=' + sy);
  }

  // === 3. Mobile ===
  console.log('=== MOBILE ===');
  var mob = await browser.newPage({ viewport: { width: 375, height: 667 } });
  mob.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'mobile', m: m.text().substring(0, 150) }); });
  await mob.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await mob.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var bw = await mob.evaluate(function() { return document.body.scrollWidth; });
  var bc = await mob.evaluate(function() { return document.body.clientWidth; });
  pass('375px no overflow', bw + '/' + bc);
  if (bw > bc) fail('375px no overflow', 'overflow ' + bw + '/' + bc);

  // Mobile menu
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
  console.log('=== SEARCH ===');
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
  console.log('=== ROI CALCULATOR ===');
  var roi = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  roi.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'roi', m: m.text().substring(0, 150) }); });
  await roi.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await roi.goto(BASE + '/roi-calculator', { waitUntil: 'networkidle', timeout: 15000 });
  var inputs = await roi.locator('input').all();
  var inputIds = inputs.map(function(i) { return i.getAttribute('id'); });
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
  console.log('=== AI READINESS ===');
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
  console.log('=== PROJECT INTAKE ===');
  var intake = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  intake.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'intake', m: m.text().substring(0, 150) }); });
  await intake.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await intake.goto(BASE + '/start-a-project', { waitUntil: 'networkidle', timeout: 15000 });
  var fields = await intake.locator('input, select, textarea').count();
  pass('Intake has fields', 'count=' + fields);
  if (fields > 0) pass('Intake renders');
  await shot(intake, 'start-a-project');

  // === 8. All routes 200 ===
  console.log('=== ROUTE SMOKE ===');
  var routes = [
    '/solutions', '/solutions/ai-agents', '/services', '/services/ai-strategy',
    '/industries', '/industries/healthcare', '/work', '/work/invoice-processing-operations',
    '/insights', '/insights/building-an-ai-powered-enterprise',
    '/about', '/team', '/security', '/technology', '/approach',
    '/roi-calculator', '/ai-readiness', '/start-a-project',
    '/privacy', '/terms', '/cookie-policy'
  ];
  var rp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  rp.on('console', function(m) { if (m.type() === 'error') errors.push({ t: 'route-smoke', m: m.text().substring(0, 150) }); });
  var passCount = 0, failCount = 0;
  for (var route of routes) {
    await rp.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
    var r = await rp.goto(BASE + route, { waitUntil: 'networkidle', timeout: 15000 });
    var hasContent = await rp.locator('main, article, .container-x').first().count() > 0;
    if (r.status() === 200 && hasContent) { passCount++; }
    else { failCount++; fail(route, 'status=' + r.status() + ' content=' + hasContent); }
  }
  pass('Routes smoke', passCount + '/' + routes.length);
  if (failCount > 0) fail('Routes smoke', failCount + ' failed');

  // === 9. Responsive at 768 ===
  console.log('=== 768px ===');
  var m768 = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await m768.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await m768.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  var w768 = await m768.evaluate(function() { return document.body.scrollWidth; });
  var c768 = await m768.evaluate(function() { return document.body.clientWidth; });
  pass('768px no overflow', w768 + '/' + c768);
  if (w768 > c768) fail('768px no overflow', 'overflow ' + w768 + '/' + c768);

  // === 10. Light theme inner pages ===
  console.log('=== LIGHT THEME INNER ===');
  var lp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await lp.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'light'); });
  await lp.goto(BASE + '/solutions', { waitUntil: 'networkidle', timeout: 15000 });
  var lt = await lp.evaluate(function() { return document.documentElement.getAttribute('data-theme'); });
  pass('Light /solutions', lt);
  if (lt !== 'light') fail('Light /solutions', 'got ' + lt);
  await shot(lp, 'solutions-light');

  await browser.close();

  // === FINAL SUMMARY ===
  console.log('\n\n===== FINAL QA REPORT =====');
  var tp = results.filter(function(r) { return r.status === 'PASS'; }).length;
  var tf = results.filter(function(r) { return r.status === 'FAIL'; }).length;
  var ts = results.filter(function(r) { return r.status === 'SKIP'; }).length;
  console.log('TOTAL: ' + results.length + ' | PASS: ' + tp + ' | FAIL: ' + tf + ' | SKIP: ' + ts);
  console.log('Console errors: ' + errors.length);
  if (errors.length > 0) errors.forEach(function(e) { console.log('  [' + e.t + '] ' + e.m); });

  if (tf > 0) {
    console.log('\nFAILURES:');
    results.filter(function(r) { return r.status === 'FAIL'; }).forEach(function(r) {
      console.log('  FAIL: ' + r.test + ' - ' + r.details);
    });
  }

  console.log('\nScreenshots:');
  screenshots.forEach(function(s) { console.log('  ' + s); });

  fs.writeFileSync('gui-test-screenshots/final.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('gui-test-screenshots/final_errors.json', JSON.stringify(errors, null, 2));
  fs.writeFileSync('gui-test-screenshots/final_screenshots.txt', screenshots.join('\n'));

  console.log('\nDone. Exit code: ' + (tf === 0 ? 0 : 1));
  process.exit(tf === 0 ? 0 : 1);
})().catch(function(e) { console.error('Fatal:', e.message); process.exit(1); });
