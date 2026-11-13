# ROUTE-FEATURE-COVERAGE — baseline → final inventory diff (no-scope-loss check)

## Routes

| Category | Baseline count | Final count | Δ | Notes |
|---|---:|---:|---|---|
| Static pages | 17 | 17 | 0 | All paths unchanged |
| Dynamic detail pages | 34 | 34 | 0 | solutions 6, services 7, industries 12, insights 6, work 3 |
| Indexable total | 51 | 51 | 0 | Sitemap `<loc>` count 51 = 51 (build + prod verified) |
| Utility endpoints | sitemap, robots, manifest, feed.xml, OG conventions | same | 0 | Contracts preserved; identity strings → ARKYON |
| API endpoints | POST /api/project-brief | same | 0 | Request/response semantics unchanged (tests green) |
| Redirects | trailing-slash 308 proxy | same | 0 | |

## Metadata surfaces

| Surface | Baseline | Final | Δ |
|---|---|---|---|
| Title suffix | "— VANTIQ" | "— ARKYON" | intended |
| og:image / twitter:image / canonical / RSS discovery per route | present | present (check:rendered ✓) | 0 loss |
| JSON-LD (Organization, WebSite, Article, Software, Service, FAQ) | present | present | identity strings → ARKYON |
| Manifest icons/identity | VANTIQ/blue | ARKYON/copper | intended |

## Features (FC-01…FC-21) — all present, all behaviour-preserving

| Feature | Baseline | Final | Test evidence |
|---|---|---|---|
| Search ⌘K (recent+popular, focus mgmt) | ✓ | ✓ + migrated recents key | a11y.spec search tests; journey step 6 |
| Consent banner + gate | ✓ | ✓ + migrated key, compact mobile | a11y.spec region-not-dialog; analytics unit tests |
| ROI calculator math/presets | ✓ | ✓ (copper bands) | roi.test.ts 8 tests; tools.spec recompute |
| Readiness assessment | ✓ | ✓ | readiness.test.ts; tools.spec full run |
| Intake wizard + API | ✓ | ✓ (ink-on-copper, migrated draft key) | tools.spec full submission; api/validation/rate-limit tests |
| Nav dropdowns + single header CTA | ✓ | ✓ | journey script asserts ONE CTA at 1440/900/412/320 |
| Mobile drawer | ✓ | ✓ | smoke.spec mobile nav |
| Theme toggle + pre-paint | ✓ | ✓ + migrated key | journey step 7; a11y light sweep |
| RSS/sitemap/robots/manifest | ✓ | ✓ | check:rendered per-route gates |
| Accordions, architecture landscape, opportunity finder, insights explorer, before/after, reading progress, back-to-top, error surfaces, draft banner, motion system, hydration signal, scroll depth | ✓ | ✓ (re-toned) | quality.spec no-JS + structural; component-level unchanged (no logic edits) |

## Asset inventory diff

Old V-mark SVG + all old rasters replaced (ASSET-INVENTORY A-01…A-06); fonts unchanged; OG palette updated. Zero unexplained asset losses (grep-verified old path data and hexes).

## Conclusion

No route, endpoint, metadata surface, or feature was removed, renamed, or downgraded. The only intended deltas: brand strings/keys (with fallbacks), palette/mark/icons, chip hue normalisation, three eyebrow dedups, one added hero CTA, mobile consent compaction, footer industry links (additive).
