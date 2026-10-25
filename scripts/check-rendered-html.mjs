#!/usr/bin/env node
/**
 * Rendered-output invariants.
 *
 * Unit tests run against source; this gate runs against what the server
 * actually produced in `.next/server/app`, which is where the audit's most
 * serious defects lived — every one of them was invisible in source review and
 * obvious in the built HTML:
 *
 *  - `og:image` was missing on 51 of 52 routes, because Next.js *replaces* the
 *    accumulated `openGraph` object at each metadata level instead of
 *    deep-merging it, so the root `opengraph-image` file convention was
 *    discarded by every page that set its own `openGraph` (which all of them
 *    must, to set `og:url`).
 *  - The primary conversion form server-rendered as `style="opacity:0"`, so the
 *    page looked empty until hydration and stayed empty without JavaScript.
 *  - `GridLines` emitted two identical `id="vantiq-grid"` blocks per page,
 *    because it renders twice on most pages.
 *  - The route-transition fade started at `opacity: 0` on first load.
 *
 * Each of those is asserted below, so a regression fails the build rather than
 * shipping. Run after `next build`.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const appDir = path.join(root, ".next", "server", "app");

const problems = [];
const notes = [];

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...walk(full));
    else if (entry.endsWith(".html")) found.push(full);
  }
  return found;
}

let htmlFiles;
try {
  htmlFiles = walk(appDir);
} catch {
  console.error(
    `\n✗ Could not read ${path.relative(root, appDir)}.\n` +
      `  Run \`npm run build\` first — these checks inspect the build output.\n`,
  );
  process.exit(1);
}

if (htmlFiles.length === 0) {
  console.error("\n✗ No prerendered HTML found to check.\n");
  process.exit(1);
}

/**
 * Documents exempt from page-metadata checks.
 *
 * `_global-error` replaces the root layout, so it has no page metadata to check.
 * `_not-found` correctly carries `robots: noindex` and deliberately has no
 * canonical: a 404 is not a page identity, and advertising one would invite
 * search engines to index an error surface.
 *
 * This is a skip list, not an enforced allow-list — `EXEMPT_FROM_METADATA.size`
 * is asserted below so growth is at least visible in review, but nothing stops
 * a new entry being added here. If metadata coverage matters for a new route,
 * check that the exemption is still only these two.
 */
const EXEMPT_FROM_METADATA = new Set(["_global-error.html", "_not-found.html"]);

