# INPUTS-AND-GAPS — Architectural redesign kit validation (Phase 0)

Validated 2026-11-14 against the supplied kits. Expected-files checklist (master prompt §2.1):

| Expected item | Status | Note |
|---|---|---|
| START_HERE.md | PRESENT | kit root |
| docs/01-DESIGN-TARGET-SPEC.md | PRESENT | Architectural Night direction + tokens |
| docs/02-REPOSITORY-CONTEXT.md | PRESENT | read; stack matches verified repo |
| docs/03-FEATURE-LOCK-MATRIX.md | PRESENT | FC-01…FC-21 (matches repo's own FEATURE-CONTRACT-INVENTORY IDs) |
| docs/04-QA-ACCEPTANCE-MATRIX.md | PRESENT | read; gates mapped to repo scripts |
| docs/05-INTEGRATION-GUIDE.md | PRESENT | starter-adaptation rules |
| docs/06-ASSET-GUIDE.md | PRESENT | hero asset + imagery rules |
| docs/07-COMPONENT-MAP.md | PRESENT | reuse map |
| BRAND-GUIDE.md (kit copy) | ABSENT from kit | repo's own `BRAND-GUIDE.md` (current, ARKYON) used instead — the authoritative source |
| DESIGN-SYSTEM.md (kit copy) | ABSENT from kit | repo's own `DESIGN-SYSTEM.md` updated to v5 in this change |
| starter-components (tsx + css) | PRESENT | adapted, not pasted |
| references/ARKYON_TARGET_REFERENCE_MOBILE.png | PRESENT (706×1536) | primary composition target |
| assets/arkyon-hero-architecture.webp | PRESENT (1536×1024, 172 KB) | copied to `public/images/` |

## Discrepancies resolved (evidence-based)

1. **Feature-matrix count:** kit FC-01…FC-21 == repo `docs/rebrand/2026-11/FEATURE-CONTRACT-INVENTORY.md` FC-01…FC-21 (1:1 IDs, no drift). Union preserved.
2. **Route count:** verified from the current build output — 97 prerendered documents, **51 indexable routes** (17 static + 34 dynamic), matching sitemap `<loc>` count. The kit's "51" observation remains current.
3. **Service records:** 7 detail records exist; homepage shows 6 groupings; `/services` index keeps all 7 (Automation Engineering reachable). Spec §6.5 satisfied.
4. **Industries:** 12 detail records exist; strip shows 5; Enterprise → `/industries` (index) as the spec permits.
5. **`/api/project-brief`:** exists and unchanged (git diff shows no edits to route/validation/rate-limit files).
6. **Reference footer shows social icons (LinkedIn/GitHub/mail):** the site has **no verified social destinations** and contact channels are env-gated (null in this deployment) — per master prompt §6.7 and BRAND-GUIDE truth rules, social icons are NOT invented. Deviation recorded in DECISIONS.md (D-R1).
7. **Reference play-button on the approach banner:** no real video exists — the honest arrow/↗ treatment is used (spec §6.6 explicitly permits this). D-R2.
8. **Reference is dark-only; the site ships a designed light theme:** light theme redesigned deliberately (cool paper navy-ink orange), hero/approach stay photographic-dark in both themes (fixed copy colours over the overlay). D-R3.
9. **Starter's scoped palette bridge:** removed in adaptation — the same values now live in the global token source (globals.css `@theme`), per master prompt §5.2.
