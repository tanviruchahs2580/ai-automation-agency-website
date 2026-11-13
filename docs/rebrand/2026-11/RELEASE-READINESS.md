# RELEASE-READINESS — ARKYON rebrand

Date: 2026-11-13 · Branch `feat/arkyon-rebrand-frontend-v3` · base `27b566c` → head `1de5e3e` (+ governance-doc commit) · **Recommendation: engineering-complete; NOT production-released — owner gates below.**

## 1. Scorecard (weighted per brief §13.3; every score cites evidence)

| Dimension | Weight | Score | Evidence |
|---|---:|---:|---|
| ARKYON brand strategy & identity consistency | 10 | 9.5 | Single-source brand (`brand.test.ts` 3 new tests); rendered scan 0 remnants; strategy/direction/migration docs; −0.5: "ARKYON AI …" JSON-LD construction ruled non-violation but flagged (D-14) |
| Visual design craft & distinctiveness | 25 | 22 | Keystone direction scored + selected (VISUAL-DIRECTION); candidate screenshots both themes; independent design critique PASS after fixes; residual: mobile consent-overlay trade-off, P3 spacing notes |
| UX, IA & conversion | 15 | 13 | 9 journeys preserved + journey harness 26/26; work-detail CTA added; footer industry gap closed; single-CTA invariant enforced |
| Content integrity & route coverage | 10 | 10 | 51/51 routes, 0 losses (ROUTE-FEATURE-COVERAGE); claims/proof registers; honesty labels intact; disclaimers single-source-tested |
| Frontend architecture & code quality | 15 | 13.5 | Token-only palette change; no new deps; strict TS clean; reviewer: "the code is the most disciplined part of this change"; −1.5: recorded duplication (storage-fallback shape) + retained hue-type surface |
| Accessibility | 10 | 9 | axe zero-above-minor across engines; machine-checked contrast both themes; keyboard/focus suites; −1: no manual screen-reader walkthrough (environment limitation, disclosed) |
| Performance & responsive | 7 | 6.5 | Lab LCP 588ms / CLS 0.0004 vs budgets; bundle budgets green; RTL 24/24; 320px sweeps; −0.5: single Windows-lab environment |
| SEO & discoverability | 4 | 4 | per-route canonical/OG/RSS gates; sitemap 51; robots; feed identity verified |
| Security, privacy & release governance | 4 | 3.5 | threat model with test-linked controls; 0 dep vulnerabilities; headers unchanged; −0.5: CSP remains report-only (owner decision) |
| **Total** | **100** | **91.0** | Engineering target ≥95 noted; the gap is dominated by items only the owner can close (independent human review, manual SR testing, CSP enforcement) — not by open engineering defects |

## 2. Hard release gates (§13.4) — status per gate

| Gate | Status |
|---|---|
| No open P0/P1 defects | **PASS** (all review findings closed; see INDEPENDENT-REVIEW §4) |
| No core route family missing/untested | **PASS** (51/51 + utilities + API; coverage tables) |
| Main user journeys pass | **PASS** (journey 26/26; e2e tools/spec suites all engines) |
| Brand consistent; no old brand asset in active UI | **PASS** (rendered scan + asset inventory + tests) |
| No fabricated/misleading claims | **PASS** (spec-review verified; registers) |
| No known serious a11y failure | **PASS** (automated scope; manual SR = NOT PERFORMED, disclosed) |
| Production gates (build/lint/typecheck/unit/e2e/security) | **PASS** on final tree (QA-REPORT §1) |
| No broken canonical/social card/indexing state | **PASS** (check:rendered; localhost-canonical note is the documented pre-deploy state) |
| Test runs cannot trigger real lead notifications | **PASS** (no Resend env locally/CI by default; synthetic data; journey run against local only) |
| Independent review of final diff | **BLOCKED / NOT VERIFIED** — no human reviewer available; adversarial + fresh-context AI passes recorded. **Release gate not satisfied.** |
| Every baseline feature has verified disposition | **PASS** (FEATURE-CONTRACT-INVENTORY + ROUTE-FEATURE-COVERAGE; e2e evidence) |
| Baseline→final inventory has no unexplained losses | **PASS** |
| Dynamic families have stated coverage method | **PASS** (ROUTE-INVENTORY §coverage method; build renders all 34 records) |
| Release candidate has verified rollback + last-known-good | **PASS** (RELEASE-ROLLBACK-PLAN; prod `27b566c` is the rollback target) |

## 3. Owner decisions required before production release

1. **Independent human review** of the final diff (gate above) — the only unsatisfied hard gate.
2. **Push/PR authorisation** — the branch is local-only (D-09). On push, CI re-runs all gates.
3. **Production deploy authorisation** (Vercel; merge → auto-deploy per current CD note in ci.yml).
4. Pre-deploy environment inputs (names only): `NEXT_PUBLIC_SITE_URL` (production origin), `NEXT_PUBLIC_CONTACT_EMAIL`/`NEXT_PUBLIC_MEETING_LINK`, `RESEND_API_KEY`+`BRIEF_NOTIFICATION_EMAIL` (or intentionally receipt-only), `CSP_MODE=enforce` (recommended follow-up after preview validation), `NEXT_PUBLIC_LEGAL_REVIEWED` only after legal review.
5. Standing owner items from the registers: legal review of policies (F-08), custom-domain decision (F-11), named-portfolio publication evidence (F-05), trademark counsel for the ARKYON name/mark (F-10).

## 4. What this release changes for visitors (summary)

Brand identity VANTIQ → ARKYON everywhere active (strings, mark, icons, cards); Keystone visual re-tone (warm ink + copper, single-hue discipline, no gradient headline); additive: footer industry links, work-detail hero CTA; preserved: every route, feature, API contract, honest labelling, consent behaviour (with state-preserving key migration).

## 5. Verification identity

Final tree gates: `npm run verify` EXIT 0 (lint clean; typecheck clean; 180/180 unit; build 97/97; rendered invariants; budgets 157.4/176.3/12.2 KiB gzip). Deployment-dependent gates: QA-REPORT §1 (e2e matrix, rtl 24/24, journey 26/26, vitals LCP 588ms). All run on the exact head commit recorded above; CI will reproduce the quality+e2e jobs on push.
