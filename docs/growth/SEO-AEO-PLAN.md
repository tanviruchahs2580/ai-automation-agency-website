# ARKYON — SEO / AEO / Visitor-Growth Plan (full-proof, phased)

Prepared 2026-11-14 · Current condition audited live (production `27fb114`) · Domain purchase in process
Companion code change on branch `feat/seo-aeo-discoverability` (llms.txt + schema audit).

## 0. Current condition — audited (what is already strong)

| Parameter | State | Evidence |
|---|---|---|
| Sitemap | 51 routes, real lastModified on insights | `/sitemap.xml` (51 locs) |
| Robots | allow-all − `/api/`, sitemap declared | `/robots.txt` |
| Canonicals | every indexable route (origin from `SITE_URL` chain) | check:rendered gate |
| OG/Twitter cards | every route + per-page images | check:rendered gate |
| JSON-LD | Organization (+description, knowsAbout), WebSite, Service, **FAQPage**, **Article**, BreadcrumbList, SoftwareApplication+Offer — verified live on every family | curl `@type` audit 2026-11-14 |
| RSS | ARKYON — Insights, autodiscovery | `/feed.xml` |
| Performance | Local lab LCP 560ms / CLS ~0; prod lab LCP 356ms–3.5s (first-hit TTFB-dominated, geo/cold-start — not a code defect; re-measure post-domain via CrUX) | check:vitals runs |
| Accessibility | WCAG 2.2 AA automated + machine-checked contrast (both themes) | axe suite + contrast.test (25) |
| Security | HSTS, XFO, nosniff, CSP-Report-Only, rate limit, honeypot | headers + tests |
| llms.txt (AEO) | **NEW in this branch** — curated markdown map for LLM crawlers | `/llms.txt` |
| Analytics | Consent-gated plumbing exists; **no provider wired** | analytics.ts |

## Phase 1 — Domain launch (the highest-impact event; owner actions)

1. Vercel → add the purchased domain; set `NEXT_PUBLIC_SITE_URL=https://<domain>` (canonicals, sitemap, RSS, OG, JSON-LD all switch automatically — one env var).
2. Force apex↔www choice once (pick one canonical; Vercel 301s the other).
3. **Google Search Console**: create a *Domain* property, verify via DNS TXT, submit `/sitemap.xml`, request indexing for the 10 money pages. Also **Bing Webmaster Tools** (import from GSC) — Bing feeds ChatGPT/Copilot search, so it is an AEO step, not just SEO.
4. Keep the vercel.app URL live (no harm); do not canonicalise to it.
5. DNS: A/CNAME per Vercel + TXT for GSC; enable HSTS preload already sent.
6. Re-run `check:vitals` + CrUX after 2–4 weeks of real traffic.

## Phase 2 — Technical SEO backlog (all currently green; keep green)

Enforced by CI on every PR: rendered invariants (canonical/OG/RSS), budgets, rendered-hidden-content ban, duplicate-id ban. Rule: **no PR merges with a red gate** — that is the whole maintenance plan.

## Phase 3 — AEO / GEO (being the answer, not just a result)

1. **llms.txt** shipped (this branch) — keep it regenerated when routes change (it is generated from the same data modules, so it cannot drift).
2. Answer-shaped content: each insight should open with a 2–3 sentence direct answer to its title question, then depth — answer engines lift quotable blocks.
3. Keep FAQPage schema tied to on-page FAQs (already enforced by single-source data).
4. Entity consistency: identical name/positioning everywhere (siteConfig single source; no suffix variants — enforced by brand tests).
5. Get into comparison/roundup contexts ("AI automation agencies") — being *mentioned and described* on third-party pages is what answer engines quote.

## Phase 4 — Content engine (the real crowd-driver)

1. Cadence: **2 insights/month** (existing voice rules; 6 exist today).
2. Topic clusters: each solution page gets 2–3 supporting articles linking back (e.g. "AI agents" → least-privilege tools ✓ exists, agent evaluation, agent cost model).
3. Tools as link magnets: ROI calculator + readiness assessment are genuinely useful — cite them in communities.
4. Industry pages: add one verifiable proof block each over time (example architectures are labelled — never fake clients).
5. Publication dates + RSS already flow to aggregators automatically.

## Phase 5 — Measurement (decide once, then never fly blind)

1. GSC + Bing WMT (Phase 1) — the free, consent-free baseline.
2. Analytics provider: **recommend a cookieless one (e.g. Plausible or Vercel Analytics)** — with no consent banner burden and honest copy update. Requires owner decision + a small wiring task (`window.__arkyonAnalytics` dispatch + CSP allow-list + banner copy truthfully updated). NOT wired now (privacy/provider decision is yours).
3. UTMs on every outbound post; single intake receipt-id already gives lead attribution.

## Phase 6 — Distribution (B2B reality)

1. LinkedIn: founder/engineering posts per insight (B2B channel #1).
2. GitHub: small open-source utilities from real work → profile links.
3. Communities (r/automation, Hacker News "Show HN", BD founder groups): answer questions, cite the tools.
4. Launch moment: "we're live on <domain>" post + submit to AI-agency directories only after legal entity is confirmed.
5. Backlinks: partner/vendor pages, client domains when real engagements exist (none today — do not fabricate).

## Phase 7 — KPIs and cadence

- Weekly: GSC impressions/CTR for top 20 queries; fix any coverage errors.
- Monthly: 2 insights published; 1 cluster interlink review; vitals spot-check.
- Quarterly: full audit re-run (this audit's commands), schema validation (Rich Results test), content pruning.
- 6-month targets (realistic): 20+ insights, all 51 pages indexed, 5+ answer-engine citations of the tools, first organic intake leads attributable via receipt IDs.

## What we deliberately did NOT do (honesty)

- No SearchAction/sitelinks schema: there is no `/search` URL page (and Google retired the sitelinks box) — adding it would be fake.
- No analytics provider wired without your provider/privacy decision.
- No sameAs social links: no verified profiles exist yet.
- No invented keywords/metrics/copy anywhere.

## In-scope fixes shipped in this branch

`/llms.txt` route (generated from real data modules; cannot drift) · verified the full schema audit table above · prod lab vitals recorded as baseline. Everything else in this document is sequenced for owner execution or post-domain phases.
