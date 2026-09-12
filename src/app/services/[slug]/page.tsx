import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Accordion, JsonLd } from "@/components/ui/Accordion";
import { DetailLayout, IncludesCard } from "@/components/layout/DetailLayout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getService, services } from "@/data/services";
import { buildMetadata, faqJsonLd, serviceJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.slug}`,
  });
}

const nav = [
  { href: "#problem", label: "Why it exists" },
  { href: "#engagement", label: "Engagement" },
  { href: "#faq", label: "FAQ" },
];

/** The 6-week engagement shape: discover → architect → prototype. */
const engagementShape = [
  { phase: "Discover", duration: "Weeks 1–2", detail: "Objectives, walkthroughs, feasibility." },
  { phase: "Architect", duration: "Weeks 3–4", detail: "Design reviewed with your engineers." },
  { phase: "Prototype", duration: "Weeks 5–6", detail: "Real data, kill-or-commit evidence." },
];

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <JsonLd data={serviceJsonLd({ name: service.title, description: service.summary, path: `/services/${service.slug}` })} />
      <JsonLd data={faqJsonLd(service.faq)} />

      <PageHero
        eyebrow={`Service — ${service.title}`}
        title={service.title}
        lead={service.summary}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ]}
        actions={
          <Button href="/start-a-project">Discuss This Engagement</Button>
        }
      />

      <section className="section-y">
        <DetailLayout
          nav={nav}
          sidebar={
            <>
              <IncludesCard
                title="What you get"
                items={service.deliverables.slice(0, 4)}
                action={
                  <div className="flex flex-col gap-2">
                    <Button href="/start-a-project">Scope this service</Button>
                    <Button href="/roi-calculator" variant="link">
                      Estimate the return
                    </Button>
                  </div>
                }
              />
              <div className="card-surface p-6">
                <p className="eyebrow">6-week engagement shape</p>
                <ol className="mt-4 space-y-4">
                  {engagementShape.map((step, i) => (
                    <li key={step.phase} className="flex gap-3">
                      <span className="mono-label shrink-0 text-accent-bright">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">
                          {step.phase}
                          <span className="ml-2 font-mono text-xs font-normal text-faint">
                            {step.duration}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {step.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 border-t border-line pt-4 text-[11px] leading-relaxed text-faint">
                  Fixed-shape start; production build continues in two-week
                  increments. Full lifecycle in <a href="/approach" className="underline underline-offset-4 hover:text-ink">our approach</a>.
                </p>
              </div>
            </>
          }
        >
          <div className="space-y-16">
            <Reveal>
              <section id="problem" className="scroll-mt-28">
                <p className="eyebrow mb-3">Why it exists</p>
                <h2 className="h-section">{service.problem}</h2>
                <p className="eyebrow mb-4 mt-8">Deliverables</p>
                <ul className="space-y-3">
                  {service.deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex gap-3 text-muted">
                      <span aria-hidden="true" className="mt-1 text-ok">✓</span>
                      <span className="leading-relaxed">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section id="engagement" className="scroll-mt-28">
                <p className="eyebrow mb-3">Engagement</p>
                <h2 className="h-section">How we work, week by week.</h2>
                <div className="mt-8 grid gap-8 md:grid-cols-3">
                  <div>
                    <h3 className="mono-label uppercase text-faint">Capabilities</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                      {service.capabilities.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mono-label uppercase text-faint">Steps</h3>
                    <ol className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                      {service.engagement.map((step) => (
                        <li key={step} className="flex gap-2">
                          <span aria-hidden="true" className="text-accent-strong">→</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3 className="mono-label uppercase text-faint">Technology</h3>
                    <ul className="mt-4 space-y-2 font-mono text-sm text-muted">
                      {service.technologies.map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </Reveal>

            <section id="faq" className="scroll-mt-28">
              <SectionHeader eyebrow="FAQ" title="Questions we're usually asked first." />
              <div className="mt-8">
                <Accordion items={service.faq} />
              </div>
            </section>
          </div>
        </DetailLayout>
      </section>

      <CtaSection />
    </>
  );
}
