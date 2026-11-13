# ASSET-INVENTORY — active brand & media assets (Phase 4/5 record)

All assets are first-party: hand-authored SVG, self-hosted OFL fonts, code-generated OG images. No stock, no third-party icon packs, no generated-imagery claims.

| ID | Asset | Path | Purpose | Format / size | Source & rights | In-use surfaces | Status |
|---|---|---|---|---|---|---|---|
| A-01 | Keystone mark (inline SVG) | `src/components/layout/Wordmark.tsx` | Header/footer lockup symbol | inline SVG, 32/26px, token colours | Hand-authored for this rebrand, 2026-11; no third-party rights | Navbar (desktop+mobile), Footer | VERIFIED (rendered screenshots) |
| A-02 | Favicon SVG | `src/app/icon.svg` | Browser tab icon (modern) | SVG 64×64, fixed colours | Hand-authored 2026-11 | All routes via Next icon convention | VERIFIED |
| A-03 | icon.png | `src/app/icon.png` | App/large icon | PNG 512×512 | Rasterized from A-02 via repo Chromium (`docs/rebrand/2026-11/tools/generate-icons.mjs`) | Next icon metadata | VERIFIED (dimensions) |
| A-04 | apple-icon.png | `src/app/apple-icon.png` | iOS home-screen icon | PNG 180×180 | Same pipeline as A-03 | apple-icon convention | VERIFIED (dimensions) |
| A-05 | favicon.ico | `src/app/favicon.ico` | Legacy favicon fallback | ICO w/ 32px RGBA PNG | Same pipeline as A-03 (canvas raster → RGBA per Next's parser) | All routes | VERIFIED (build passes Next ICO parser) |
| A-06 | Manifest icons | `public/icons/icon-192.png`, `icon-512.png` | PWA install icons | PNG 192/512 | Same pipeline as A-03 | `manifest.webmanifest` | VERIFIED (dimensions) |
| A-07 | OG/social cards | generated per route by `src/components/og/OgCard.tsx` + `opengraph-image.tsx` files | Social preview images (51 routes + root) | 1200×630 via `next/og`, Satori | Code-generated at build; brand from `siteConfig`; palette inlined (Satori has no CSS vars) | og:image / twitter:image on all routes | VERIFIED (check:rendered og:image gate) |
| A-08 | Display face | `public/fonts/geist-700.woff2` | Headlines, numerals | woff2, weight 500–800 | Geist — OFL, self-hosted, preloaded | All pages | VERIFIED |
| A-09 | Body face | `public/fonts/inter-tight-400.woff2` | Body/UI copy | woff2 400(+500 alias) | Inter Tight — OFL, self-hosted, deduped file | All pages | VERIFIED |
| A-10 | Mono face | `public/fonts/jetbrains-mono-400.woff2` | Labels, metrics, code | woff2 400(+500 alias) | JetBrains Mono — OFL, self-hosted | All pages | VERIFIED |
| A-11 | Editorial face | `public/fonts/source-serif-400*.woff2` | Insights + pull quotes | woff2 400 + italic | Source Serif 4 — OFL, self-hosted | Insights, quotes | VERIFIED |

## Old-asset regression scan (required by brief)

- Previous "V" chevron mark: existed only as inline SVG in `Wordmark.tsx` and as the old `icon.svg`/rasters — all replaced in this change; no stale copies remain in `public/` or `src/` (verified by grep for the old path data `M5 6.5 16 25.5` / `M15 17 L32 47 L49 17`: zero hits).
- Old blue `#2e6bf6` / canvas `#0a0b0e` hexes: zero hits in `src/` outside dated historical docs (grep-verified).
- Rendered-surface check: header, footer, favicon (build-verified), manifest, OG cards (check:rendered) all serve the new identity; browser-tab icon verified via `icon.png` render during generation.

**Trademark note:** no availability search or legal claim is made for the ARKYON name or mark (F-10 — owner to arrange qualified counsel).
