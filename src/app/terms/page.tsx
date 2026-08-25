import { PageHero } from "@/components/layout/PageHero";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms governing use of this website and engagement enquiries.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        lead="Placeholder document — requires review by qualified legal counsel before launch."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ]}
      />
      <article className="container-x section-y max-w-3xl prose-body">
        <div className="space-y-10 text-muted">
          <section>
            <h2 className="text-lg font-semibold text-ink">1. Use of this site</h2>
            <p className="mt-3">
              This website provides information about our services and
              interactive estimation tools. Outputs from calculators and
              assessments are indicative estimates, not professional advice,
              quotes or commitments.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">2. No warranties</h2>
            <p className="mt-3">
              The site is provided as-is. While we work to keep content accurate
              and available, we make no warranty regarding completeness,
              reliability or uninterrupted availability.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">3. Intellectual property</h2>
            <p className="mt-3">
              Site content is owned by its authors. Reference architectures are
              published for informational purposes; engagement terms transfer IP
              per contract, not via this page.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-warn">
              ⚠ Placeholder notice
            </h2>
            <p className="mt-3">
              Requires drafting/approval by qualified legal counsel, including
              governing law and jurisdiction clauses appropriate to the operating
              entity.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
