# Launch Checklist

Everything below must be completed before (or immediately after) the first
production deploy. Code-level work is done and gated in CI; what remains
requires business decisions and verified company data.

Verify the code-level claims in this file with `npm run verify` and
`npm run test:e2e` rather than taking them on trust.

## 0. Completed hardening

### Audit remediation (this release)

- [x] Six dependency advisories cleared; `npm audit` reports **0 vulnerabilities**
      including dev. Next 16.4.3 (was 16.3.8), zod 4.6.7 (was 3.25.76), vitest 5.
      CI's own audit gate was failing on `main` before this.
- [x] Brand name has exactly one source. `NEXT_PUBLIC_BRAND_NAME` sets all three
      forms (lockup, prose, title suffix) by derivation, so a rename is one
      environment variable — verified by unit tests that exercise the derivation
      rather than the current value.
- [x] `og:image` and `twitter:image` on **every** indexable route (was 1 of 52).
      Per-family cards are generated from this site's own content for insights,
      work, solutions, services and industries.
- [x] Primary button clears WCAG AA at every gradient stop (was 2.89:1 in dark,
      4.10:1 in light), enforced by a test that parses the stylesheet.
- [x] Every form control has a visible boundary at ≥3:1 (WCAG 1.4.11) via a
      dedicated `--color-field` token distinct from decorative hairlines. The
      first pass fixed only the intake wizard; `form-controls.test.ts` now scans
      every `<input>`/`<select>`/`<textarea>` opening tag so a control cannot
      keep the hairline while the token test still passes.
- [x] **Every route renders its content without JavaScript.** Two separate
      mechanisms were deferring content behind a JS reveal and both are gone:
      the four `loading.tsx` files made Next emit each page as a Suspense
      fallback with the real content in an inert `<template>`, and a
      `next/dynamic` call with a `loading` option serialized the architecture
      scene into a `<div hidden>`. Asserted by
      `e2e/quality.spec.ts` across 18 routes (computed-style walk, not
      `toBeVisible`, which treats `opacity: 0` as visible) and by
      `npm run check:rendered`, which detects both signatures.
- [x] `h1 → h3` outline gaps fixed on five index routes; the axe gate now runs
      the best-practice rules it previously excluded and fails on any impact.
- [x] Hero type scale reduced so the headline and the primary CTA fit above the
      fold at 1440×900 and on a 390×844 phone — measured, not assumed.
- [x] Cookie banner no longer covers the back-to-top button; the banner
      publishes its measured height and fixed controls lift above it.
- [x] Framer Motion loads the `domAnimation` feature set only (was the full
      build, including projection/drag/layout code this site never uses), and
      the intake vocabulary left the zod module. First-load JS on `/`:
      **193.8 KiB → 177 KiB gzip**.
- [x] Font families deduplicated to one file each (the 400 and 500 binaries were
      byte-identical), with the two above-the-fold faces preloaded.
- [x] Intake rate limiting keyed on a proxy-attested address; the left-most
      `x-forwarded-for` entry is no longer trusted (it was spoofable, which
      allowed an unlimited bypass), with a 64 KiB body cap. A filled honeypot
      now receives an ordinary receipt and is never emailed, rather than a 422
      naming the trap — verified at the route level in `api-project-brief.test.ts`
      and over HTTP.
- [x] Brand, disclosure copy and derived counts each have one home, enforced by
      tests. Three brand capitalisations and four wordings of the same
      disclosure are reduced to one of each.
- [x] Repo governance: branch protection on `main` with required CI checks,
      Dependabot security updates, secret scanning and push protection enabled,
      `LICENSE`, `SECURITY.md`, `CODEOWNERS`, PR and issue templates.
- [x] Dead code removed: the unreferenced `messages/en.json` catalogue, the
      decorative case-study diagram, the insight cover pattern that never
      rendered, four `loading.tsx` skeletons, and two content fields nothing read.
      The case-study cards now show the architecture's own layer names instead of
      a seeded curve, and the insight cards carry a category rule.
