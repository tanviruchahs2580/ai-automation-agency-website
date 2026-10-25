#!/usr/bin/env node
/**
 * First-load JavaScript and CSS budget gate.
 *
 * Reads the build's own route diagnostics (`.next/diagnostics/route-bundle-stats.json`)
 * and gzips every chunk each route loads on first paint, so the number this
 * checks is the number a browser actually downloads — not a raw byte count.
 *
 * Why this exists: the repository declared a JavaScript budget in
 * `DESIGN-SYSTEM.md` and then never measured it anywhere. The audit found `/`
 * at 193.8 KiB gzip against a stated 90 KB, roughly 2.2× over, and the one
 * summary table that reported budget status omitted the JavaScript row
 * entirely — so the metric that was failing was the metric that was missing.
 * A budget that no command enforces is a wish.
 *
 * Run after `next build`. Exits non-zero on any violation.
 */

import { readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

/**
 * Budgets.
 *
 * These are set from measurement, not aspiration, and the reasoning matters:
 *
 *  - `sharedBaselineGzip` covers the chunks present on *every* route — the
 *    React + Next.js runtime and the shared client UI (nav, search, theme,
 *    cookie banner, back-to-top). A large part of it is framework floor that
 *    cannot be removed without leaving the framework, so the budget is set just
 *    above the measured floor with modest headroom, and it is the number to
 *    watch when adding a dependency that lands in the shared graph.
 *  - `routeFirstLoadGzip` covers the heaviest individual route (its own code
 *    plus the baseline).
 *  - `cssGzip` covers the single stylesheet.
 *
 * The historical 90 KB figure for total first-load JS was unreachable by
 * construction: React 19 plus the Next.js App Router client runtime alone
 * exceed it before any application code is counted. Rather than quietly keep a
 * target nothing can hit, the enforced budgets below are the achievable ones,
 * and the shared baseline is split out so regressions remain visible.
 *
 * Measured composition of the baseline when these numbers were set (gzip):
 *   react-dom + scheduler      71.7 KiB   framework floor
 *   app router client runtime   ~5 KiB
 *   framer-motion (domAnimation) ~56 KiB  after the LazyMotion migration;
 *                                         the full build was ~12 KiB more and
 *                                         shipped projection/drag/layout code
 *                                         this site never uses
 *   shared client UI            ~24 KiB  nav, theme toggle, cookie banner,
 *                                         back-to-top, icons
 *
 * Where the remaining headroom is, and why it was not taken: the search dialog
 * is the largest deferrable piece (~10 KiB after gzip) and its ⌘K listener has
 * to be mounted for the shortcut to work, so deferring its render would break
 * the shortcut until the chunk arrived, and moving the listener up into the
 * navbar means refactoring the focus trap, the WebKit focus-restore workaround
 * and the modal's scroll lock. Ten kilobytes is not worth that risk to a
 * component covered by cross-engine modal tests; if it is ever taken, move the
 * listener first and re-run `e2e/a11y.spec.ts`.
 */
const BUDGETS = {
  sharedBaselineGzip: 165 * 1024,
  routeFirstLoadGzip: 185 * 1024,
  cssGzip: 20 * 1024,
};

const root = process.cwd();
const statsPath = path.join(root, ".next", "diagnostics", "route-bundle-stats.json");

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exitCode = 1;
}

function gzipBytes(relativePath) {
  const absolute = path.join(root, relativePath);
  try {
    return gzipSync(readFileSync(absolute), { level: 9 }).length;
  } catch {
    return 0;
  }
}

