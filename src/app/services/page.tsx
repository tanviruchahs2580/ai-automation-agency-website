import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { CtaSection } from "@/components/layout/CtaSection";
import { CapabilityCard } from "@/components/ui/Card";
import { Spotlight } from "@/components/ui/Spotlight";
import { chipFor } from "@/components/ui/Chip";
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
        actions={<Button href="/start-a-project">Start a Project</Button>}
      />

      <section className="section-y" aria-labelledby="services-heading">
        <div className="container-x">
          {/* See `solutions/page.tsx` — same h1 → h3 outline gap, same fix. */}
          <h2 id="services-heading" className="h-section">
            All services
          </h2>
          {/*
            Three columns at `lg`, matching `/solutions`. Both pages carry the
            same card type with comparable copy, and the two-up grid here was an
            unexplained break in the layout system.

            The narrower column is also why the card footer now shows two
            capability names instead of three: at three-up, three names wrapped
            to a second line and left a dangling separator at the end of the
            first. The footer was shortened to fit the new measure — that is a
            deliberate content reduction, not a side effect of the grid change.
          */}
          <RevealStagger className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const { icon, hue } = chipFor(service.slug, i);
              return (
                <RevealStaggerItem key={service.slug}>
                  <Spotlight className="h-full">
                    <CapabilityCard
                      eyebrow="Service"
                      index={String(i + 1).padStart(2, "0")}
                      icon={icon}
                      hue={hue}
                      title={service.title}
                      description={service.summary}
                      meta={service.capabilities.slice(0, 2).join(" · ")}
                      href={`/services/${service.slug}`}
                    />
                  </Spotlight>
                </RevealStaggerItem>
              );
            })}
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
