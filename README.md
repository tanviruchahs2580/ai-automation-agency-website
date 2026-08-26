# VANTIQ SYSTEMS — Enterprise AI Engineering & Automation Website

Production website for VANTIQ SYSTEMS, an AI Engineering & Automation company:
solutions, services, industries, interactive AI readiness assessment, ROI
calculator and project intake.

## Stack

- Next.js (App Router) · TypeScript · React
- Tailwind CSS design system · Framer Motion
- Zod-validated server-side forms · Vitest unit tests

## Getting started

```bash
npm install
npm run dev      # development server
npm run build    # production build
npm test         # unit tests
npm run lint     # eslint
```

## Environment

Copy `.env.example` to `.env` and set:

- `NEXT_PUBLIC_SITE_URL` — canonical origin used for metadata, canonical URLs,
  sitemap.xml and robots.txt. Unset, it falls back to `http://localhost:3000`
  so nothing is published against a domain that is not owned yet.

## Operations notes

- The intake endpoint `POST /api/project-brief` rate limits per client IP read
  from `x-forwarded-for`. Deploy behind a proxy or platform that overwrites
  this header (Vercel, Nginx, Cloudflare) so it cannot be spoofed.
- Brief delivery is configuration-gated: set `RESEND_API_KEY` and
  `BRIEF_NOTIFICATION_EMAIL` in the host environment and accepted briefs are
  emailed automatically (`src/lib/brief-notification.ts`, plain fetch, no SDK).
  Notification failure never blocks the visitor's receipt. For database/CRM
  storage, persist at the marked integration point in
  `src/app/api/project-brief/route.ts`.
- Public contact details are env-driven (`NEXT_PUBLIC_CONTACT_EMAIL`,
  `NEXT_PUBLIC_MEETING_LINK`) — build-time inlined, so changing them requires
  a redeploy. See `.env.example`.

## Testing

```bash
npm test           # unit tests (vitest)
npm run test:e2e   # browser E2E + axe accessibility scans (Playwright, chromium)
```

E2E runs against the production build (`next start`) and covers navigation,
mobile menu, ROI calculator, readiness assessment, the full intake wizard
submission and WCAG 2.x A/AA axe scans on key pages.

## CI/CD

GitHub Actions runs two jobs on every push/PR to `main`:

- `quality` — lint, unit tests, production build, typecheck
- `e2e` — production build + full Playwright suite (failure artifacts uploaded)
