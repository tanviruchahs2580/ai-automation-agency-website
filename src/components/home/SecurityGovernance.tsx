import {
  governanceChain,
  riskTiers,
} from "@/data/architecture";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

const securityControls = [
  { title: "Data isolation", detail: "Tenant and engagement boundaries enforced at the infrastructure layer." },
  { title: "Encryption", detail: "In transit and at rest, with customer-managed keys where required." },
  { title: "Access control", detail: "SSO integration with role-based permissions throughout." },
  { title: "RBAC", detail: "Agents hold scoped credentials — never standing admin access." },
  { title: "Audit logs", detail: "Every prompt, tool call and action recorded immutably." },
  { title: "Human approval", detail: "Risk-tiered sign-off before consequential actions execute." },
  { title: "Model governance", detail: "Approved models and versions, tracked with change control." },
  { title: "Prompt security", detail: "Injection screening plus architecture that limits blast radius." },
  { title: "Secrets management", detail: "Central vaults; no credentials in code or prompts." },
  { title: "API security", detail: "Authenticated, rate-limited, schema-validated endpoints." },
  { title: "PII protection", detail: "Detection and redaction before data reaches external systems." },
  { title: "Monitoring", detail: "Anomaly alerts on usage, cost and behaviour drift." },
  { title: "Rollback", detail: "Versioned deployments rehearsed for fast reversal." },
  { title: "Disaster recovery", detail: "Defined RPO/RTO targets with tested restore procedures." },
  { title: "Vendor abstraction", detail: "Model and provider swaps without architectural surgery." },
];

export function SecurityGovernance() {
  return (
    <section className="section-y border-t border-line bg-surface/30" aria-labelledby="security-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="Security & governance"
          title="Enterprise AI requires more than intelligence."
          lead="Autonomy is earned through controls. These are engineered into every system we deliver — not promised in a slide."
          id="security-heading"
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {securityControls.map((control, i) => (
            <li key={control.title}>
              <Reveal delay={(i % 5) * 0.03} className="h-full">
                <div className="h-full bg-canvas p-5">
                  <p className="font-medium">{control.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{control.detail}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* Governance chain */}
        <div className="mt-16 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow mb-3">Governance chain</p>
            <h3 className="text-xl font-bold leading-snug">
              Autonomous where it should be.
              <br />
              Human where it matters.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Every autonomous action passes through the same chain: policy
              decides what&apos;s allowed, guardrails enforce it structurally, and
              the audit log remembers everything.
            </p>
          </Reveal>
          <div className="lg:col-span-8">
            <ol className="flex flex-wrap gap-2" aria-label="Governance chain">
              {governanceChain.map((node, i) => (
                <li key={node.step} className="flex items-center gap-2">
                  <span
                    className="card-surface block px-3 py-2"
                    title={node.control}
                  >
                    <span className="mono-label block text-accent-strong">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block text-xs font-medium">{node.step}</span>
                  </span>
                  {i < governanceChain.length - 1 && (
                    <span aria-hidden="true" className="text-faint">→</span>
                  )}
                </li>
              ))}
            </ol>

            {/* Risk model */}
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] md:grid-cols-3">
              {riskTiers.map((tier) => (
                <div key={tier.level} className="bg-canvas p-6">
                  <p className="mono-label uppercase text-faint">{tier.level}</p>
                  <p
                    className={`mt-2 font-semibold ${
                      tier.level === "Low risk"
                        ? "text-ok"
                        : tier.level === "Medium risk"
                          ? "text-warn"
                          : "text-accent-strong"
                    }`}
                  >
                    {tier.handling}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {tier.description}
                  </p>
                  <p className="mt-3 border-t border-line pt-3 font-mono text-xs leading-relaxed text-faint">
                    {tier.examples}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
