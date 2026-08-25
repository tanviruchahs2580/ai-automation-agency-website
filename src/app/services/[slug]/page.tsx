import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { Accordion, JsonLd } from "@/components/ui/Accordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
          <Link
            href="/start-a-project"
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Discuss This Engagement
          </Link>
        }
      />

      <section className="section-y" aria-labelledby="problem-heading">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-3">Why it exists</p>
            <h2 id="problem-heading" className="text-2xl font-bold leading-snug tracking-tight">
              {service.problem}
            </h2>
          </Reveal>
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4">Deliverables</p>
            <ul className="space-y-3">
              {service.deliverables.map((deliverable) => (
                <li key={deliverable} className="flex gap-3 text-muted">
                  <span aria-hidden="true" className="mt-1 text-ok">✓</span>
                  <span className="leading-relaxed">{deliverable}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-y border-t border-line bg-surface/30" aria-labelledby="capabilities-heading">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          <Reveal>
            <h3 id="capabilities-heading" className="mono-label uppercase text-faint">Capabilities</h3>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              {service.capabilities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.06}>
            <h3 className="mono-label uppercase text-faint">How we engage</h3>
            <ol className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              {service.engagement.map((step) => (
                <li key={step} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent-strong">→</span>
                  {step}
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.12}>
            <h3 className="mono-label uppercase text-faint">Technology</h3>
            <ul className="mt-4 space-y-2 font-mono text-sm text-muted">
              {service.technologies.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section-y border-t border-line" aria-labelledby="faq-heading">
        <div className="container-x max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Questions we're usually asked first." id="faq-heading" />
          <div className="mt-8">
            <Accordion items={service.faq} />
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
