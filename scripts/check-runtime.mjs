/**
 * Runtime preflight for the install-script policy.
 *
 * `.npmrc` sets `strict-allow-scripts=true`, which npm only enforces from 11.x
 * on; Node 22's bundled npm 10.9.9 ignores the setting silently, and the
 * `allowScripts` block in package.json then degrades from a gate back to a
 * comment. The floors are declared in package.json `engines` — which npm only
 * warns about by default — and asserted exactly in CI before `npm ci`; this
 * script makes the same assertion the local gate (`npm run verify`) so a
 * machine that cannot enforce the policy fails loudly instead of silently.
 *
 * The deploy platform is deliberately not required to satisfy the npm floor
 * (see .npmrc): it re-installs the exact lockfile CI already approved, so a
 * hard npm check there would break deploys without adding control.
 */
import { spawnSync } from "node:child_process";

const MIN_NODE = [22, 9, 0];
const MIN_NPM = [11, 17, 0];

function parseVersion(value) {
  const parts = String(value)
    .trim()
    .split(".")
    .map((part) => Number.parseInt(part, 10));
  return parts.length > 0 && parts.every(Number.isFinite) ? parts : null;
}

function atLeast(actual, floor) {
  const width = Math.max(actual.length, floor.length);
  for (let i = 0; i < width; i += 1) {
    const a = actual[i] ?? 0;
    const b = floor[i] ?? 0;
    if (a !== b) return a > b;
  }
  return true;
}

function npmVersion() {
  // npm sets npm_config_user_agent for every lifecycle script it runs, which
  // covers `npm run check:runtime` and `npm run verify`; a direct `node`
  // invocation falls back to asking npm itself.
  const fromAgent = process.env.npm_config_user_agent?.match(/npm\/(\d+\.\d+\.\d+)/)?.[1];
  if (fromAgent) return fromAgent;
  const spawned = spawnSync("npm", ["--version"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return spawned.status === 0 ? spawned.stdout.trim() : null;
}

const failures = [];

const node = parseVersion(process.versions.node);
if (!node) {
  failures.push(`unparseable node version "${process.versions.node}"`);
} else if (!atLeast(node, MIN_NODE)) {
  failures.push(
    `node ${process.versions.node} < ${MIN_NODE.join(".")} — npm 11.x (which enforces ` +
      `strict-allow-scripts) requires node >= ${MIN_NODE.join(".")}`,
  );
}

const npmRaw = npmVersion();
const npm = npmRaw ? parseVersion(npmRaw) : null;
if (!npm) {
  failures.push("could not determine the npm version running this gate");
} else if (!atLeast(npm, MIN_NPM)) {
  failures.push(
    `npm ${npmRaw} < ${MIN_NPM.join(".")} — strict-allow-scripts is not enforced before ` +
      `npm ${MIN_NPM.join(".")}; upgrade npm (CI pins npm@${MIN_NPM.join(".")})`,
  );
}

if (failures.length > 0) {
  console.error(
    `\n[check:runtime] toolchain cannot enforce the install-script policy:\n` +
      failures.map((line) => `  - ${line}`).join("\n") +
      "\n",
  );
  process.exit(1);
}

console.log(
  `[check:runtime] node ${process.versions.node} >= ${MIN_NODE.join(".")}, ` +
    `npm ${npmRaw} >= ${MIN_NPM.join(".")} — install-script policy enforceable`,
);
