const { chromium } = require('playwright');
const fs = require('fs');
fs.mkdirSync('gui-test-screenshots', { recursive: true });

async function main() {
  var browser = await chromium.launch({ headless: true });

  // Check CSS loading
  var page0 = await browser.newPage({ viewport: { width: 375, height: 667 } });
  page0.on('console', function(msg) {
    if (msg.type() === 'error') {
      console.log('[ERROR] ' + msg.text().substring(0, 200));
    }
  });
  await page0.context().addInitScript(function() { localStorage.setItem('vantiq-theme', 'dark'); });
  await page0.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });

  // Check if CSS is applied
  var bodyOverflowX = await page0.evaluate(function() {
    return window.getComputedStyle(document.body).overflowX;
  });
  console.log('Body overflowX: ' + bodyOverflowX);

  // Check computed widths
  var bodyScrollWidth = await page0.evaluate(function() { return document.body.scrollWidth; });
  var bodyClientWidth = await page0.evaluate(function() { return document.body.clientWidth; });
  var htmlScrollWidth = await page0.evaluate(function() { return document.documentElement.scrollWidth; });
  var htmlClientWidth = await page0.evaluate(function() { return document.documentElement.clientWidth; });
  var vpWidth = await page0.evaluate(function() { return window.innerWidth; });
  console.log('body.scrollWidth=' + bodyScrollWidth + ' clientWidth=' + bodyClientWidth);
  console.log('html.scrollWidth=' + htmlScrollWidth + ' clientWidth=' + htmlClientWidth);
  console.log('viewport=' + vpWidth);

  // Check if the mobile menu is a fixed overlay
  var mobileMenuOpen = await page0.locator('button[aria-label="Open menu"]').first().count();
  if (mobileMenuOpen > 0) {
    await page0.locator('button[aria-label="Open menu"]').first().click();
    await page0.waitForTimeout(500);

    // Check the menu's actual dimensions
    var menuEl = await page0.locator('nav').first().elementHandle();
    if (menuEl) {
      var box = await menuEl.boundingBox();
      if (box) {
        console.log('Nav bounding box: x=' + box.x + ' y=' + box.y + ' w=' + box.width + ' h=' + box.height);
      }
    }

    // Check for any overflowing elements
    var overflowEls = await page0.evaluate(function() {
      var els = document.querySelectorAll('*');
      var overflowers = [];
      for (var i = 0; i < els.length && i < 50; i++) {
        var el = els[i];
        if (el.scrollWidth > el.clientWidth + 1) {
          overflowers.push({
            tag: el.tagName,
            text: (el.textContent || '').substring(0, 50),
            scrollW: el.scrollWidth,
            clientW: el.clientWidth
          });
        }
      }
      return overflowers;
    });
    console.log('Overflowing elements: ' + JSON.stringify(overflowEls));
  }

  // Also check CSS request status
  var cssLoaded = await page0.evaluate(function() {
    var stylesheets = document.styleSheets;
    var result = [];
    for (var i = 0; i < stylesheets.length; i++) {
      var ss = stylesheets[i];
      result.push({ href: (ss.href || '').substring(0, 100), ownerCount: ss.cssRules ? ss.cssRules.length : 0 });
    }
    return result;
  });
  console.log('Stylesheets loaded: ' + JSON.stringify(cssLoaded));

  await page0.screenshot({ path: 'gui-test-screenshots/04-overflow-debug.png' });
  await browser.close();
  console.log('Done');
}

main().catch(function(err) { console.error('Error:', err.message); });
