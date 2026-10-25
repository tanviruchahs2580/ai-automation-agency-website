# QA evidence

## What in here is current, and what is a historical record

`final/` and `verify/` — captures from the design and navigation passes, used to
review those changes. **They are a historical record, not a description of
`HEAD`.** Source has moved since: the nav was reduced to seven items, the
insights index gained an "All" filter with counts, the hero type scale was
reduced so the primary CTA fits above the fold, the primary button gradient was
darkened to clear WCAG AA, the decorative "schematic strip" was replaced with a
scale motif, and the footer no longer renders a `*.example` address. A capture
showing any of the old behaviour is stale evidence.

`renovation/` — the design-history record for the Operator's Console redesign,
and `audit2*/` — the pre-renovation audit sweep. Both are historical.

Two captures in the historical sets were actively misleading.

- `renovation/home-cta-dark-1440.png` is not the homepage CTA section. It is a
  near-duplicate of `home-roi-dark-1440.png` (181,611 vs 181,613 bytes,
  identical viewport), because `renovation/shoot.mjs` scrolled to
  `text=Start a project`, which matches the *header* button — already on screen,
  so no scroll happened and the intended section was never captured. The
  homepage's final CTA and footer were therefore never recorded in that set. The
  root cause is fixed in the script; the file is kept because deleting a
  tracked historical capture to tidy a folder is worse than labelling it.
- `docs/qa/audit2/home-v11.png` — a fully unstyled footer render (default blue
  links) captured mid-hydration and committed beside the styled one. Removed.

One capture is retained and is genuinely a pass: `audit2/console-log.json` and
`audit2-rm/console-log.json` are empty arrays across 20 routes each.

## What to use instead

Behaviour is now asserted by tests rather than by screenshots:

| Concern | Where it is checked |
|---|---|
| Rendered output: `og:image`, canonicals, no server-hidden content, no duplicate ids | `npm run check:rendered` |
| JavaScript and CSS budgets | `npm run check:budget` |
| Contrast, including gradient stops and control boundaries | `src/lib/__tests__/contrast.test.ts` |
| Document structure (heading order, landmarks, duplicate ids) | `e2e/a11y.spec.ts`, "document structure" |
| Content visible without JavaScript (18 routes, walking the ancestor chain for computed opacity/visibility/display), overlay collisions, above-the-fold CTA, 320px overflow | `e2e/quality.spec.ts` |
| Form controls use the contrast-passing field token | `form-controls.test.ts` |
| Intake endpoint: receipt, honeypot, body cap, rate limit, no-store | `api-project-brief.test.ts` |
| Content deferred behind a Suspense boundary or hidden container | `npm run check:rendered` |
| Brand and disclosure strings having one home | `brand.test.ts`, `disclaimers.test.ts` |
| Cross-references, spelling, voice, derived counts | `content-integrity.test.ts` |

`npm run verify` runs every source-level gate in order. `npm run test:e2e` runs
the browser-level ones across four Playwright projects.

## The measurement scripts

`measure-*.mjs`, `check-*.mjs` and `shoot-*.mjs` are the interactive tools used
during the audit and renovation. They print to stdout and are not wired into CI
(deliberately — they need a running server and a browser, and their value is
exploratory). If you run one, record its output somewhere that survives, because
the problem with this folder was never the scripts; it was that no result from
them was ever written down, so a claim like "no reveal flash" rested on a
screenshot that tested something else.
