import Link from "next/link";
import { industries } from "@/data/industries";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

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
        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(compact ? industries.slice(0, 8) : industries).map((industry, i) => (
            <li key={industry.slug}>
              <Reveal delay={(i % 4) * 0.04} className="h-full">
                <Link
                  href={`/industries/${industry.slug}`}
                  className="group flex h-full flex-col bg-canvas p-6 transition-colors hover:bg-surface"
                >
                  <h3 className="font-semibold leading-snug">{industry.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">
                    {industry.summary}
                  </p>
                  <span className="mono-label mt-4 text-faint transition-colors group-hover:text-accent-strong">
                    {industry.useCases.length + industry.opportunities.length} use cases →
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
