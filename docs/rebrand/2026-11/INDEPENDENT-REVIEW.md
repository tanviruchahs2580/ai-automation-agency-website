# INDEPENDENT-REVIEW — ARKYON rebrand

## 0. Independence statement (read first)

**INDEPENDENT REVIEW: BLOCKED / NOT VERIFIED.** No human reviewer and no separately-accountable reviewer distinct from the implementation author was available in this session. What was performed instead:

1. **Adversarial self-review** by the implementation lead (visual self-inspection against the brief's anti-pattern list, gate re-runs).
2. **Fresh-context AI reviewer passes** — separate agents with no knowledge of the implementation reasoning, dispatched with bounded tasks and return formats (design critique, standards axis via the code-review skill, specification axis). These agents did not author the code, but they are not human, not separately accountable to the owner, and share the implementation agent's limitations. They are recorded as *review inputs*, not as an independent-review pass.

Per the governing brief (§2, §12.2, §13.4), the independent-review release gate is therefore **NOT VERIFIED**, and the owner should arrange a qualified human reviewer before production release. Nothing below claims otherwise.

Reviewer identities: design critique + standards + specification = fresh-context general-purpose sub-agents (agent ids in session log, 2026-11-13); base SHA `27b566c` → head `1de5e3e` (standards/spec), candidate screenshots (design). None authored the reviewed work; all were read-only.

## 1. Design critique (visual, fresh-context reviewer)

Scope: 11 screenshots (home dark/light ×2 viewports, listings, 4 detail families, 3 tools, intake ×2 viewports, technology). Method: the brief's §9.4 eight questions + per-page verdicts; pixel-sampled colours; 2–4× crops.

Verdict highlights (full report in session log; summary in ledger DES-04):
- 5–8s comprehension: **PASS** (proposition + who/for-whom in first viewport).
- Authored-vs-template: **authored**, with one template-shaped blemish (multi-hue icon chips) — fixed.
- Hierarchy, typography, alignment, CTA discoverability: strong; specific nits fixed (eyebrow duplication ×3, "Why it exists" duplication, unexplained instrument dot, work-detail missing hero CTA).
- Mobile: compositions designed, not collapsed; **P1** — the consent banner covered the hero CTAs/intake form on phones → compacted (residual: a bottom consent banner always overlays some first-screen content until dismissed; accepted as the standard consent pattern, documented).
- Colour discipline: contrast verified by sampling (all ≥AA); copper used as signal not wallpaper; two hue leaks fixed (chips, instrument dot).

## 2. Standards review (code-review skill, standards axis)

**STANDARDS VERDICT: PASS-WITH-FINDINGS** (closed in commit `1de5e3e`).

Findings and closure:
- F1 (P1) governance docs untracked + dangling QA-REPORT reference → closed: `docs/rebrand/2026-11/` committed with this report set.
- F2 (P2) DECISIONS D-01 overclaimed fallback mechanics → closed: D-01 rewritten (read-fallback on access, no forward migration, exit-intent exempt), D-12 added for the removal path.
- F3 (P2) prose-quoted contrast ratios drifted from computation → closed: ratios removed from comments/docs; `contrast.test.ts` is the single record (D-13).
- F4 (P3) dead light-theme `.text-key` rule → removed.
- F5 (P3) hardcoded ink-label hexes ×4 → tokenised as `--color-ink-on-accent`.
- F6 (P3) fallback-shape duplication + constant-name disagreement → name unified; duplication retained deliberately (storage areas differ; inline script can't share TS) — recorded.
- F7 (P3) dead hue-rotation arithmetic → documented as API-compat (D-15-adjacent note in Chip.tsx).
- F8 (P3) brand-scan case-sensitivity hole → recorded (same shape as pre-existing gate).
- Test-rewrite judgement: contrast/brand test rewrites **strengthen** the gates (reviewer-verified).
- Reviewer independently reproduced: lint, typecheck, 180/180 unit, build, budgets (157.4/176.3/12.2 KiB), check:rendered, WCAG recomputation of every quoted pairing.

## 3. Specification review (spec axis)

**SPEC VERDICT: PASS-WITH-FINDINGS** (governance-hygiene findings; all closed).

Verified-clean by the reviewer's own reproduction: exact-name ARKYON (0 brand-copy remnants; permitted categories only), all 51 routes + 21 feature contracts preserved (diff-read; core contract files untouched), honesty labels intact, no fabricated facts, route/URL/dependency stability, approval boundaries respected, numeric claims in governance docs reproduce (180/180 unit, 97/97 pages, gates exit 0, 0 dependency vulnerabilities).

Findings and closure:
- P1 E2E blocked on missing firefox/webkit binaries → closed: binaries installed (toolchain-only), full matrix run + isolation re-runs (QA-REPORT §2).
- P2 stale EXECUTION-LEDGER → closed: ledger advanced to final state.
- P2 DES-04 PASS cited a non-existent INDEPENDENT-REVIEW.md → closed: this file exists; ledger row wording updated.
- P2 stale VANTIQ-era `src/lib/a11y-matrix.md` falsifying the asset-scan claim → closed: rewritten for Keystone (commit `1de5e3e`).
- P3 broken D-12 reference → closed: D-11..D-15 now exist.
- P3 BRAND-STRATEGY proseName misstatement → corrected.
- P3 "ARKYON AI Readiness Assessment" substring → ruled not a lockup form (D-14); owner may reorder later.
- P3 asset-scan is manual → accepted as a documented fallback (automated rendered-output gates cover the generated surfaces).
- P3 Button.tsx owner-work record wording → clarified in ledger P0-01.

## 4. Post-review state

All P0/P1 findings from every review pass are closed and re-verified (`npm run verify` EXIT 0 on `1de5e3e`; E2E matrix green per QA-REPORT §2). Remaining P2/P3 items are documented above with rationale. The release gates in RELEASE-READINESS.md carry the honest BLOCKED/NOT VERIFIED labels.
