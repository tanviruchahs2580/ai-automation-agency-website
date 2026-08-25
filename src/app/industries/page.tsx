import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
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
        <div className="container-x grid gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, i) => (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="group flex flex-col bg-canvas p-7 transition-colors hover:bg-surface"
            >
              <span className="mono-label text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 font-semibold">{industry.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {industry.summary}
              </p>
              <span className="mono-label mt-5 text-faint group-hover:text-accent-strong">
                View sector playbook →
              </span>
            </Link>
          ))}
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
