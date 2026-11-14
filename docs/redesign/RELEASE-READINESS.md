# RELEASE-READINESS + ROLLBACK — Architectural Night redesign

## Release readiness

- **Implemented:** token system v5 (dark navy + orange, designed light), homepage reference composition (hero/strip/services/approach), touchpoints, docs. Logo unchanged (owner directive).
- **Feature contracts:** FC-01…FC-21 presentation-only impact; behaviour files untouched (diff-verified); e2e + user test green.
- **Not deployed:** candidate stays on the feature branch until owner-approved merge. Owner pre-authorised merge after verification ("sob kaj thik thakle then merge kora hobe") — executed only after the gate table below was green.
- **Verification status:** all executed checks PASS (QA-REPORT.md); firefox/webkit/rtl/journey/vitals NOT RUN locally — CI's E2E job runs the full matrix on the PR and must pass before merge.
- **Known limitations:** reference's social icons omitted (no verified destinations, D-R1); approach banner uses arrow (no video, D-R2); hero/approach photographic-dark in both themes (D-R3).

## Rollback (safe, reversible)

- Before merge: abandon the feature branch (`git branch -D` locally / delete remote branch) — contains no owner work; main untouched.
- After merge (production deploy of the merge commit): Vercel dashboard → previous production deployment (`054fb90`, pre-redesign) → **Promote to Production** (instant rollback, no repo operation). Alternatively `git revert -m 1 <merge-sha>` + PR through CI for a history-preserving revert.
- Never `reset --hard`/`clean`/force-push; uncommitted owner work (none at release time — tree verified clean) must never be discarded.

## Final repository state

- Branch `feat/arkyon-architectural-redesign-v2` · base `054fb90` · PR: merged after CI (see session log for final SHA)
- Changed/added: globals.css (tokens), ArchitecturalSections.tsx + module.css (new), page.tsx (rewrite), layout/manifest/global-error/OgCard (palette), DESIGN-SYSTEM.md (v5), docs/redesign/* (this folder), public/images/arkyon-hero-architecture.webp (new asset)
