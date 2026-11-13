# CONTENT-MIGRATION-MAP — VANTIQ → ARKYON (Phase 3)

URL policy: **all 51 public paths, all utility endpoints and the API route are unchanged** (D-07). No redirects required. Sitemap/robots/canonical origins continue from `SITE_URL` resolution unchanged.

## Copy disposition by surface

| Surface | Disposition | Notes |
|---|---|---|
| Brand lockup / wordmark | REPLACED | `ARKYON` via `siteConfig` (single source); keystone mark replaces the V-mark |
| Page title suffix | REPLACED | "— ARKYON" via derived `shortName` (mechanism unchanged) |
| Meta descriptions / OG / JSON-LD / RSS identity / manifest | REPLACED | All read `siteConfig`; no literal edits were needed outside the source module + OgCard palette |
| Hero H1 + lead | KEPT (one word changed) | Positioning line retained; lead now reads "ARKYON designs, engineers…" via `proseName` |
| All section/page copy | KEPT | The existing voice system (BRAND-GUIDE) is carried into ARKYON-BRAND-STRATEGY unchanged; disclosures stay single-sourced in `disclaimers.ts` |
| Legal pages | KEPT | DraftBanner remains until `NEXT_PUBLIC_LEGAL_REVIEWED` (owner action pending) |
| 404 console strings | REPLACED | `$ arkyon route --resolve` / `$ arkyon search --site` |
| Storage keys | MIGRATED w/ fallback | D-01; legacy keys read once, new keys written |
| Download filename | REPLACED | `arkyon-brief-<PB-id>.txt` |
| Favicon / icons / OG cards | REGENERATED | Keystone mark, copper palette |

## Claims carried forward

All claims, metrics and disclaimers are carried forward **verbatim** (see CONTENT-CLAIMS-REGISTER.md): no new numbers, no new projects, no new people, no certification language. The rebrand changes who says it (ARKYON), not what is claimed.

## Localisation

Single-language site (en-US, `locale: en_US`), verified during audit — no hreflang/canonical locale work applies. US-English copy-hygiene test continues to enforce conventions.

## Post-rename cleanup ledger

- Legacy storage-key fallbacks (`vantiq-theme`, `vantiq-cookie-consent`, `vantiq-recent-searches`, `vantiq:intake-draft:v1`) remain **only** as read-fallbacks in code, documented in DECISIONS D-01/D-12. Owner may remove them after a grace period (they exist solely so returning visitors keep their state).
- Historical documents (this folder, git history, old audit docs) retain accurate historical naming.
