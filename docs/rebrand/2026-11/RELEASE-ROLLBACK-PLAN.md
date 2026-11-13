# RELEASE-ROLLBACK-PLAN — ARKYON rebrand release candidate

## 1. Candidate identity

- **Branch:** `feat/arkyon-rebrand-frontend-v3` (local; NOT pushed — push/PR/merge require owner approval per DECISIONS D-09)
- **Base:** `27b566cca1c2a7de3e5cb39a0485f6165390ac01` (main, verified == origin/main at Phase 0)
- **Head:** see `git rev-parse HEAD` at handover (recorded in RELEASE-READINESS.md)
- **Build:** production build verified locally (97/97 pages); CI will re-run the same gates on push
- **Lockfile:** unchanged from base (zero dependency changes — verified: package.json/package-lock.json not in the rebrand diff)

## 2. Environment parity

| Variable (names only — values never recorded here) | Local/preview | Production |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | unset (localhost canonicals — build-time note only) | owner-set; **must remain the existing verified origin** (F-11 pending custom-domain decision) |
| `NEXT_PUBLIC_BRAND_NAME` | unset → defaults to ARKYON | if set, must be `ARKYON` (a different value now triggers a build warning by design) |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_MEETING_LINK` | unset → channels omitted honestly | owner-set at launch |
| `RESEND_API_KEY` / `BRIEF_NOTIFICATION_EMAIL` / `BRIEF_NOTIFICATION_FROM` | unset → receipt-only submissions | owner-set; unchanged by this rebrand |
| `CSP_MODE` | unset (Report-Only) | owner decision (THREAT-MODEL residual risk 1) |
| `NEXT_PUBLIC_LEGAL_REVIEWED` | unset → DraftBanner shows | owner/legal action pending |

Runtime: local Node v24.19.0 / CI Node 22 / Vercel's Next runtime — repo engines pin `>=22`. No runtime-version change in this rebrand.

## 3. Preview validation (before any production promotion)

1. Open the Vercel preview deployment for the PR.
2. Route smoke: `/`, `/solutions`, one `/services/[slug]`, one `/industries/[slug]`, `/work/[slug]`, `/insights/[slug]`, `/ai-readiness`, `/roi-calculator`, `/start-a-project`, `/privacy` (DraftBanner present), 404 page.
3. Verify brand surfaces: header/footer wordmark, browser tab favicon, `<title>` suffix "— ARKYON", og:image (view `https://<preview>/opengraph-image`), manifest.
4. Console/network: no errors, no requests to non-self origins (CSP report payload may show notice — same as baseline).
5. Form validation with **synthetic data only**; verify receipt renders. Preview must not have `RESEND_API_KEY` configured unless the owner explicitly wants test emails in a sink they control — **never the production notification address**.
6. Responsive spot-check 1440/390; light+dark theme toggle; ⌘K search; Escape behaviours.
7. Confirm preview `robots`/`X-Robots-Tag` behaviour prevents indexing of preview URLs (Vercel default) — verify header on the preview host.

## 4. Migration impact

**None.** No database, no schema, no content-store migration exists (verified: no persistence layer in the app; storage integration point in the API route is marked and unused). The only "migration" is client-side: returning visitors' localStorage keys are read once from their legacy names and re-persisted under the new names automatically (D-01). No server action required, no ordering constraints, no backup step needed beyond the platform's own deployment history.

## 5. Rollback plan

- **Method (confirmed for Vercel's GitHub-integration model):** promote the previous production deployment from the Vercel dashboard (Deployments → prior production deployment → **Promote to Production** / Instant Rollback). Vercel keeps production deployment history; this is the platform's built-in rollback and requires no repo operation.
- **Last known-good state:** production deployment of `27b566c` (the current live site, verified serving during Phase 0 capture).
- **Trigger criteria (any one):** production smoke fails on any core route; lead-capture receipt fails; brand surfaces render old/missing identity; a11y-critical regression reported by the post-deploy checks; error rate/health anomaly attributable to the release.
- **Expected impact of rollback:** instant reversion to the pre-rebrand site; visitors who already migrated storage keys keep their preferences (the pre-rebrand code reads only legacy keys — values were **written back to the legacy key names** … correction: new code writes only NEW keys; after a rollback, returning visitors' theme/consent set post-release would be missed by pre-rebrand code. Impact: affected visitors see the consent banner again — safe-side failure, never an unintended-consent failure. Documented as accepted).
- **Verify restoration:** homepage serves VANTIQ identity, sitemap 51 locs, intake receipt works (synthetic data).

## 6. Post-deployment smoke plan (executes only after owner authorises production release)

1. Homepage + one route per family HTTP 200 within timeout; title suffix "— ARKYON".
2. Favicon/manifest/OG endpoints respond 200 with new assets.
3. Intake: ONE synthetic submission (owner-approved text), receipt renders; confirm **no** unexpected notification to a real inbox (or confirm the intended sink received exactly one).
4. sitemap.xml 51 locs; robots.txt unchanged rules; feed.xml items = 6 with ARKYON identity.
5. Console error sweep on `/` and `/start-a-project`.
6. Error-rate/health: Vercel deployment health + any owner-configured monitoring — **no background monitoring is promised; observation ownership is the owner's** during the first 24–48h window.

## 7. Release record (to be filled by owner at release time)

Deployment ID/time, environment, SHA, smoke results, incidents, rollback decision, unresolved issues: `_recorded by owner at release_`.
