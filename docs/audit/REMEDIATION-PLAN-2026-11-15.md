# Remediation Plan — current-condition audit 2026-11-15

Ties 1:1 to `docs/audit/CURRENT-CONDITION-AUDIT-2026-11-15.md`.
**Rule for this plan:** every slice is independently shippable, ends green on the full
gate set, and adds a test that would have caught the defect. No existing test is
weakened; no budget or coverage ratchet is lowered.

> **Executed 2026-11-15/16** on branch `feat/enterprise-audit-remediation`.
> Closure evidence per slice: `docs/audit/REMEDIATION-EVIDENCE-2026-11-16.md`.

Gate set that must pass at the end of **each** slice:

```bash
npm run lint && npm run typecheck && npm test
npm run build && npm run check:rendered && npm run check:budget
```

---

## Slice 1 — Client address: canonicalise + make the trust decision explicit
**Closes:** P1-1, P1-2. **Risk:** low. **Files:** `src/lib/client-ip.ts`, `src/lib/__tests__/client-ip.test.ts`.

1. Add an IPv6 canonicaliser: lowercase, strip per-group leading zeros, compress the
   longest run of zero groups to `::` (leftmost on tie), leave IPv4 and IPv4-mapped
   forms alone. Return the canonical form from `normalize`.
   **Test first:** the four spellings that currently alias must resolve to one key,
   plus `::1`, a full 8-group address, a tie between two zero runs, and an
   IPv4-mapped `::ffff:192.0.2.1`.
2. Make header trust explicit instead of positional. Keep the current order as the
   Vercel path; gate the non-Vercel headers behind their own platform variable so the
   "which header may I believe" answer is stated in code rather than inferred from
   array order. Document, per header, the platform that sets it.
   **Test:** with no platform variables set, a spoofed `x-real-ip` must not win over
   `x-forwarded-for`; with `VERCEL=1`, `x-vercel-forwarded-for` must still win.
3. Keep `UNKNOWN_CLIENT` fail-closed behaviour untouched.

**Behaviour that must not change:** on the current production host, resolution order
for real requests is identical (verified: production probe gave 5×422 then 429).

---

## Slice 2 — Honeypot: stop echoing the trap in validation errors
**Closes:** P2-1. **Risk:** low. **Files:** `src/app/api/project-brief/route.ts`, `src/lib/validation.ts`, `src/lib/__tests__/api-project-brief.test.ts`.

1. Strip `companyWebsite` out of `fieldErrors` before building the 422 body.
2. **Test first:** for each of `0`, `null`, `[]`, `{}`, `true` as `companyWebsite`,
   the response must be 422 **without** a `companyWebsite` key, and must still carry
   the real field errors for genuinely invalid fields.
3. Keep the ordinary-receipt silent-sink behaviour for a *string* honeypot value
   exactly as it is, including the absence of a log line.

---

## Slice 3 — Security headers become a gated surface
**Closes:** P2-4. **Risk:** low. **Files:** `e2e/quality.spec.ts` (or a new
`e2e/headers.spec.ts`), `next.config.ts` (comment only).

1. One test asserts the full header set on `/` and on `POST /api/project-brief`, and
   that a static asset path carries HSTS + CSP. Assert values, not just presence.
2. `next.config.ts`: amend the CSP comment so it no longer implies a report collector
   exists — say the policy is observation-only with no endpoint, and record why adding
   one was deferred.
3. Do **not** flip to enforce, and do **not** add `upgrade-insecure-requests` in this
   slice (that belongs with the INFO hardening pass, so the diff stays readable).

---

## Slice 4 — Remove the dead homepage components
**Closes:** P2-3. **Risk:** low (verified unreachable). **Files:** 7 deletions, plus
`src/lib/utils.ts`.

1. Delete `CaseStudiesPreview`, `Hero`, `IndustriesGrid`, `ServiceRows`,
   `TrustGovernance`, `TrustStrip`, `WhatWeSolve`.
2. Remove the now-unused duplicate `countWord` from `src/lib/utils.ts` — but **only**
   after confirming its remaining exports are still imported (`cn`, `formatCurrency`,
   `formatNumber`, `clamp`, `slugify`).
3. Re-run `node docs/qa/tools/import-graph.mjs` → expect **0** unreachable modules
   other than `proxy.ts` (a Next.js convention entry, correctly unreferenced).
4. `npm run build` must still produce 98 pages and pass both rendered and budget gates
   — proof that no reachable route lost anything.

**Guard:** `check:rendered` (53 documents) + `quality.spec.ts` no-JS sweep across 18
routes are the regression net for "content still renders".

