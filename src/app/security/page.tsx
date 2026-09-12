import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
import { SecurityGovernance } from "@/components/home/SecurityGovernance";
import { ComplianceStamp } from "@/components/scenes/ComplianceStamp";
import { contact } from "@/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Security",
  description:
    "How we secure this website and every AI system we engineer: isolation, encryption, access control, auditability and honest limits.",
  path: "/security",
});

const practices = [
  {
    title: "Transport & headers",
    detail:
      "HTTPS enforced with HSTS, strict content-type handling, frame denial, referrer policy and permissions lockdown applied site-wide.",
  },
  {
    title: "Form security",
    detail:
      "Server-side schema validation on every submission, per-IP rate limiting, honeypot bot traps and input sanitisation. Client validation is UX only — never trusted.",
  },
  {
    title: "Secrets discipline",
    detail:
      "No credentials in repositories or client code. Environment-scoped secrets only; production claims require verified infrastructure.",
  },
  {
    title: "Minimal data",
    detail:
      "We collect what you type into our forms — nothing inferred. No advertising trackers. Analytics are aggregate interaction events.",
  },
];

const aiSecurity = [
  "Least-privilege tool access for every agent",
  "Read/write capability separation by default",
  "Prompt-injection screening plus architectural containment",
  "Immutable audit logs of prompts, tools and actions",
  "Risk-tiered human approval gates",
  "Model governance: approved providers and versions only",
  "PII detection and redaction before external calls",
  "Rehearsed rollback for every deployment",
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust"
        title="Security, stated plainly."
        lead="What we do to protect this website and the systems we build — including what we deliberately don't claim."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Security", path: "/security" },
        ]}
      />

      <section className="section-y" aria-labelledby="practices-heading">
        <div className="container-x grid gap-5 md:grid-cols-2">
          {practices.map((practice) => (
            <Reveal key={practice.title}>
              <div className="card-surface h-full p-7">
                <h2 className="h-card">{practice.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {practice.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="ai-security-heading">
        <div className="container-x max-w-3xl">
          <Reveal>
            <p className="eyebrow mb-3">In engineered systems</p>
            <h2 id="ai-security-heading" className="h-section">
              AI security is architecture, not a checkbox.
            </h2>
            <ul className="mt-8 space-y-3">
              {aiSecurity.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-muted">
                  <span aria-hidden="true" className="text-accent-strong">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 rounded-lg border border-warn/30 bg-warn/5 p-6 text-sm leading-relaxed text-warn/90">
            Honesty clause: we claim no compliance certifications (SOC 2, ISO
            27001, HIPAA attestation) until they are actually held and verifiable.
            Where client environments demand certified controls, we work within
            your existing certified perimeter.
          </Reveal>
          <p className="mt-8 text-sm text-muted">
            Questions about security?{" "}
            <Link href="/start-a-project" className="text-accent-strong underline underline-offset-4 hover:text-ink">
              Ask an engineer directly →
            </Link>
          </p>
        </div>
      </section>

      <SecurityGovernance />

      <section
        className="section-y border-t border-line"
        aria-labelledby="compliance-heading"
      >
        <div className="container-x max-w-3xl">
          <p className="eyebrow mb-3">Compliance posture</p>
          <h2 id="compliance-heading" className="h-section">
            Reviewed controls, stated honestly.
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Our delivery controls are mapped against common frameworks. We mark
            each one exactly where it stands — no certificate is claimed before
            it is held.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3">
            <li>
              <ComplianceStamp label="SOC 2 controls" status="Mapped · In progress" />
            </li>
            <li>
              <ComplianceStamp label="ISO 27001" status="Mapped · In progress" />
            </li>
            <li>
              <ComplianceStamp label="GDPR" status="Ready" />
            </li>
          </ul>
        </div>
      </section>

      <section
        className="section-y border-t border-line"
        aria-labelledby="disclosure-heading"
      >
        <div className="container-x max-w-3xl">
          <p className="eyebrow mb-3">Responsible disclosure</p>
          <h2 id="disclosure-heading" className="h-section">
            Found a vulnerability? Tell us first.
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Email{" "}
            <a
              href={`mailto:${contact.email}?subject=${encodeURIComponent("Security report")}`}
              className="text-accent-strong underline underline-offset-4 hover:text-ink"
            >
              {contact.email}
            </a>{" "}
            with a description and steps to reproduce. We acknowledge every
            report within two business days, keep you updated on the fix, and
            ask only that you give us reasonable time to remediate before any
            public disclosure.
          </p>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
