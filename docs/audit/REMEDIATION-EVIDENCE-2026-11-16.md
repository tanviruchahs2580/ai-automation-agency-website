# Remediation evidence — current-condition audit 2026-11-15

- Date: 2026-11-16
- Commit: working tree, uncommitted, branch `feat/enterprise-audit-remediation` (base `f0d3b3b`)
- Machine / OS: Windows 11 (10.0.26300), Git Bash, Node v24.19.0, npm 11.17.0
- Scope: closure evidence for every finding in `docs/audit/CURRENT-CONDITION-AUDIT-2026-11-15.md`
  plus the two low-severity findings from the 2026-11-16 re-review of the supply-chain changes.
  Does **not** cover: real email delivery (untestable by design), Vercel-edge behaviour,
  CSP enforcement (owner deployment decision), legal review.

## Result

All audit findings (P1-1, P1-2, P2-1 … P2-6, INFO 1–8) and both re-review findings are
remediated on this branch. The full gate set is green on the final tree, including a clean
`npm ci` under the enforcing npm with `strict-allow-scripts` active. Two honest caveats are
recorded below rather than smoothed over: a Firefox navigation-timeout flake class on this
Windows machine (varying routes, always passing on retry, uncorrelated with the diff), and
7 moderate advisories confined to the dev-only lint chain whose remaining fix requires a
semver-major toolchain bump.

## Commands and results

| # | Command | Result |
|---|---|---|
| 1 | `npm run verify` (now begins with `check:runtime`) | pass — exit 0: runtime gate ok; lint clean; typecheck clean; **Vitest 20 files / 214 tests passed**; build **98/98** static pages; rendered invariants pass; budgets **158.4 / 176.7 / 12.2 KiB** met |
| 2 | `npm ci` (clean install from lockfile, npm 11.17.0, `strict-allow-scripts=true` active) | pass — exit 0. First attempt failed `EPERM unlink …next-swc.win32-x64-msvc.node` because the stale port-3117 server held the SWC binary; server stopped (specific PID), retry clean. Node 22 evidence comes from the PR's CI run (both jobs pin npm 11.17.0 before `npm ci`) |
| 3 | `npm run check:deps` (`npm audit --omit=dev --audit-level=high`) | pass — **0 vulnerabilities** (production scope) |
| 4 | `npm audit` (full, incl. dev) | **7 moderate**, all in the dev-only lint chain (`minimatch` via `@typescript-eslint/*` ≤8.72.2, GHSA-g3hv-75wg-m249). `npm audit fix` was run and **reverted**: it bumped typescript-eslint 8.68.0→8.72.2 with zero security gain (nested minimatch 10.2.6 stays inside the vulnerable 7.0.0–11.0.0 range; escaping it needs a semver-major bump). Recorded as residual, not fixed |
| 5 | `node docs/qa/tools/import-graph.mjs` | pass — 141 src modules, 120 reachable from `src/app`, **0 unreachable** |
| 6 | `npm run check:rtl` | pass — **24/24** route×width combinations, no horizontal overflow |
| 7 | `JOURNEY_BASE=http://localhost:3117 npm run check:journey` | pass — **26/26** steps (local server; `RESEND_API_KEY`/`BRIEF_NOTIFICATION_EMAIL` unset → receipt-only; never run against production) |
| 8 | `METRICS_BASE=http://localhost:3117 npm run check:vitals` | pass — worst **LCP 408 ms** (< 1200 budget), worst **CLS 0.0001** (< 0.05). Per-route: `/` 280/232 ms, `/solutions` 232/248 ms, `/start-a-project` 408/272 ms (desktop/mobile). The earlier 1336 ms desktop reading was taken while the system drive was at **0 bytes free**; with 3.9 GB free the same build measures 280 ms — environment, not site |
| 9 | `npx playwright test` (full matrix, fresh build on :3117) | pass — exit 0; **170 passed, 14 skipped** (intentional per-project skips), **1 flaky**: firefox-desktop `/approach` no-JS check, `page.goto` 60 s timeout on first attempt, passed on retry in 8.2 s |
| 10 | `npx playwright test e2e/quality.spec.ts --project=firefox-desktop` (targeted re-run) | pass — exit 0; 27 passed, **2 flaky** on *different* tests (`/team`, intake SSR) with the identical signature: Firefox `page.goto` "load" timeout under parallel load. Flake class is machine navigation latency, not code: routes differ per run, every test passes on retry, and the suite's own config documents this failure mode |
| 11 | `npm run check:runtime` red-green | green on the real toolchain (`node 24.19.0 ≥ 22.9.0, npm 11.17.0 ≥ 11.17.0`, exit 0); red paths verified: simulated `npm/10.9.9` → exit 1 with the upgrade message; simulated `node 22.0.0` (via `Object.defineProperty(process.versions,'node',…)`) → exit 1 with the node-floor message |
| 12 | `npm install --package-lock-only` (after engines change) | lockfile delta is exactly the `engines` block (`node >=22.9.0`, `npm >=11.17.0`) — no dependency churn |
| 13 | `git diff --check` | no whitespace errors (Git LF→CRLF conversion warnings on Windows are environmental) |

