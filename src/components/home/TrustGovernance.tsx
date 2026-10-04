import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

/**
 * Enterprise trust layer for the homepage (§17 of the renovation brief).
 *
 * The capability marquee alone is not a trust mechanism, so this section
 * states *how* systems are controlled. Every line mirrors a control that
 * already exists on /security or in the platform description — capability
 * statements, never certifications. Formal readiness status lives on
 * /security, and the footer of the section says so plainly.
 *
 * Quiet surfaces only (no glow, no lift, no gradient): restraint is the
 * point here. Server component — no client JS.
 */
const trustStatements = [
  {
    label: "Auditable",
    detail:
      "Prompts, tool calls and actions are recorded so a decision can be traced after the fact.",
  },
  {
    label: "Human approval",
    detail:
      "High-risk actions can require sign-off before they execute, by risk tier.",
  },
  {
    label: "Model-agnostic",
    detail:
      "Model choice stays an economic decision, not an architectural lock-in.",
  },
  {
    label: "Least privilege",
    detail:
      "Agents hold scoped credentials for one task — never standing admin access.",
  },
  {
    label: "Observable",
    detail:
      "Traces cover every prompt, tool call and output, with alerts on drift and cost.",
  },
  {
    label: "Continuously evaluated",
    detail:
      "Golden datasets and regression gates run in CI before a change reaches production.",
  },
];

export function TrustGovernance() {
  return (
    <section
      className="section-y border-t border-line bg-surface/30"
      aria-labelledby="trust-heading"
    >
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="Trust & governance"
              title="Control is part of the architecture, not a feature added at the end."
              lead="Autonomy is earned through controls. Each of these is engineered into the systems we deliver and visible in the design — not promised in a slide."
              id="trust-heading"
              index="07"
            />
            <div className="mt-8">
              <Button href="/security" variant="quiet" dataCtaId="home-trust-security-a">
                Read the security &amp; governance model
              </Button>
            </div>
          </div>

          <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:col-span-7">
            {trustStatements.map((item, i) => (
              <li key={item.label} className="border-t border-line pt-5">
                <Reveal delay={(i % 2) * 0.05}>
                  <p className="mono-label uppercase text-accent-bright">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <p className="mono-label mt-10 border-t border-line pt-5 uppercase text-faint">
          Capability statements, not certifications — formal readiness status is
          published on the security page
        </p>
      </div>
    </section>
  );
}
