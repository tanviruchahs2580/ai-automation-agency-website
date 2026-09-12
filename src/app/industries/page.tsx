import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { CapabilityCard } from "@/components/ui/Card";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";
import { industries } from "@/data/industries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Industries",
  description:
    "AI and automation engineered for financial services, healthcare, manufacturing, retail, logistics, government and more — with domain-specific architecture.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Same discipline. Different constraints."
        lead="Regulation, failure cost and integration landscapes change everything. These are the sectors we know deeply."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
        ]}
      />

      <section className="section-y">
        <div className="container-x">
          <RevealStagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, i) => (
              <RevealStaggerItem key={industry.slug}>
                <CapabilityCard
                  eyebrow="Industry"
                  index={String(i + 1).padStart(2, "0")}
                  title={industry.title}
                  description={industry.summary}
                  meta={`${industry.useCases.length + industry.opportunities.length} use cases documented`}
                  href={`/industries/${industry.slug}`}
                />
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <CtaSection
        eyebrow="Your sector not listed?"
        title="Constraints transfer. So do we."
        lead="The engineering disciplines are universal — tell us your domain and we'll be straight about fit."
      />
    </>
  );
}
