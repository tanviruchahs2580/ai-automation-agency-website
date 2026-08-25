import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
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
        <div className="container-x grid gap-5 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 2) * 0.06}>
              <Link
                href={`/services/${service.slug}`}
                className="card-surface group flex h-full flex-col p-7 transition-colors hover:border-accent/40"
              >
                <span className="mono-label text-accent-strong">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="h-card mt-3">{service.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {service.summary}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {service.capabilities.slice(0, 3).map((capability) => (
                    <li
                      key={capability}
                      className="mono-label rounded border border-line px-2 py-1 text-faint"
                    >
                      {capability}
                    </li>
                  ))}
                </ul>
              </Link>
            </Reveal>
          ))}
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
