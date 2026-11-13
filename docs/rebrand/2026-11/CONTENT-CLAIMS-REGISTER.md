# CONTENT-CLAIMS-REGISTER — every material public claim, its source and status

Status vocabulary: VERIFIED (reproducible in repo), INFERRED, PROPOSED. Owner-approval column: whether publishing as-is needs an owner fact-check.

| # | Claim / surface | Where | Current treatment | Status | Action for ARKYON |
|---|---|---|---|---|---|
| C-01 | "Triage effort removed 60–80% — 90-day model", "MTTR removed 40–60% — one-quarter model", "3–6× first-year return" | Home ROI teaser (`src/app/page.tsx` `roiTeaserMetrics`) | Explicitly labelled "model" in each label; `modelRangesLabel` = "Illustrative model outputs — not client results"; gauge bands note | VERIFIED (labelled) | KEEP wording; no client-result implication. Do not add case-study numbers |
| C-02 | ROI calculator outputs | `/roi-calculator` | `estimateNote` disclaimer: "indicative estimate… not a financial guarantee… 48 weeks, 2,080 hours" | VERIFIED (labelled) | KEEP |
| C-03 | Readiness score meaning | `/ai-readiness` | `readinessNote`: "indicative estimates derived from self-reported answers, not an audited assessment" | VERIFIED | KEEP |
| C-04 | Work items are not client engagements | `/work`, all 3 `/work/[slug]`, home preview | `isExampleArchitecture: true` → badge "Example architecture — not a client engagement" + `exampleArchitectureNote` ("Outcome metrics are deliberately omitted…") | VERIFIED | KEEP — never convert to case studies |
| C-05 | Console/simulation figures (tasks processed, approvals queued) | Hero instrument | `simulationLabel`: "All figures simulated for illustration. No client data is shown." + "INTERACTIVE SIMULATION" badge | VERIFIED | KEEP treatment in redesign |
| C-06 | Compliance posture ("Mapped to SOC 2 / ISO 27001 readiness") | `/security`, industry pages | Two-status vocabulary (`src/data/compliance.ts`); "Reviewed controls… readiness" wording, never "certified" | VERIFIED | KEEP; legal review still pending (DraftBanner on legal pages) |
| C-07 | No invented clients/staff/testimonials/awards | Site-wide | Verified: no client logos, named people, or testimonial quotes exist in `src/data/*` or pages; team page explains shared-byline model | VERIFIED | PRESERVE — do not add fabricated content in rebrand copy |
| C-08 | Contact channels | Site-wide | `contact.email`/`meetingLink` are `null` until env set; UI omits dead channels rather than faking them | VERIFIED | PRESERVE mechanism |
| C-09 | Legal pages accuracy | /privacy /terms /cookie-policy | `DraftBanner` = "Draft — legal review required" until `NEXT_PUBLIC_LEGAL_REVIEWED=true` | VERIFIED (banner) | PRESERVE banner; legal review is an owner action (BLOCKED on owner) |
| C-10 | Positioning statement ("autonomous operations layer…") | Hero, BRAND-GUIDE | Aspirational self-description; no measurable claim | VERIFIED (as positioning) | Rewrite for ARKYON in BRAND-STRATEGY; keep category honesty (engineering company, not tools vendor) |

Rule adopted: the rebrand introduces **zero new numeric or comparative claims**. All existing disclaimers remain the single source (`src/data/disclaimers.ts`, tested).