for (const file of htmlFiles) {
  const name = path.basename(file);
  const html = readFileSync(file, "utf8");
  const where = path.relative(appDir, file).replace(/\\/g, "/");
  const isImageRoute = where.includes("opengraph-image");

  if (isImageRoute) continue;

  if (!EXEMPT_FROM_METADATA.has(name)) {
    if (!/property="og:image"/.test(html)) {
      problems.push(`${where}: no og:image`);
    }
    if (!/name="twitter:image"/.test(html)) {
      problems.push(`${where}: no twitter:image`);
    }
    if (!/rel="canonical"/.test(html)) {
      problems.push(`${where}: no canonical`);
    }
    if (!/rel="alternate"\s+type="application\/rss\+xml"|type="application\/rss\+xml"/.test(html)) {
      problems.push(`${where}: no RSS autodiscovery link`);
    }
  }

  /*
    Server-rendered hidden content. `opacity:0` in the prerendered HTML means
    the element is invisible until client JavaScript runs — a blank page with JS
    blocked or slow. Animation must start from `initial={false}` on first
    render (see components/motion/useMotionGate.ts).
  */
  const hiddenStyle = /style="[^"]*opacity:\s*0(?![.\d])[^"]*"/g;
  const hidden = [...html.matchAll(hiddenStyle)].map((m) => m[0]);
  if (hidden.length > 0) {
    problems.push(
      `${where}: ${hidden.length} element(s) server-rendered invisible (${hidden[0]})`,
    );
  }

  if (/class="route-fade"/.test(html)) {
    problems.push(`${where}: route-fade applied on first paint`);
  }

  /*
    Content deferred behind JavaScript.

    A `loading.tsx` anywhere in the segment tree makes Next emit the page as a
    Suspense *fallback* plus the real content inside an inert `<template id="B:…">`,
    which an inline `$RC(...)` call swaps in. The content is present in the file,
    so every metadata check passes — but a visitor without JavaScript, or one
    whose bundle never arrives, sees a loading skeleton permanently. The
    signature is a boundary template that precedes the page's own `<h1>`.

    This is what `app/loading.tsx` was doing to all 51 routes before it was
    removed. `_not-found` is the only document with no `<h1>` to compare against,
    so it is the only one this particular check cannot speak to — and the
    `hidden id="S:n"` check below covers it instead.
  */
  const boundary = html.indexOf('<template id="B:');
  const heading = html.indexOf("<h1");
  if (boundary !== -1 && heading !== -1 && heading > boundary) {
    problems.push(
      `${where}: page content deferred behind a Suspense fallback (template at ${boundary}, h1 at ${heading})`,
    );
  }
  if (/aria-busy="true"/.test(html) && /template id="B:/.test(html)) {
    problems.push(`${where}: loading skeleton shipped in the prerendered document`);
  }
  /*
    A `next/dynamic` import with a `loading` option — or any explicit Suspense
    boundary that does not resolve during prerender — serializes its subtree into
    `<div hidden id="S:n">`, revealed only by the inline `$RC(...)` call. Same
    consequence as the boundary template above: present in the file, invisible to
    a visitor without JavaScript. This check caught the architecture scene on `/`
    and `/technology`, which the boundary-template check above did not because
    its template is empty and the `h1` sorts before it.
  */
  if (/<div hidden id="S:\d+"/.test(html)) {
    problems.push(
      `${where}: content serialized into a hidden Suspense container (hidden id="S:n")`,
    );
  }

  /* Duplicate element ids — invalid HTML, and `url(#id)` resolves to the first. */
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) {
    problems.push(
      `${where}: duplicate id(s) ${[...new Set(duplicates)].join(", ")}`,
    );
  }
}

/*
  The exemption list is a skip list, so growth is silent unless something states
  otherwise. This makes adding to it a deliberate act: a new entry fails the gate
  with an instruction to justify it, which is the point — an exemption added to
  silence a real finding is indistinguishable from a fix in a summary table.
*/
const EXPECTED_EXEMPTIONS = 2;
if (EXEMPT_FROM_METADATA.size !== EXPECTED_EXEMPTIONS) {
  problems.push(
    `metadata check exemptions changed (${EXEMPT_FROM_METADATA.size}, expected ${EXPECTED_EXEMPTIONS}): ` +
      `${[...EXEMPT_FROM_METADATA].join(", ")}. Confirm the new entry genuinely has no page ` +
      `metadata to check, then update EXPECTED_EXEMPTIONS.`,
  );
}

/* A canonical pointing at localhost outside the default port is a real bug. */
const localhostCanonicals = htmlFiles.filter((file) =>
  /rel="canonical" href="http:\/\/localhost:3000/.test(readFileSync(file, "utf8")),
);
if (localhostCanonicals.length > 0) {
  notes.push(
    `${localhostCanonicals.length} route(s) canonicalise to http://localhost:3000. ` +
      `Correct for a local build; set NEXT_PUBLIC_SITE_URL before deploying.`,
  );
}

console.log(`\nRendered-output invariants (${htmlFiles.length} documents)`);
console.log("─".repeat(58));
for (const note of notes) console.log(`  note  ${note}`);

if (problems.length > 0) {
  for (const problem of problems.slice(0, 25)) console.log(`  ✗     ${problem}`);
  if (problems.length > 25) console.log(`  …     ${problems.length - 25} more`);
  console.error(
    `\n✗ ${problems.length} rendered-output violation(s).\n`,
  );
  process.exit(1);
}

console.log("  ✓     og:image, twitter:image, canonical and RSS on every indexable route");
console.log("  ✓     no server-rendered hidden content");
console.log("  ✓     no duplicate element ids");
console.log("  ✓     no first-paint route fade\n");