- [x] Budgets and rendered-output invariants are enforced in CI by
      `npm run check:budget` and `npm run check:rendered`.

### Earlier hardening (still in place)

- [x] Intake success screen does not claim an email confirmation was sent
- [x] Wizard drafts persist to localStorage; consent never auto-restored
- [x] Mobile menu traps keyboard focus while open
- [x] Search dialog traps and restores focus, locks scroll, has a visible close
      button at every width, and its search index derives from navigation data
- [x] Form errors are wired to their inputs (`aria-invalid` / `aria-describedby`)
- [x] Rate limiter sweeps expired buckets (bounded memory)
- [x] App icons (512/192/apple 180) + `manifest.webmanifest`
- [x] Sitemap emits `lastModified` only where a real date exists
- [x] RSS titles/excerpts are XML-escaped, with `<link rel="alternate">`
      autodiscovery in `<head>`
- [x] Structured data: Organization `logo`, Article `image` + `publisher.logo` +
      `dateModified`, Offer `priceCurrency`
- [x] Playwright suite covers chromium, firefox, webkit + mobile chromium
- [x] Contact email/meeting link are env-driven and **omitted when unset**
- [x] Optional brief email delivery wired (Resend via fetch, env-gated,
      unit-tested; failure never blocks the visitor's receipt)

## 1. Business wiring (blocks public launch)

| # | Task | Where |
|---|------|-------|
| 1 | Import repo to Vercel, deploy | vercel.com |
| 2 | Domain + DNS (A/CNAME) | registrar → Vercel Domains |
| 3 | Set `NEXT_PUBLIC_SITE_URL=https://<domain>` (fallback chain is `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL`). **A production build without it now prints a loud warning** and would publish `http://localhost:3000` as every canonical | Vercel → Settings → Environment Variables |
| 4 | **Decide the brand name** and set `NEXT_PUBLIC_BRAND_NAME`. The placeholder collides with an existing enterprise AI vendor, and a production build without this var prints a warning. Nothing else in the codebase hard-codes the name — this is the only change required | Vercel env vars — no code change needed |
| 5 | Verified inbox: set `NEXT_PUBLIC_CONTACT_EMAIL` (+ SPF/DKIM/DMARC). Until set, the footer omits the address and the security/error pages route to the intake form | Vercel env vars — no code change needed |
| 6 | Meeting link: set `NEXT_PUBLIC_MEETING_LINK`. Until set, the intake success screen shows only the actions that work | Vercel env vars — no code change needed |
| 7 | Brief delivery: set `RESEND_API_KEY` + `BRIEF_NOTIFICATION_EMAIL` (+ `BRIEF_NOTIFICATION_FROM` after verifying a sender domain). Without `BRIEF_NOTIFICATION_FROM` the sender falls back to Resend's shared test address, which only delivers to the account owner — set it before relying on delivery | Vercel env vars / src/app/api/project-brief/route.ts |
| 8 | Legal review of Privacy / Terms / Cookie / Security, then remove their draft warnings | src/app/privacy, terms, cookie-policy, security |
| 9 | Settle the compliance-stamp wording in `src/app/security/page.tsx` and `src/app/industries/[slug]/page.tsx` ("Mapped · In progress" vs "Ready") against what the business can actually attest | code + legal |
| 10 | Publish at least one verifiable fact a buyer can check independently — a named engagement, headcount, founding year, founder, or office. Every claim on the site is currently self-authored | content |
| 11 | ROI preset assumptions are ours, not sector benchmarks. Confirm them or label them differently | src/data/roi-presets.ts |
| 12 | Note that `CaseStudy.isExampleArchitecture` now drives the badge and the honesty note, so a study can only be published as verified by changing that flag **and** adding outcome metrics — the schema has no metrics field yet | src/data/case-studies.ts |

Tasks 3–7 are environment configuration only. `NEXT_PUBLIC_*` values are
build-time inlined; changing them requires a redeploy.

## 2. Placeholder sweep — remove before flipping DNS

Run: `grep -rn "placeholder" src/ --ignore-case`

Known remaining markers (all intentional until section 1 is done):

- `src/data/site.ts` — brand placeholder block (task 4)
- (none) the `src/data/insights.ts` byline — it is derived from `siteConfig` and
  is no longer a placeholder to delete; removing it would break the byline and
  the team page's claim to share it
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`,
  `src/app/cookie-policy/page.tsx`, `src/components/ui/DraftBanner.tsx` —
  legal draft warnings (task 8)

## 3. Post-deploy verification

**Already run against the deployment** (`#17`, merged and live):

- Accessibility suite at production (`PLAYWRIGHT_BASE_URL=… npx playwright test --project=chromium-desktop e2e/a11y.spec.ts`) — 16 passed, including the 16-route axe sweep and the 20-route document-structure scan
- `npm run check:journey` with `JOURNEY_BASE` — 22/22 steps, including a real intake submission returning a reference ID
- `npm run check:rtl` with `RTL_BASE` — 24/24 route×width combinations, no overflow
- `npm run check:vitals` with `METRICS_BASE` — worst LCP **1072ms**, worst CLS **0.0276**, both inside budget
- Rendered-output and metadata spot checks: `og:image` on every sampled route, correct heading outline, no deferred-content shells, sitemap 51 URLs, feed `200 application/rss+xml`, all five new security headers present

**Note on the canonical origin.** Canonicals, the sitemap and the social cards
resolve to `ai-automation-agency-website-lilac.vercel.app` — the origin Vercel
reports as the project's production URL, used because `NEXT_PUBLIC_SITE_URL` is
unset. That is the fallback chain working as designed rather than the localhost
bug it was built to prevent, but it should point at the real domain before the
site is promoted publicly.

**Still to run after the domain is live:**

1. Run the E2E suite against the live URL:
   `PLAYWRIGHT_BASE_URL=https://<domain> npx playwright test`
   (no local web server is started when a target URL is supplied)
2. `npm run check:rendered` locally against a production build, then confirm
   canonicals resolve to the real domain rather than a `*.vercel.app` alias
3. pagespeed.web.dev on `/`, `/solutions`, `/start-a-project` — the budgets are
   met in lab measurement (`check:vitals`); Lighthouse scores and CrUX field data
   are the remaining check, and both need a public domain
4. Watch the console for CSP reports. When clean and the analytics/storage
   origins are known, set `CSP_MODE=enforce` — a configuration change, no code
   edit, though a nonce-based `script-src` is worth doing first since the policy
   still carries `'unsafe-inline'`
5. Sentry wizard if error monitoring is wanted: `npx @sentry/wizard@latest -i nextjs`
6. Uptime monitor on `/` and a synthetic POST against `/api/project-brief`
7. Confirm the Vercel project is gated on the CI check (Vercel → Settings → Git),
   otherwise a push deploys regardless of CI status — the workflow comment now
   states this limitation rather than claiming a guarantee it cannot provide

## 4. Scheduled after launch

- Dependency majors: framer-motion 13, eslint 10, TypeScript 7 (separate branch,
  one at a time)
- Nonce-based CSP, then `CSP_MODE=enforce`
- Wire a real analytics provider — `src/lib/analytics.ts` currently dispatches to
  a documented hook point and measures nothing, which the cookie banner's copy
  already states
- Insights publishing cadence: the newest article is dated 2026-07-14
- Content interface localization, if a second locale is ever wanted
  (`src/lib/i18n.md` has the checklist, including the RTL pass that has not been run)
- Replace this repository's historical QA captures with a current set, or keep
  relying on the tests named in `docs/qa/README.md`
