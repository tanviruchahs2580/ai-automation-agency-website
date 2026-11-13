# VISUAL-REGRESSION-MATRIX — baseline (prod, VANTIQ) → final (local build, ARKYON)

Baseline captures: `docs/rebrand/2026-11/screenshots/baseline/` (prod `ai-automation-agency-website-lilac.vercel.app`, 2026-11-13, chromium, dark scheme, hydrated-wait).
Final captures: `docs/rebrand/2026-11/screenshots/candidate/` (local production build of the rebrand branch).

Naming: `<route>__<viewport>__<engine/env>[__<theme>].png`.

| Route family | Representative(s) captured | Viewports | Baseline | Final | Disposition verified |
|---|---|---|---|---|---|
| Home | `/` | 1440, 390 (+ light 1440) | ✓ | ✓ | Identity→ARKYON; gradient→key phrase; instrument re-toned |
| Solutions index | `/solutions` | 1440 | ✓ | ✓ (+fix verify) | Chips single-hue copper |
| Solution detail | `/solutions/ai-agents` | 1440 | ✓ | ✓ | Eyebrow dedup |
| Services index | `/services` | 1440 | ✓ | — | Token-level re-tone only (same template as solutions index) |
| Service detail | `/services/ai-engineering` | 1440 | ✓ | ✓ | Eyebrow dedup + "The problem" |
| Industries index | `/industries` | 1440 | ✓ | ✓ (+fix verify) | Chips single-hue |
| Industry detail | `/industries/financial-services` | 1440 | ✓ | — | Template shared with industry family; re-tone token-level |
| Work index | `/work` | 1440 | ✓ | — | Token-level |
| Work detail | `/work/invoice-processing-operations` | 1440 | ✓ | ✓ (+fix verify) | Hero CTA added; honesty badge kept |
| Insights index | `/insights` | 1440 | ✓ | — | Token-level |
| Insight detail | `/insights/rag-…` | 1440 | ✓ | ✓ | Editorial typography unchanged, palette re-toned |
| Technology | `/technology` | 1440 | ✓ | ✓ | Agent-stage map re-toned |
| About | `/about` | 1440 | ✓ | — | Token-level |
| Security | `/security` | 1440 | ✓ | — | Token-level |
| AI readiness | `/ai-readiness` | 1440 | ✓ | — | Tool logic untouched; chrome re-toned (e2e covers interactions) |
| ROI calculator | `/roi-calculator` | 1440 | ✓ | ✓ | Math untouched; copper gauge bands |
| Intake | `/start-a-project` | 1440, 390 | ✓ | ✓ | Wizard contract untouched; ink-on-copper CTAs |
| 404 | `/definitely-missing` | 1440 | (prod capture) | candidate not-found | `$ arkyon …` strings |

Honesty labels on every captured surface: `INTERACTIVE SIMULATION`, `All figures simulated…`, `Example architecture — not a client engagement`, ROI `estimateNote` — all present post-rebrand (verified in candidate captures).

Not visually re-captured post-fix (token-level re-tone only, same templates as captured representatives): services index, industry detail, work index, insights index, about, security, ai-readiness. These remain covered by: build render checks, axe scans (16-route sweep), quality.spec no-JS/overflow checks, and the journey script.

Light-theme coverage: home 1440 light (candidate) + light-theme axe sweep in a11y.spec (16 routes) + solutions/work/home fix captures defaulted light (Playwright default scheme).
