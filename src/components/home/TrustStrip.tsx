import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Capability-based trust — no invented client counts, deployments or ROI.
 */

const capabilities = [
  { name: "AI Engineering", detail: "Agents · RAG · Copilots" },
  { name: "Automation", detail: "Processes · Documents · Integrations" },
  { name: "Agent Systems", detail: "Orchestration · Tool governance" },
  { name: "Software", detail: "Platforms · SaaS · Modernisation" },
  { name: "Data", detail: "Pipelines · Knowledge infrastructure" },
  { name: "Security", detail: "Isolation · Auditability · Governance" },
];

export function TrustStrip() {
  return (
    <section className="border-b border-line bg-surface/40" aria-labelledby="capabilities-heading">
      <div className="container-x py-12 lg:py-16">
        <SectionHeader
          eyebrow="What we are accountable for"
          title="Engineering capability you can verify in delivery"
          id="capabilities-heading"
        />
        <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] md:grid-cols-3 lg:grid-cols-6">
          {capabilities.map((c) => (
            <li key={c.name} className="bg-canvas p-5">
              <p className="font-semibold leading-tight">{c.name}</p>
              <p className="mono-label mt-2 leading-relaxed text-muted">{c.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
