import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { CapabilityCard } from "@/components/ui/Card";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/ui/RevealStagger";
import { services } from "@/data/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Services",
  description:
    "AI strategy, AI engineering, automation, software engineering, data & AI infrastructure, security and operations — one accountable engineering team.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Engineering capacity, delivered your way."
        lead="From a two-week strategy sprint to multi-year operations — every engagement ends with capability transferred to your team."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
      />

      <section className="section-y">
        <div className="container-x">
          <RevealStagger className="grid gap-5 md:grid-cols-2">
            {services.map((service, i) => (
              <RevealStaggerItem key={service.slug}>
                <CapabilityCard
                  eyebrow="Service"
                  index={String(i + 1).padStart(2, "0")}
                  title={service.title}
                  description={service.summary}
                  meta={service.capabilities.slice(0, 3).join(" · ")}
                  href={`/services/${service.slug}`}
                />
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <CtaSection
        eyebrow="Engage us"
        title="Tell us the problem. We'll propose the engagement shape."
        lead="Fixed-scope sprints, embedded delivery or full lifecycle programs — sized to your reality."
      />
    </>
  );
}
