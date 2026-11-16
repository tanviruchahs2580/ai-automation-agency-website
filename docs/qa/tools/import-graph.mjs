/**
 * Dead-code detector: builds the `@/` import graph from every module under
 * `src/`, walks it from the App Router entry points, and prints modules that no
 * route can reach.
 *
 * Read-only. Run from the repository root: `node docs/qa/tools/import-graph.mjs`.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const srcDir = join(root, "src");

const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mjs)$/.test(entry)) files.push(p);
  }
}
walk(srcDir);

const toRel = (p) => relative(srcDir, p).split("\\").join("/");
const known = new Set(files.map(toRel));
const EXTENSIONS = ["", ".tsx", ".ts", "/index.tsx", "/index.ts"];

const deps = new Map();
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const out = new Set();
  for (const match of text.matchAll(/from\s+"@\/([^"]+)"/g)) {
    for (const ext of EXTENSIONS) {
      if (known.has(match[1] + ext)) {
        out.add(match[1] + ext);
        break;
      }
    }
  }
  deps.set(toRel(file), out);
}

const entries = [...deps.keys()].filter((k) => k.startsWith("app/"));
const reachable = new Set();
const stack = [...entries];
while (stack.length > 0) {
  const current = stack.pop();
  if (reachable.has(current)) continue;
  reachable.add(current);
  for (const next of deps.get(current) ?? []) stack.push(next);
}

const unreachable = [...deps.keys()]
  .filter((k) => !reachable.has(k) && !k.includes("__tests__"))
  .sort();

console.log(`src modules: ${deps.size} | reachable from src/app: ${reachable.size}`);
console.log("\nUnreachable from src/app (candidate dead code):");
if (unreachable.length === 0) console.log("  (none)");
for (const file of unreachable) console.log("  " + file);