## Per-finding closure

| Audit finding | Fix | Test/evidence |
|---|---|---|
| P1-1 header trust by array order | `detectClientPlatform()` gates the trusted header per platform (Vercel/Cloudflare/nginx via `CLIENT_IP_SOURCE`); bare Node reads right-most XFF only if it parses, else fail-closed | `client-ip.test.ts` platform-selection + fail-closed cases; live production probe (7 spoofed-header requests → 5×422 then 429, spoof ignored) |
| P1-2 IPv6 aliasing | Full canonicalisation (case/zero-padding/elision), IPv4-mapped + NAT64/6to4 unwrapping, /64 bucketing via `rateLimitKey` | `client-ip.test.ts` alias round-trip cases; `rate-limit.test.ts` /64 keying |
| P2-1 honeypot named in 422 | `publicFieldErrors()` strips `companyWebsite` from `fieldErrors` | `api-project-brief.test.ts`: non-string honeypot values (0/null/[]/{}/true) → 422 without the key, real field errors intact |
| P2-2 `allowScripts` not a gate | `.npmrc` `strict-allow-scripts=true`; stale `esbuild` entry removed; exact-version entries for fsevents 2.3.3/2.3.2 + unrs-resolver 1.12.2; CI pins npm 11.17.0 in both jobs | Registry probes: allowlisted `unrs-resolver@1.12.2` installs; unlisted → `ESTRICTALLOWSCRIPTS` exit 1. Clean `npm ci` pass (row 2) |
| P2-3 543 lines dead code | 7 home components deleted; duplicate `countWord` removed from `utils.ts`; `src/proxy.ts` deleted (Next core owns trailing-slash; the file's own redirect was a self-redirect) | import-graph **0 unreachable**; build 98/98; rendered gate pass; route inventories corrected |
| P2-4 zero header assertions | `e2e/headers.spec.ts`: full header set on `/`, `POST /api/project-brief`, and a static asset, across chromium/firefox/webkit; CSP comment corrected (observation-only, no collector) | 15 header tests passed inside the full run |
| P2-5 413 comment overstates | Comment corrected: declared length is an advisory early exit; the byte check runs after buffering; bounded by the rate limit | comment-only, no behaviour change |
| P2-6 drafts never expire | `isDraftRestorable()` 7-day TTL; expired/malformed drafts cleared; "Start fresh" erases the legacy `vantiq:` key too | `draft.test.ts` (TTL−1s restores, TTL+1s does not, non-numeric `savedAt` expired); `e2e/draft.spec.ts` (legacy seed → restore → start fresh → both keys absent) |
| INFO-1 legacy auditor / COEP | `X-XSS-Protection: 0`, `Cross-Origin-Embedder-Policy: require-corp` (measured: zero remote subresources); `upgrade-insecure-requests` deliberately absent from the report-only policy (console-noise, changes nothing) — belongs to the `CSP_MODE=enforce` change | header values asserted in `e2e/headers.spec.ts` |
| INFO-2 DNS prefetch | `X-DNS-Prefetch-Control: off`, transmitted explicitly | asserted in `e2e/headers.spec.ts` |
| INFO-3 any-Origin POST | `isCrossSiteRequest()` (`Sec-Fetch-Site`) rejects cross-site posts **before** the rate limit so a third-party page cannot spend a visitor's budget | `api-project-brief.test.ts` cross-site cases |
| INFO-4 hung provider holds invocation | `AbortSignal.timeout(10_000)`; invalid override falls back to the constant instead of silently skipping the request | `brief-notification.test.ts` (timeout still yields a receipt; bad override issues the request) |
| INFO-5 unbounded sweep | Map capped at 10 000 keys; only expired buckets reclaimed; a full cap **refuses the new key** rather than evicting an active block or partial count | `rate-limit.test.ts` capacity/preservation/performance cases |
| INFO-6 dotted-path canonicalisation | Finding retracted on measurement; the deeper defect (proxy redirect never ran; self-redirect when it did) resolved by deleting the file | live 308 behaviour asserted through the running server; inventories corrected |
| INFO-7 residuals lack owner/expiry | THREAT-MODEL §4: each residual owned by the site owner, re-confirm by 2027-05-16 or next audit | doc change |
| INFO-8 honeypot autofill risk | Accepted risk, recorded here: the DOM-present honeypot can be autofilled by an aggressive password manager, silently discarding a genuine lead (client sees `HB-000000`). Low probability, high per-event cost; mitigation would require moving the trap out of the DOM tree, which changes the trap's behaviour. Owner-visible; revisit if a lost-lead report ever arrives | this row |
| Re-review: Node floor vs npm 11 | `engines` narrowed to `node >=22.9.0`, `npm >=11.17.0`; `check:runtime` gate wired into `verify`; CI already pins + asserts npm 11.17.0; `engine-strict` deliberately NOT set (deploy platform installs the CI-approved lockfile with its own npm — a hard floor there would break deploys without adding control) | rows 1, 2, 11, 12 |
| Re-review: fsevents rationale | `.npmrc` + THREAT-MODEL corrected: install script is `node-gyp rebuild` (local native build on a macOS dev machine from the pinned tarball), not a prebuilt download; darwin-only optional, so Linux CI never installs it | `npm view fsevents@2.3.x scripts` → `"install": "node-gyp rebuild"` |

## Deviations

- Verification ran in the main tree (not an isolated copy): the stale port-3117 server was
  stopped first (specific PID, never a blanket node kill) and a fresh server started from the
  new build, so no torn state was served. The prior session's isolated-copy approach existed
  only to protect that now-replaced server.
- `npm audit fix` was applied, measured to gain nothing, and reverted; the lockfile ships with
  the engines delta only.
- The e2e flake was investigated (failure signature + targeted re-run) and recorded rather
  than re-run until green — re-running to a clean sheet would hide the signal.

## Known gaps

- **Node 22 clean install:** the local `npm ci` ran on Node 24.19.0. The Node 22 evidence is
  the PR's CI run, where both jobs pin npm 11.17.0 and run `npm ci` before anything else.
- **E2E flake class:** Firefox navigation timeouts under parallel load on this Windows machine;
  varying routes, always green on retry, exit 0 in both runs. The CI Linux run is authoritative.
- `/technology` at 390 px reports two escaping elements (nonfatal in the RTL script; marquee/
  glow elements designed to overflow inside `overflow:hidden` ancestors) — not separately
  visually reviewed this cycle.
- Real email delivery, Vercel-edge behaviour, CSP enforcement, and legal review remain
  owner-side items (THREAT-MODEL §4).
