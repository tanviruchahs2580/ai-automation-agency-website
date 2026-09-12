import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Capability-based trust — no invented client counts, deployments or ROI.
 * Edge-masked marquee (duplicated loop, screen-reader-safe); pauses on
 * hover; static under reduced motion via the global + marquee gates.
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
          index="01"
        />
      </div>
      <div className="marquee border-t border-line pb-10 pt-8">
        <div className="marquee-track gap-4 pr-4">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 gap-4"
            >
              {capabilities.map((c) => (
                <li
                  key={c.name}
                  className="card-surface flex w-64 shrink-0 flex-col p-5"
                >
                  <p className="font-semibold leading-tight">{c.name}</p>
                  <p className="mono-label mt-2 leading-relaxed text-muted">
                    {c.detail}
                  </p>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
