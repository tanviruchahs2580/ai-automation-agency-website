# VISUAL-DIRECTION — three territories, scoring, selection (Phase 2)

References studied (principles, not assets; inspected via public sites, 2026-11): Linear (dark-mode restraint, calm hierarchy), Stripe (editorial type + diagrams as content), Anthropic (honest non-hype copy, restrained palette), Vercel (site-as-credibility, minimal motion), Palantir (operational-data gravity — studied for what to avoid: dashboard clutter), Ondo/infrastructure sites (keystone/architecture metaphors). Nothing copied verbatim; the current site's own "console" language is inherited and transformed, not cloned.

## Direction A — "KEYSTONE" (architectural warmth)

- **Concept:** the identity is the keystone — the wedge that completes an arch. Precision-architecture language: warm ink canvas, hairline drawing-sheet rules, numbered section markers, one copper signal colour. The site reads as an engineering drawing set, not a dashboard.
- **Attributes communicated:** structural certainty, craftsmanship, warmth inside rigour, longevity.
- **Wordmark/symbol:** `ARKYON` in Geist 700, tight tracking, flat-topped A; symbol = arch arc with detached keystone wedge at apex (scales to favicon as the wedge alone).
- **Typography:** existing self-hosted stack re-roled — Geist (display), Inter Tight (body), JetBrains Mono (technical metadata), Source Serif 4 (editorial pull quotes). No new fonts → no licensing/budget risk.
- **Colour:** warm-ink canvas family (dark default `#0d0c0f`-ish, light theme warm paper); **copper accent** (dark theme fill ~`#e0874a` w/ ink label; light theme ~`#b45a20` w/ paper label); signal green/brass retained strictly for status semantics; **no decorative gradients** — the tri-colour gradient headline dies.
- **Composition:** drawing-sheet structure — sheets numbered `SHEET 01`, hairline column rules, asymmetric grids; hero = proposition left, one honest instrument right; diagrams keep real labels.
- **Motion:** existing restrained system (route fade client-nav only, reveals behind reduced-motion gate) — unchanged mechanics, retimed feel.
- **Risks:** copper must hold AA on both themes (mitigated: ink-on-copper fills measured before adoption); "warm" must not read "rustic" (mitigated: hairline precision everywhere).

## Direction B — "SIGNAL FIELD" (instrument continuity)

- **Concept:** deepen the current operator-console: near-black, single green signal, mono-forward typography, denser instrumentation.
- **Attributes:** operational, live, alert.
- **Type/colour:** same stack; electric blue + signal green retained.
- **Risk that decides it:** visually continuous with the VANTIQ deployment — a rebrand that reads as a reskin. Distinctiveness vs. the old brand is the point of this exercise.
- Scores: distinctiveness-from-old-brand poor, practicality excellent.

## Direction C — "FIELD NOTES" (editorial R&D paper)

- **Concept:** light paper-first research journal: Source Serif 4 display, margin annotations, numbered figures, deep-teal accent. Strongest differentiation from the AI category's dark sites.
- **Risk:** mis-fits the operations/CTO audience's dark-mode expectation; largest re-implementation cost across 51 routes; dual-theme maintenance burden inverts (dark becomes the afterthought).

## Scoring matrix (weights per brief §7.3; 1–5 with rationale)

| Criterion (weight) | A Keystone | B Signal Field | C Field Notes |
|---|---|---|---|
| Distinctiveness & recognisability (20%) | 5 — copper/keystone owns a gap no AI competitor occupies; B reads as VANTIQ 2.0; C distinct vs category but generic-vs-publishing | 2 | 4 |
| Fit with AI R&D + systems-engineering positioning (20%) | 5 — keystone = architecture + "the piece that completes it" | 4 | 3 |
| Visual craft & editorial quality (20%) | 4 — hairline precision system | 4 | 5 |
| Readability & accessibility (15%) | 5 — high-contrast fills, ink-on-copper buttons (≥7:1 projected), dual theme kept | 5 | 4 |
| Longevity & restraint (10%) | 4 | 4 | 3 |
| Responsive & implementation practicality (10%) | 4 — token-level change + component restyle, same geometry | 5 | 3 |
| Asset/licensing practicality (5%) | 5 — no new fonts, hand-authored SVG | 5 | 5 |
| **Weighted total** | **4.60** | **3.75** | **3.85** |

**Selected: A — KEYSTONE.** Trade-offs accepted: ceding the "live-instrument green" heroism of B (green remains, demoted to status-only); not chasing C's editorial maximalism (Serif stays in its current pull-quote role). B is rejected chiefly because continuity with the old brand defeats the rebrand; C because it optimises for a different audience than the buyers in §0.3.

## Hero composition (selected direction — reference for Phase 4)

- Desktop: left 7-col — mono eyebrow `ARKYON · AI SYSTEMS ENGINEERING`, H1 in solid ink with ONE copper-keyed phrase (no gradient), body lead, primary CTA (copper fill) + secondary ghost CTA; right 5-col — the existing honest instrument, restyled to drawing-sheet language (labelled `SIMULATION`, copper tick accents).
- Mobile: single column, instrument below the fold-first proposition; CTA pair stacked.
- Inner-page reference (service detail): sheet header (index + breadcrumb), asymmetric 8/4 body/aside, accordion FAQ, sticky CTA card.

Both compositions get built and critiqued in Phase 4 before full rollout (DES-04).
