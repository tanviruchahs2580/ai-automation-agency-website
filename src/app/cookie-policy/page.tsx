import { PageHero } from "@/components/layout/PageHero";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description: "Cookie and tracking usage on this website.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie Policy"
        lead="Short version: this site sets no marketing cookies and runs no advertising trackers."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Cookie Policy", path: "/cookie-policy" },
        ]}
      />
      <article className="container-x section-y max-w-3xl prose-body">
        <div className="space-y-10 text-muted">
          <section>
            <h2 className="text-lg font-semibold text-ink">What we use today</h2>
            <p className="mt-3">
              The site is functional-first: no advertising cookies, no cross-site
              tracking pixels, no fingerprinting. If strictly necessary cookies
              are introduced (for example, session integrity on forms), they will
              be listed here.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">Analytics</h2>
            <p className="mt-3">
              When analytics are enabled, they will record aggregate interaction
              events (e.g. which sections receive clicks) without personal
              identifiers. A consent mechanism appropriate to visitor
              jurisdictions will precede any non-essential analytics.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">Changes</h2>
            <p className="mt-3">
              This page is updated whenever data practices change. Material
              changes will be highlighted at the top of this document.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-warn">⚠ Placeholder notice</h2>
            <p className="mt-3">
              Requires legal review against applicable e-privacy regulations
              before public launch.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
