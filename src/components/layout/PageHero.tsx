import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/ui/Accordion";
import { breadcrumbJsonLd } from "@/lib/seo";
import { Reveal } from "@/components/ui/Reveal";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  lead: string;
  breadcrumbs: Array<{ name: string; path: string }>;
  actions?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  actions,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="panel-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-x section-y relative">
        <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="mono-label flex flex-wrap items-center gap-2 uppercase text-faint">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span aria-current="page">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path} className="hover:text-ink">
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <Reveal>
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="h-display max-w-4xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {lead}
          </p>
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </Reveal>
      </div>
    </section>
  );
}
