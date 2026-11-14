# Approach-banner redesign — audit findings and closure (2026-11-14)

Fresh-context enterprise audit verdict: PASS-WITH-FINDINGS (26 evidence artifacts in audit/). Closure:

| # | Sev | Finding | Fix | Re-verified |
|---|---|---|---|---|
| 1 | P1 | Banner clipped at 320–430px (eyebrow "IMP", heading mid-word; 101px internal overflow at 320) | ≤480px breakpoint: padding 1.5/1.25rem, eyebrow wraps (flex-wrap + 0.18em/0.64rem), heading floor 1.3rem, forced `<br>` hidden | banner internal overflow 0 at 320/390/1440; heading text intact ("Building a Smarter, More Automated Future") |
| 2 | P1 | Source image 742×213 in a 1246×246 slot (1.7× DPR1 / 3.4× DPR2 upscale, smeared) | Re-encoded at 2× (1484×426 webp, 38 KB, high-quality smoothing); remaining softness inherent to the owner-supplied master — a ≥1600px regenerated master would fully resolve | 2x asset live; DPR2 adequately served |
| 3 | P2 | Eyebrow aligned to bar edge, not heading text | padding-inline-start: bar+gap | aligned (matches reference) |
| 4 | P3 | 3-line service titles at 390px | services 2-col breakpoint moved 360→430px | titles ≤2 lines |
| 5 | P3 | Hero retina softness | Accepted for v1 (source 1536×1024; a ≥2400px master would resolve) | recorded |
| 6 | P3 | Search Escape via shortcut returns focus to body | Accepted (standard behaviour; button path restores correctly) | recorded |

Post-fix gates: verify EXIT 0 (180/180) · e2e 57/57 · responsive sweep clean · user test 16/16 · banner overflow 0 at 320/390/1440 · heading text verified at 3 widths.