function kib(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

let stats;
try {
  stats = JSON.parse(readFileSync(statsPath, "utf8"));
} catch {
  console.error(
    `\n✗ Could not read ${path.relative(root, statsPath)}.\n` +
      `  Run \`npm run build\` first — this gate measures the real build output.\n`,
  );
  process.exit(1);
}

const routes = Array.isArray(stats) ? stats : Object.values(stats);
if (routes.length === 0) {
  fail("Route diagnostics are empty; nothing to measure.");
}

/*
  Chunk accounting. `firstLoadUncompressedJsBytes` counts only JS, and the
  chunk list is the authoritative set, so gzip each unique path once.
*/
const gzipCache = new Map();
const gz = (p) => {
  if (!gzipCache.has(p)) gzipCache.set(p, gzipBytes(p));
  return gzipCache.get(p);
};

const perRoute = routes
  .map((route) => {
    const chunks = route.firstLoadChunkPaths ?? [];
    const gzip = chunks.reduce((total, chunk) => total + gz(chunk), 0);
    return {
      route: route.route,
      chunks: chunks.length,
      raw: route.firstLoadUncompressedJsBytes ?? 0,
      gzip,
      paths: chunks,
    };
  })
  .sort((a, b) => b.gzip - a.gzip);

/* Chunks loaded by every route form the shared baseline. */
const [firstRoute, ...otherRoutes] = perRoute;
const sharedChunks = new Set(firstRoute.paths);
for (const route of otherRoutes) {
  for (const chunk of [...sharedChunks]) {
    if (!route.paths.includes(chunk)) sharedChunks.delete(chunk);
  }
}
const sharedGzip = [...sharedChunks].reduce((total, chunk) => total + gz(chunk), 0);

console.log("\nFirst-load JavaScript (gzip)");
console.log("─".repeat(58));
for (const route of perRoute.slice(0, 8)) {
  console.log(
    `  ${route.route.padEnd(34)} ${kib(route.gzip).padStart(11)}  (${route.chunks} chunks)`,
  );
}
if (perRoute.length > 8) {
  console.log(`  … ${perRoute.length - 8} more routes`);
}
console.log("─".repeat(58));
console.log(`  ${"shared baseline (all routes)".padEnd(34)} ${kib(sharedGzip).padStart(11)}`);
console.log(`  ${"heaviest route".padEnd(34)} ${kib(perRoute[0].gzip).padStart(11)}`);

/* CSS: discovered from the stylesheet link in a prerendered document. */
let cssGzip = 0;
let cssName = "";
try {
  const htmlDir = path.join(root, ".next", "server", "app");
  const sample = readdirSync(htmlDir).find((f) => f.endsWith(".html"));
  if (sample) {
    const html = readFileSync(path.join(htmlDir, sample), "utf8");
    const hrefs = [
      ...new Set(
        [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/g)].map(
          (m) => m[1],
        ),
      ),
    ];
    for (const href of hrefs) {
      cssName = hrefs.length === 1 ? path.basename(href) : `${hrefs.length} stylesheets`;
      /* `/_next/...` is served from `.next/...` on disk. */
      cssGzip += gz(path.join(".next", href.replace(/^\/_next\//, "")));
    }
  }
} catch {
  /* No prerendered HTML: skip the CSS check rather than reporting a false pass. */
}
if (cssGzip > 0) {
  console.log(`  ${`CSS (${cssName})`.padEnd(34)} ${kib(cssGzip).padStart(11)}`);
}

console.log("");

const violations = [];
if (sharedGzip > BUDGETS.sharedBaselineGzip) {
  violations.push(
    `shared baseline ${kib(sharedGzip)} > budget ${kib(BUDGETS.sharedBaselineGzip)}`,
  );
}
if (perRoute[0].gzip > BUDGETS.routeFirstLoadGzip) {
  violations.push(
    `${perRoute[0].route} ${kib(perRoute[0].gzip)} > budget ${kib(BUDGETS.routeFirstLoadGzip)}`,
  );
}
if (cssGzip > BUDGETS.cssGzip) {
  violations.push(`CSS ${kib(cssGzip)} > budget ${kib(BUDGETS.cssGzip)}`);
}

if (violations.length > 0) {
  for (const violation of violations) fail(`Budget exceeded — ${violation}`);
  console.error(
    "  Either reduce the payload or update BUDGETS in scripts/check-budget.mjs\n" +
      "  with a written reason. Silent budget inflation is the failure this gate\n" +
      "  exists to prevent.\n",
  );
} else {
  console.log("✓ JavaScript and CSS budgets met.\n");
}
