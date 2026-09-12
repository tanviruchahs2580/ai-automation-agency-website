import Link from "next/link";
import { services } from "@/data/services";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Chip, chipFor } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Services as an interactive numbered list — each row carries a big mono
 * index, chip, and title; hover/focus expands the existing summary with a
 * spring-timed reveal. Same data, same links, same copy.
 */
export function ServiceRows() {
  return (
    <section
      className="section-y border-t border-line bg-surface/30"
      aria-labelledby="services-heading"
    >
      <div className="container-x">
        <SectionHeader
          eyebrow="Capabilities"
          title="Seven services, one accountable team."
          lead="Engage us for a single deliverable or the full lifecycle — the same engineers stay accountable throughout."
          id="services-heading"
          index="04"
        />
        <Reveal className="mt-10">
          <ol className="overflow-hidden rounded-xl border border-line">
            {services.map((service, i) => {
              const { icon, hue } = chipFor(service.slug, i);
              return (
                <li key={service.slug} className="border-b border-line last:border-0">
                  <Link
                    href={`/services/${service.slug}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 bg-canvas px-5 py-5 transition-colors duration-150 hover:bg-surface2 sm:gap-6 sm:px-7"
                  >
                    <span className="mono-label tabular w-8 shrink-0 text-accent-bright">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-3">
                        <Chip icon={icon} hue={hue} />
                        <span className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                          {service.title}
                        </span>
                      </span>
                      <span className="service-row-grid">
                        <span className="service-row-inner">
                          <span className="block pt-2 text-sm leading-relaxed text-muted">
                            {service.summary}
                          </span>
                        </span>
                      </span>
                    </span>
                    <Icon
                      name="arrow-up-right"
                      size={18}
                      className="shrink-0 text-faint transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-accent-strong"
                    />
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/services"
                className="group flex items-center gap-4 bg-surface px-5 py-5 transition-colors duration-150 hover:bg-surface2 sm:px-7"
              >
                <span className="mono-label tabular w-8 shrink-0 text-faint">08</span>
                <span className="font-display text-lg font-semibold tracking-tight text-muted group-hover:text-ink sm:text-xl">
                  Compare all seven services
                </span>
                <Icon
                  name="arrow-right"
                  size={18}
                  className="ml-auto shrink-0 text-faint transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-accent-strong"
                />
              </Link>
            </li>
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
