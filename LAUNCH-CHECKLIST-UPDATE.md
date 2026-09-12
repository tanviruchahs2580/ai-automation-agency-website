# Launch Checklist — UPDATE (Operator's Console redesign)

Additions to `LAUNCH-CHECKLIST.md` introduced by the redesign. The original
checklist still applies in full; nothing below replaces it.

## R1. New business decisions (block public launch)

| # | Task | Where |
|---|------|-------|
| R1 | Font license call: Geist ships as the display face; confirm whether to license GT Walsheim and swap the two `@font-face` files | `src/app/globals.css`, `public/fonts/` |
| R2 | Real domain + contact email + meeting link (unchanged need, new surfaces): error pages, disclosure section, and footer now read `NEXT_PUBLIC_CONTACT_EMAIL` | Vercel env vars |
| R3 | Legal review of the new `/team` page stance (collective byline, no individual profiles) and the compliance-stamp wording ("Mapped · In progress" vs "Ready") | `src/app/team`, `src/app/security` |
| R4 | Confirm industry automation presets (45–60%) in the ROI calculator with a domain owner — they are labelled conservative, but they are still our numbers | `src/components/calculators/ROICalculator.tsx` |
| R5 | Decide the Cal.com/Calendly URL for the success screen + draft-save prompt (the exit-intent prompt deliberately promises no emailed link — confirm that stance) | `src/components/forms/` |

## R2. Placeholder sweep additions

Run: `grep -rniE "placeholder|todo|fixme|lorem" src/ public/ *.md`

New markers introduced by the redesign (all intentional):

- `src/lib/i18n.md` — RTL verification log is empty (pre-launch staging task)
- `src/app/team/page.tsx` — collective byline stance pending verified profiles
- `src/components/forms/ExitIntentSave.tsx` — no emailed-link promise (by design)

## R3. Post-deploy verification additions

1. PageSpeed on `/`, `/technology` (ArchitectureLandscape), `/start-a-project`.
2. Font payload: confirm ≤180 KB per-route critical path in the network panel
   (all 7 files total ~217 KB on disk; no route loads all of them).
3. `data-cta-id` hooks (`home-hero-primary-a`, `home-roi-primary-a`,
   `home-final-primary-a`, …) fire through `src/lib/analytics.ts` — verify in
   the provider before first A/B test.
4. Scroll-depth events (`scroll_25/50/75/100`) visible in analytics on `/`.
5. Exit-intent prompt: staging check with `?` — 90s dwell, desktop pointer,
   draft present → one quiet prompt per session.
6. RTL spot-check: set `dir="rtl"` on `<html>`, walk `/`, `/solutions/[slug]`,
   `/start-a-project`; record in `src/lib/i18n.md`.
