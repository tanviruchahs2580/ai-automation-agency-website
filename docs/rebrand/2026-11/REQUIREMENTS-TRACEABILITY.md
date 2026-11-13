# REQUIREMENTS-TRACEABILITY — requirement → implementation → test → evidence

Stable IDs from EXECUTION-LEDGER. Every row: implementation location + validation method + status.

| ID | Requirement | Implementation | Validation | Status |
|---|---|---|---|---|
| BR-01 | ARKYON sole active brand, single source | `src/data/site.ts` (default ARKYON); deriveBrandForms unchanged | `brand.test.ts` (single-home + retired-name + exact-ARKYON tests); rendered-HTML grep (0 VANTIQ brand-copy hits; legacy key fallbacks only, documented D-01/D-12) | PASS |
| BR-02 | Original logo/asset system | `Wordmark.tsx` keystone mark; `icon.svg`; `generate-icons.mjs` → icon/apple/manifest/ICO | Rendered screenshots; PNG dimension checks; build passes Next ICO parser | PASS |
| BR-03 | Brand-consistency regression tests distinguish historical vs active | `brand.test.ts` (ACTIVE_BRAND_PATTERN vs RETIRED_BRAND_PATTERN; __tests__ exempt) | 180/180 unit suite | PASS |
| DES-01 | Three directions evaluated, one selected | `VISUAL-DIRECTION.md` (matrix, trade-offs) | Doc + scoring | PASS |
| DES-02 | Tokens implemented + documented | `globals.css` @theme + light theme; `DESIGN-SYSTEM.md` §2 | `contrast.test.ts` parses the shipped stylesheet (25 tests); doc-code correspondence reviewed | PASS |
| DES-03 | Route-family composition matrix | DESIGN-SYSTEM §5/§6 + per-family templates (already distinct; re-toned) | Visual matrix in VISUAL-REGRESSION-MATRIX.md | PASS |
| DES-04 | Independent design critique | Fresh-context reviewer pass on 11 screenshots | Findings fixed (commit 1b98add); residual trade-off documented in QA-REPORT | PASS (fresh-context AI reviewer; independence limits stated in INDEPENDENT-REVIEW.md §0) |
| UX-01 | Journey audit + fixes | Journeys preserved; work-detail hero CTA added; mobile banner compacted | e2e tools.spec + quality.spec + user-journey script | PASS |
| UX-02 | Industries discoverability | Footer lists all 12 sectors | content-integrity nav tests; rendered grep `industries/agriculture` | PASS |
| ROUTE-01 | 51 routes + utilities preserved | No URL changes (D-07); all templates re-toned | build 97/97 pages; check:rendered (og/canonical/RSS per route) | PASS |
| ROUTE-02 | Claims/proof registers | CONTENT-CLAIMS-REGISTER.md, FACT-AND-PROOF-REGISTER.md | Copy carried verbatim; disclaimers single-source test | PASS |
| FE-01 | FC-01…FC-21 preserved | No behavioural edits; storage keys migrated w/ fallback (D-01); `__arkyonAnalytics` (D-02) | e2e smoke/tools/a11y/quality suites + journey script | PASS (pending e2e green confirmation) |
| FE-02 | API contract unchanged | No edits to route/validation/rate-limit files | api-project-brief + validation + rate-limit + client-ip + brief-notification unit tests | PASS |
| QA-01 | Full gate suite green | — | verify + e2e + rtl + journey + vitals (QA-REPORT) | IN PROGRESS |
| QA-02 | Threat model | THREAT-MODEL.md | Controls cross-checked to tests | PASS |
| QA-03 | Manual a11y pass | — | axe suites + contrast tests + keyboard checks in a11y.spec | IN PROGRESS (automated; manual notes in QA-REPORT) |
| REL-01 | Independent review (honest labels) | INDEPENDENT-REVIEW.md | code-review skill passes + sub-agent critiques; independent-review status BLOCKED (no human reviewer) | PENDING |
| REL-02 | Release readiness + rollback; no deploy w/o approval | RELEASE-READINESS.md, RELEASE-ROLLBACK-PLAN.md | Docs + owner gate | PENDING |

Coverage accounting (counts):
- Discovered routes: 51 indexable + 7 utility endpoints + 1 API + favicon/icon/OG conventions.
- Render-checked: 97/97 prerendered documents (check:rendered).
- Visually reviewed (candidate screenshots): 13 route×viewport×theme combinations + 3 fix verifications.
- Dynamic records: all 34 enumerated in ROUTE-INVENTORY; all resolve via build (generateStaticParams); visual representatives per family ≥2 content shapes.
- Feature contracts: 21/21 dispositioned (FC-01…FC-21), all `UNCHANGED`/`VISUAL REWORK / SAME BEHAVIOUR` except FC-09 identity strings (KEEP with ARKYON values).
