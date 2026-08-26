# Launch Checklist — VANTIQ SYSTEMS

Everything below must be completed before (or immediately after) the first
production deploy. Code-level work is done; what remains requires business
decisions and verified company data.

## 0. Completed hardening (this release)

- [x] Intake success screen no longer claims an email confirmation was sent
- [x] Wizard drafts persist to localStorage; consent never auto-restored
- [x] Select fields show a chevron affordance
- [x] Mobile menu traps keyboard focus while open
- [x] ROI calculator clamps inputs to documented ranges on blur
- [x] Internal CTAs use client-side navigation (`next/link`)
- [x] Rate limiter sweeps expired buckets (bounded memory)
- [x] App icons (512/192/apple 180) + `manifest.webmanifest`
- [x] CSP delivered in Report-Only mode (see "After launch" below)
- [x] Sitemap emits `lastModified` only where a real date exists
- [x] CI runs `npm audit --omit=dev --audit-level=high`; Dependabot weekly
- [x] Playwright suite covers chromium, firefox, webkit + mobile chromium

## 1. Business wiring (blocks public launch)

| # | Task | Where |
|---|------|-------|
| 1 | Import repo to Vercel, deploy | vercel.com |
| 2 | Domain + DNS (A/CNAME) | registrar → Vercel Domains |
| 3 | Set `NEXT_PUBLIC_SITE_URL=https://<domain>` env var | Vercel → Settings → Environment Variables |
| 4 | Verified inbox: replace `hello@vantiqsystems.example`; set SPF/DKIM/DMARC | src/data/site.ts:87 |
| 5 | Meeting link: replace `#meeting-link-placeholder` (intake picks it up automatically) | src/data/site.ts:88 |
| 6 | Brief storage: connect Resend/SendGrid email or Postgres insert at the marked integration point | src/app/api/project-brief/route.ts (STORAGE INTEGRATION POINT) |
| 7 | Legal review of Privacy / Terms / Cookie / Security, then remove their draft warnings | src/app/privacy, terms, cookie-policy, security |

## 2. Placeholder sweep — remove before flipping DNS

Run: `grep -rn "placeholder" src/ --ignore-case`

Known remaining markers (all intentional until section 1 is done):

- src/data/site.ts — brand/contact block + meeting link
- src/components/layout/Footer.tsx:19 — visible "contact details are placeholders" note
- src/app/start-a-project/page.tsx:78 — booking-link note in the sidebar
- src/data/insights.ts:9 — article authorship
- src/app/privacy/page.tsx:63 — draft warning copy

Each line above should be deleted or replaced as part of tasks 4–7.

## 3. Post-deploy verification

1. Run this repo's E2E suite against the live URL (`PLAYWRIGHT_BASE_URL` or config edit)
2. pagespeed.web.dev on `/`, `/solutions`, `/start-a-project`
3. Watch browser console for CSP reports; when clean and analytics/storage origins are known:
   rename `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in next.config.ts,
   adding provider origins (e.g. `https://plausible.io`)
4. Sentry wizard if error monitoring desired: `npx @sentry/wizard@latest -i nextjs`
5. Uptime monitor on `/` and a synthetic POST against `/api/project-brief`

## 4. Scheduled after launch

- Dependency majors: zod 4, framer-motion 13, vitest 4, eslint 10 (separate branch)
- Nonce-based CSP once inline scripts need tightening
