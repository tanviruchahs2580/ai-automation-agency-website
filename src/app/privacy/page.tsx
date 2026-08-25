import { PageHero } from "@/components/layout/PageHero";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How VANTIQ SYSTEMS handles personal data submitted through this website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lead="Placeholder document — requires review by qualified legal counsel before launch. Structure reflects intended practice; do not publish without verification."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ]}
      />
      <article className="container-x section-y max-w-3xl prose-body">
        <div className="space-y-10 text-muted">
          <section>
            <h2 className="text-lg font-semibold text-ink">1. Data we collect</h2>
            <p className="mt-3">
              We collect only what you submit through our forms: company details,
              project context and contact information. We do not use third-party
              advertising trackers. Analytics events are aggregated interactions
              (button clicks, form steps) without personal identifiers.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">2. How we use it</h2>
            <p className="mt-3">
              Submitted briefs are used solely to respond to your enquiry and
              scope potential work. They are never sold, rented or shared with
              third parties for marketing.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">3. Storage &amp; retention</h2>
            <p className="mt-3">
              Submissions are transmitted securely and retained only as long as
              necessary to process your enquiry, after which they are deleted
              unless an engagement begins.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">4. Your rights</h2>
            <p className="mt-3">
              Depending on your jurisdiction (including GDPR and similar
              frameworks), you may request access, correction or deletion of your
              personal data. Contact us using the details in the footer.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-warn">
              ⚠ Placeholder notice
            </h2>
            <p className="mt-3">
              This policy is structural placeholder content. A compliant privacy
              policy must be drafted or approved by qualified legal counsel,
              reflecting actual data flows, processors and jurisdictions before
              this site handles real submissions publicly.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
