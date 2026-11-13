// Rasterizes src/app/icon.svg into every bitmap icon surface the repo ships:
//   src/app/icon.png (512) · src/app/apple-icon.png (180)
//   public/icons/icon-192.png · public/icons/icon-512.png · src/app/favicon.ico
// Uses the repo's own Playwright Chromium (no new dependencies). The .ico is a
// minimal PNG-compressed ICO container (ICONDIR + ICONDIRENTRY + PNG bytes) so
// browsers get a real multi-size fallback without ImageMagick.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..", "..");
const svgPath = join(root, "src", "app", "icon.svg");
const svg = readFileSync(svgPath, "utf8");

const targets = [
  ["src/app/icon.png", 512],
  ["src/app/apple-icon.png", 180],
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
// White background behind the screenshot only so transparent edges (none in
// this SVG, but belt-and-braces) never become black artifacts.
await page.setContent(
  `<body style="margin:0"><div id="s" style="width:${512}px;height:${512}px">${svg.replace("<svg ", '<svg style="width:100%;height:100%;display:block" ')}</div></body>`,
);
await page.waitForTimeout(100);

async function pngAt(size) {
  const el = page.locator("#s");
  await el.evaluate((node, s) => {
    node.style.width = `${s}px`;
    node.style.height = `${s}px`;
  }, size);
  return el.screenshot({ type: "png" });
}

for (const [rel, size] of targets) {
  const png = await pngAt(size);
  writeFileSync(join(root, rel), png);
  console.log("wrote", rel, size);
}

// favicon.ico from a 32px rendering. Next.js's ICO parser requires the
// embedded PNG to be RGBA, and Playwright screenshots are RGB — so the 32px
// bitmap is rasterized through a <canvas>, whose toDataURL output is always
// RGBA. (PNG-in-ICO is supported by all evergreen browsers.)
const page2 = await browser.newPage();
const dataUrl = await page2.evaluate(async ({ svgText, size }) => {
  const blob = new Blob([svgText], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise((ok, err) => {
    img.onload = ok;
    img.onerror = err;
    img.src = url;
  });
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  return c.toDataURL("image/png");
}, { svgText: svg, size: 32 });
await page2.close();
const png32 = Buffer.from(dataUrl.split(",")[1], "base64");
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // count
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); // width
entry.writeUInt8(32, 1); // height
entry.writeUInt8(0, 2); // palette
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bpp
entry.writeUInt32LE(png32.length, 8);
entry.writeUInt32LE(22, 12); // offset = 6 + 16
writeFileSync(join(root, "src/app/favicon.ico"), Buffer.concat([header, entry, png32]));
console.log("wrote src/app/favicon.ico (32px RGBA PNG-ICO)");

await browser.close();
console.log("ICON GENERATION OK");
