# VANTIQ Systems — Brand Guide

Positioning, voice, and copy rules. Enforced in every string on the site.
Companion: `DESIGN-SYSTEM.md` (visual system).

## 1. Positioning

> **VANTIQ Systems engineers the autonomous operations layer for enterprises
> that cannot afford guesswork.**

- **Category:** AI Engineering & Automation (not "AI tools", "chatbots", or
  "consulting").
- **Audience:** Heads of Ops / CTOs / VP Eng at $50M–$5B companies in
  regulated or mission-critical industries.
- **Wedge:** "We don't sell AI. We engineer the systems that make AI
  trustworthy enough to run your operations."

Eight-second test: after 8 seconds on the homepage a visitor must be able to
say *"they build trustworthy AI systems that run business operations."*

## 2. Voice (all five, always)

- **Precise** — every number, claim, and scope statement is defensible.
- **Calm** — no exclamation marks. Ever.
- **Operator-grade** — written for people who run production systems.
- **Honest** — disclaimers visible, not buried; "example architecture" and
  "estimate, not a guarantee" stay on the page.
- **Concrete** — "Reduce manual triage by 60–80% in 90 days", not
  "drive efficiency".
- **Sparse** — fewer words, more whitespace; every sentence earns its place.

**Mandatory pattern:** specific number → timeframe → constraint.
*"Cut incident MTTR by 40–60% within one quarter, without replacing your
existing stack."*

## 3. Forbidden words

`leverage, synergize, supercharge, unlock, revolutionize, game-changing,
cutting-edge, world-class, best-in-class, next-gen, robust, seamless,
empower` — and `scalable` unless describing a verifiable system property.
Audit: `grep -rniE "leverage|synergize|supercharge|unlock|revolutionize|game-changing|cutting-edge|world-class|best-in-class|next-gen|seamless|empower" src/`
must return zero non-quoted hits before ship.

## 4. Do / don't copy patterns

| Do | Don't |
|---|---|
| "Estimate based on your inputs. Not a guarantee." | "Guaranteed 5× ROI" |
| "Example architecture — illustrative, not a client system." | Fake client logos, invented metrics |
| "Reviewed controls for SOC 2 / ISO 27001 readiness." | "Fully certified" (unless true) |
| "Including when AI is the wrong tool." | "AI for everything" |
| Mono labels, sentence case, periods on full sentences only | Exclamation marks, title-case headlines |

## 5. Reference patterns borrowed (study, don't copy)

- **Stripe** — editorial type hierarchy; code-as-content restraint.
- **Vercel** — the site itself as engineering credibility; minimal premium motion.
- **Linear** — dark-mode craft; calm-but-powerful tone → our console metaphor.
- **Anthropic** — honest non-hype copy; restrained color → our signal-green discipline.
- **Resend / dub.co** — distinctive B2B voice; docs-as-marketing confidence.
- **Raycast** — ⌘K empty-state and micro-interaction polish (recent + popular queries).
