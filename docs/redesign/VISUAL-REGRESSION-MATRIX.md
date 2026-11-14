# VISUAL-REGRESSION-MATRIX — Architectural Night

Captures in `docs/redesign/evidence/` (chromium, production build, 2026-11-14):

| Surface | Viewport | Theme | File |
|---|---|---|---|
| Home hero | 1440 | dark | home-dark-desktop.png |
| Home hero | 390 | dark (system-light fallback recorded) | home-dark-mobile2.png, home-mobile-final.png |
| Strip + services | 1440 | dark | home-strip-services.png |
| Services + approach | 1440 | dark | home-approach-footer.png |
| Home | 1440 | light | home-light-desktop.png, home-light-final.png |
| Service detail | 1440 | dark + light | inner-service-dark3.png / inner-service-dark.png |
| ROI calculator | 1440 | light | inner-roi-dark.png (system-light) |
| Insights index | 1440 | light (system default) | inner-insights-dark.png |

Reference comparison: composition/section-order/eyebrow-rule/H1-accent/CTA pills/strip cells/card grid/banner verified against `references/ARKYON_TARGET_REFERENCE_MOBILE.png` (mobile) + deliberate desktop adaptation (spec §4). Documented deviations: social icons (D-R1), arrow not play (D-R2), description text on desktop cards (kit starter behaviour, information value).
