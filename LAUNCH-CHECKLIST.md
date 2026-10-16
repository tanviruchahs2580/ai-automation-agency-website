# Launch Checklist — VANTIQ SYSTEMS

Everything below must be completed before (or immediately after) the first
production deploy. Code-level work is done; what remains requires business
decisions and verified company data.

## 0. Completed hardening (this release)

- [x] Intake success screen no longer claims an email confirmation was sent
- [x] Wizard drafts persist to localStorage; consent never auto-restored
- [x] Select fields show a chevron affordance
- [x] Mobile menu traps keyboard focus while open
- [x] Search dialog traps and restores focus, locks scroll, and its search index
      is derived from the navigation data instead of a parallel copy
- [x] Desktop nav dropdown no longer closes on keydown from its own links
- [x] Form errors are wired to their inputs (`aria-invalid` / `aria-describedby`)
- [x] ROI calculator clamps inputs to documented ranges on blur
- [x] Internal CTAs use client-side navigation (`next/link`)
- [x] Rate limiter sweeps expired buckets (bounded memory)
- [x] App icons (512/192/apple 180) + `manifest.webmanifest`
- [x] CSP delivered in Report-Only mode (see "After launch" below)
- [x] Sitemap emits `lastModified` only where a real date exists
- [x] RSS titles/excerpts are XML-escaped (a `&` in a title no longer breaks the feed)
- [x] CI runs `npm audit --omit=dev --audit-level=high`; Dependabot weekly
- [x] Playwright suite covers chromium, firefox, webkit + mobile chromium
- [x] Contact email/meeting link are env-driven (`NEXT_PUBLIC_*`) and **omitted
      when unset** — there is no longer a reserved `*.example` address or
      `#meeting-link-placeholder` href rendering as a live-looking dead end
- [x] Optional brief email delivery wired (Resend via fetch, env-gated,
      unit-tested; failure never blocks the visitor's receipt)

## 1. Business wiring (blocks public launch)

| # | Task | Where |
|---|------|-------|
| 1 | Import repo to Vercel, deploy | vercel.com |
| 2 | Domain + DNS (A/CNAME) | registrar → Vercel Domains |
| 3 | Set `NEXT_PUBLIC_SITE_URL=https://<domain>` env var (fallback chain is `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL`, so Vercel deploys resolve correctly even if this is missed) | Vercel → Settings → Environment Variables |
| 4 | Verified inbox: set `NEXT_PUBLIC_CONTACT_EMAIL` env var (+ SPF/DKIM/DMARC at your DNS). Until set, the footer omits the address and the security/error pages route to the intake form instead | Vercel env vars — no code change needed |
| 5 | Meeting link: set `NEXT_PUBLIC_MEETING_LINK` env var. Until set, the intake success screen shows only the actions that work (download / share) | Vercel env vars — no code change needed |
| 6 | Brief delivery: set `RESEND_API_KEY` + `BRIEF_NOTIFICATION_EMAIL` (+ `BRIEF_NOTIFICATION_FROM` after verifying a sender domain in Resend). For DB/CRM storage instead, persist at the marked integration point | Vercel env vars / src/app/api/project-brief/route.ts |
| 7 | Legal review of Privacy / Terms / Cookie / Security, then remove their draft warnings | src/app/privacy, terms, cookie-policy, security |

Note: tasks 4–6 are environment-configuration only. Values are
build-time-inlined (`NEXT_PUBLIC_*`) or read server-side (notification vars);
changing them later requires a redeploy of the affected type.

## 2. Placeholder sweep — remove before flipping DNS

Run: `grep -rn "placeholder" src/ --ignore-case`

Known remaining markers (all intentional until section 1 is done):

- src/data/site.ts — brand/legal-entity block
- src/data/insights.ts — shared authorship byline
- src/app/privacy/page.tsx, src/app/terms/page.tsx,
  src/app/cookie-policy/page.tsx, src/components/ui/DraftBanner.tsx —
  legal draft warnings

Each line above should be deleted or replaced as part of tasks 4–7. The
contact-channel placeholders in `src/components/layout/Footer.tsx` and
`src/app/start-a-project/page.tsx` listed here previously were already removed.

## 3. Post-deploy verification

1. Run this repo's E2E suite against the live URL:
   `PLAYWRIGHT_BASE_URL=https://<domain> npx playwright test`
   (no local web server is started when a target URL is supplied)
2. pagespeed.web.dev on `/`, `/solutions`, `/start-a-project`
3. Watch browser console for CSP reports; when clean and analytics/storage origins are known:
   rename `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in next.config.ts,
   adding provider origins (e.g. `https://plausible.io`)
4. Sentry wizard if error monitoring desired: `npx @sentry/wizard@latest -i nextjs`
5. Uptime monitor on `/` and a synthetic POST against `/api/project-brief`

## 4. Scheduled after launch

- Dependency majors: zod 4, framer-motion 13, vitest 4, eslint 10 (separate branch)
- Nonce-based CSP once inline scripts need tightening