---

## Slice 5 — Draft retention matches the privacy page
**Closes:** P2-6. **Risk:** low. **Files:** `src/components/forms/ProjectIntake.tsx`,
plus a unit test for the expiry predicate.

1. Extract the "is this draft still usable?" decision into a pure function with the TTL
   as a constant (7 days), so it is testable without a DOM.
2. On restore, treat an expired draft as absent (and clear the key).
3. **Test:** fresh draft restores; draft at TTL−1s restores; draft at TTL+1s does not;
   a draft with a non-numeric `savedAt` is treated as expired rather than trusted.

---

## Slice 6 — Supply chain: make `allowScripts` a real gate
**Closes:** P2-2. **Risk:** medium (changes `npm ci` behaviour in CI). **Files:** `.npmrc`, `package.json`.

1. Add `.npmrc` with `strict-allow-scripts=true`.
2. Remove the stale `esbuild` entry (verified absent from the lockfile).
3. Add `fsevents` and `unrs-resolver` with a one-line justification each.
4. **Verify with a clean `npm ci`** in a scratch directory before merging, and confirm
   `node_modules` still builds and `npm test` passes. If any legitimate package is
   blocked, add it with a reason — never disable the setting.

If step 4 shows broad breakage, stop and revert the slice; a broken install is worse
than an unreviewed one. Record the outcome either way.

---

## Slice 7 — Honesty fixes and INFO hardening (each independently shippable)
**Closes:** P2-5 + INFO 1–6. **Files:** `src/app/api/project-brief/route.ts` (comment),
`next.config.ts`, `src/lib/brief-notification.ts`, `src/lib/rate-limit.ts`, `src/proxy.ts`.

- **7a** Correct the 413 comment to state that the declared-length check is advisory
  and the byte check happens after buffering. (Comment only — no behaviour change.)
- **7b** Add `X-XSS-Protection: 0`; add a same-origin `Origin` check to the intake
  route with a test; set `X-DNS-Prefetch-Control: off`.
- **7c** `AbortSignal.timeout(10_000)` on the Resend fetch, with the existing
  never-blocks-the-receipt behaviour preserved (test: a timeout still yields a receipt).
- **7d** Hard-cap the rate-limit map with eviction, and sweep at most once per second.
  Test: 10k unique keys never exceed the cap; sweep is not re-entered.
- **7e** Decide the dotted-path canonicalisation question in `proxy.ts` and either fix
  or document it — do not leave it ambiguous.
  *Outcome:* the finding was wrong (dotted paths 404; no route contains a dot), but
  investigating it showed the file's redirect never executes — Next core does the
  canonicalisation — and that its own redirect returns a `Location` equal to the input.
  `src/proxy.ts` was deleted. No test for it was ever committed, so no coverage was
  lost; the redirects it appeared to own are now asserted through the live server
  instead. Route inventories and the threat model were corrected, since they credited
  the file with behaviour it did not provide.

Deliberately **excluded** from this plan (recorded as decisions, not open items):
CSP nonce migration (would force dynamic rendering across 98 static routes),
Redis-backed rate limiting (needs infrastructure the owner has not provisioned),
analytics provider (owner decision pending in `docs/growth/SEO-AEO-PLAN.md`).

---

## Verification at the end (not per slice)

```bash
npm run verify                    # lint, typecheck, unit, build, rendered, budget
npx playwright test               # cross-engine, 4 projects
node docs/qa/tools/import-graph.mjs
npm audit --omit=dev --audit-level=high
```

Then, before merge: one fresh-context adversarial review of the diff against real
browser output, per this repo's established practice.

**Deploy gate:** pushing/merging/deploying is outward-facing. The owner's standing
authorisation covers completing the work; the release step is still recorded with its
deploy SHA and a post-deploy read-only verification (headers, canonical host, one
honeypot-sink request). `check:journey` is never run against production.

---

## Expected diff size

| Slice | Production lines | Test lines |
|---|---|---|
| 1 | ~60 | ~50 |
| 2 | ~8 | ~30 |
| 3 | ~6 | ~60 |
| 4 | −543 / −15 | 0 |
| 5 | ~20 | ~25 |
| 6 | ~6 | 0 |
| 7 | ~45 | ~55 |
| **Total** | **≈ −480 net** | **≈ +220** |

The codebase gets **smaller** while gaining coverage on three previously ungated
surfaces. That is the intended shape of a remediation on a site already in good
condition: no rewrites, no architecture churn, ratchets up only.
