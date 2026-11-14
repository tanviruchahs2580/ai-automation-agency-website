# ROUTE-INVENTORY — baseline (verified 2026-11-13, HEAD `27b566c`)

Source: `src/app` tree + `sitemap.ts` + live prod sitemap (51 locs, matches). All dynamic families are SSG via `generateStaticParams` over typed TS data in `src/data/` (no CMS).

## Counts

- Static pages: **17** · Dynamic detail pages: **34** (solutions 6, services 7, industries 12, insights 6, work 3) · **Indexable total: 51**
- Utility/SEO endpoints: sitemap.xml, robots.txt, manifest.webmanifest, feed.xml, root + per-slug opengraph-image (34+1), favicon.ico/icon.svg/icon.png/apple-icon.png
- API: `POST /api/project-brief` (1)
- Redirects: `/path/` → `/path` 308 via `src/proxy.ts` (Next 16 middleware). No next.config redirects.

## Static pages

| Path | Family | Purpose | Primary CTA | Disposition |
|---|---|---|---|---|
| `/` | Home | Identity + capability system | Start a Project | REDESIGN |
| `/solutions` | Listing + OpportunityFinder | Match goal→solution | — | REDESIGN (KEEP finder behaviour) |
| `/services` | Listing | Engagement scope | — | REDESIGN |
| `/industries` | Listing (12) | Sector relevance | — | REDESIGN |
| `/work` | Listing (3) | Reference architectures | — | REDESIGN |
| `/insights` | Listing (6) | Articles explorer | — | REDESIGN |
| `/approach` | Company | Delivery method | — | REDESIGN |
| `/technology` | Company | Stack/architecture map | — | REDESIGN |
| `/about` | Company | Philosophy/standards | — | REDESIGN |
| `/team` | Company | Shared byline model | — | REDESIGN |
| `/security` | Trust | Controls + honest compliance vocab | — | REDESIGN |
| `/ai-readiness` | Tool | 10-question assessment, local scoring | Discuss My Result | REDESIGN (KEEP logic) |
| `/roi-calculator` | Tool | ROI model + presets, `?industry=` | Validate With An Engineer | REDESIGN (KEEP math) |
| `/start-a-project` | Tool | 7-step intake wizard → API | Submit | REDESIGN (KEEP contract) |
| `/privacy` `/terms` `/cookie-policy` | Legal | Policies + DraftBanner until `NEXT_PUBLIC_LEGAL_REVIEWED` | — | REDESIGN chrome, REVIEW copy |

## Dynamic templates × records (all 34 records enumerated)

- `/solutions/[slug]` (6): ai-agents, workflow-automation, ai-software, enterprise-ai, private-ai, ai-transformation
- `/services/[slug]` (7): ai-strategy, ai-engineering, automation, software-engineering, data-ai-infrastructure, security, ai-operations
- `/industries/[slug]` (12): financial-services, healthcare, manufacturing, retail, logistics, agriculture, education, real-estate, professional-services, saas-technology, government, energy — ROI presets on 6 of 12
- `/insights/[slug]` (6): why-most-ai-pilots-never-reach-production, designing-agent-tools-least-privilege-in-practice, rag-without-the-hype-what-retrieval-actually-fixes, the-economics-of-model-routing, prompt-injection-honest-threats-honest-defenses, choosing-what-to-automate-first (slugify(title), shared teamByline)
- `/work/[slug]` (3): invoice-processing-operations, support-triage-agents, private-knowledge-platform — all `isExampleArchitecture: true` (honesty label + disclaimer)

Coverage method: all 34 records must resolve in `next build` (97 pages) + `check:rendered`; visual representatives per family ≥ 2 content shapes (with/without preset, long/short title).

## Nav/link coverage notes (audit findings)

- Header dropdown lists only 6 of 12 industries (agriculture, education, real-estate, professional-services, government, energy reachable only via index/sitemap) — SHOULD fix.
- Footer derives from siteNav + explicit columns; RSS linked; tools column present.
- `/start-a-project` is the dominant CTA (22 literal hrefs + template links).
