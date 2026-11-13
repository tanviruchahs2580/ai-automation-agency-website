# FACT-AND-PROOF-REGISTER — material company facts, provenance and approval

The public brand changes VANTIQ → ARKYON. Nothing else about the company becomes more knowable than it was. This register fixes what the site may say and what stays unpublished.

| # | Fact | Provenance / source | Source date | Confidence | Approved public wording | Owner approval |
|---|---|---|---|---|---|---|
| F-01 | Public brand name is `ARKYON` | Owner instruction in this engagement (highest precedence, §1.2) | 2026-11-13 | VERIFIED | "ARKYON" (no suffix — no "ARKYON Systems/AI/Labs") | Given (this instruction) |
| F-02 | Legal entity name | **Unknown** — brief states it is not confirmed | — | NOT ESTABLISHED | none — no legal entity published anywhere | BLOCKED on owner |
| F-03 | Capabilities (agents, automation, private AI, platforms, ops) | Site's own service/solution catalogue (self-declared offering) | 2026-11-13 | Self-declared offering (current site copy) | "We design, build and operate…" phrasing; never "proven at N clients" | Not needed (unchanged scope) |
| F-04 | Work/portfolio items ×3 | `src/data/case-studies.ts` marked `isExampleArchitecture` | 2026-11-13 | VERIFIED (in repo, labelled) | "Example architecture — not a client engagement" | — |
| F-05 | Bangla GPT / AgroBridge / AI Greenhouse Manager (named in prompt §8.4 as candidate portfolio proof) | **Not present in this repository's public data**; no public artefacts verified | — | UNVERIFIED in repo | **Do not publish** until owner supplies status/ownership/public-availability evidence | BLOCKED on owner evidence |
| F-06 | Client engagements / revenue / adoption | none | — | NOT ESTABLISHED | none — prohibited | — |
| F-07 | Team size / named people | none (shared byline model) | — | VERIFIED (absence) | collective "ARKYON Engineering Team" byline only | — |
| F-08 | Certifications (SOC 2, ISO 27001…) | `src/data/compliance.ts` two-status vocabulary | 2026-11-13 | Mapped-to-readiness only | "Controls reviewed for … readiness" — never "certified" | Legal review pending |
| F-09 | Contact email / meeting link | env-gated (`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_MEETING_LINK`) | — | VERIFIED (mechanism) | channels omitted when unset | Owner supplies at launch |
| F-10 | Trademark clearance for "ARKYON" | not performed (no legal research authority) | — | NOT ESTABLISHED | do not claim availability/registration | Owner to arrange trademark counsel |
| F-11 | Domain / canonical origin | `NEXT_PUBLIC_SITE_URL` env → current vercel.app origin | 2026-11-13 | VERIFIED (mechanism) | keep existing origin until owner confirms custom domain | Pending owner decision |

**Public-claim gate for implementation:** any copy line I write in Phase 5 must be traceable to F-01/F-03/F-04 or be pure capability description with no metric, client, or certification implication. No new stats, no new named people, no new projects.
