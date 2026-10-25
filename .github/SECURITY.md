# Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities privately through GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository (**Security** tab → **Report a vulnerability**). Please do
not open a public issue for anything exploitable.

Include, where you can: the URL or endpoint, the request you sent, what you
observed, and what you expected. A reproduction is worth more than a severity
estimate.

**What to expect:** an acknowledgement within two business days, and an
assessment with a remediation plan within five. If a fix is warranted, it ships
as a normal release and the report is credited unless you ask otherwise.

## Scope

In scope:

- The public site and its server routes, in particular the intake endpoint
  `POST /api/project-brief`.
- Anything that exposes submitted project briefs, environment variables, or
  server-side execution.
- Authentication and authorisation: this site has neither. It stores no user
  accounts and has no admin surface, so a report in this category is almost
  certainly about a dependency rather than this code.

Out of scope:

- Findings that require a modified browser, a compromised device, or physical
  access.
- Missing hardening headers with no demonstrated impact, and automated scanner
  output without a working proof of concept. Please include the reasoning if you
  believe a header gap is exploitable here.
- Denial of service by volume against the static site. The intake endpoint is
  rate limited; report a bypass of that limit specifically.
- Reports about the placeholder brand name or the placeholder legal pages —
  those are tracked, disclosed launch blockers rather than vulnerabilities.

## Known, disclosed posture

Stated plainly so that reporting effort can go somewhere useful:

- **Content Security Policy** ships in report-only mode (`CSP_MODE` promotes it
  to enforcing). The policy still carries `'unsafe-inline'` for scripts and
  styles, so enforcing it would not meaningfully constrain an attacker yet.
- **Dependencies** are audited in CI on every push
  (`npm run check:deps`, production dependencies only, failing at `high`). The
  full tree is kept at zero advisories, dev included.
- **Rate limiting** for the intake endpoint is in-memory and therefore
  per-instance. It is a spam control, not a defence against a distributed
  attacker; the platform's own edge protection is the layer above it.
- **The intake endpoint stores nothing.** Validated briefs are emailed to a
  configured inbox when that is set up, and otherwise only receipted. There is
  no database to exfiltrate.
