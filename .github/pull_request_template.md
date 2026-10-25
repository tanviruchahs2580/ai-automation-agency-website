## What changed

<!-- One or two sentences. What is different for the visitor or the operator? -->

## Why

<!-- The problem this solves. Link the audit item or issue if there is one. -->

## How it was verified

<!--
  Tick what actually ran, and paste the output of anything that failed. A red
  gate reported honestly is worth more than a green claim.
-->

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run check:rendered` — og:image, no hidden content, no duplicate ids
- [ ] `npm run check:budget` — JavaScript and CSS budgets
- [ ] `npm run test:e2e` — cross-engine

## Checklist

- [ ] No new hard-coded brand strings (import `siteConfig` from `@/data/site`)
- [ ] No new server-rendered `opacity: 0` (use `useMotionGate`)
- [ ] New colours are tokens, and contrast is covered by `contrast.test.ts`
- [ ] Copy is US English, and any count in a heading is derived from data
- [ ] No claim added that cannot be substantiated (see the honesty rules in
      `BRAND-GUIDE.md`); nothing labelled as a client result unless it is one
- [ ] If a budget in `scripts/check-budget.mjs` was raised, the reason is in the
      diff
