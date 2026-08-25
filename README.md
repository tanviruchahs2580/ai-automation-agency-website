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
- Briefs are validated and receipted but not persisted until a storage
  provider is connected (see `src/app/api/project-brief/route.ts`).

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
