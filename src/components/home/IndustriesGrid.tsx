import { industries } from "@/data/industries";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CapabilityCard } from "@/components/ui/Card";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";

export function IndustriesGrid({ compact = false }: { compact?: boolean }) {
  return (
    <section className="section-y" aria-labelledby="industries-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="Industries"
          title="Domain context changes the architecture."
          lead="A hospital and a factory both need automation — but privacy rules, failure costs and integrations differ completely."
          id="industries-heading"
        />
        <RevealStagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(compact ? industries.slice(0, 8) : industries).map((industry) => (
            <RevealStaggerItem key={industry.slug}>
              <CapabilityCard
                eyebrow="Industry"
                title={industry.title}
                description={industry.summary}
                meta={`${industry.useCases.length + industry.opportunities.length} use cases`}
                href={`/industries/${industry.slug}`}
              />
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
