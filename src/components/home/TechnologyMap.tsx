import Link from "next/link";
import { coreStatement, technologyCategories } from "@/data/technology";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export function TechnologyMap() {
  return (
    <section className="section-y" aria-labelledby="tech-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="Technology ecosystem"
          title={coreStatement}
          lead="We select technology per problem — and engineer so any component can be replaced as the market shifts. Inclusion here means we build with it, not that anyone endorses us."
          id="tech-heading"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {technologyCategories.map((category, i) => (
            <Reveal key={category.heading} delay={(i % 2) * 0.06}>
              <div className="card-surface h-full p-6 md:p-7">
                <h3 className="h-card">{category.heading}</h3>
                <p className="mono-label mt-2 text-faint">{category.note}</p>
                <dl className="mt-5 divide-y divide-[color:var(--color-line)]">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <dt className="shrink-0 font-mono text-sm">{item.name}</dt>
                      <dd className="text-right text-xs text-muted">{item.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Link href="/technology" className="mono-label uppercase text-accent-strong hover:underline">
            Explore our technology approach →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
