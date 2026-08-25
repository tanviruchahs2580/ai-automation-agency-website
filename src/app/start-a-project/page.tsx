import { PageHero } from "@/components/layout/PageHero";
import { ProjectIntake } from "@/components/forms/ProjectIntake";
import { Reveal } from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Start a Project",
  description:
    "Tell us what you're trying to build. Seven short steps, validated server-side, answered by a senior engineer — not a sales script.",
  path: "/start-a-project",
});

const afterSubmit = [
  {
    title: "Reviewed by an engineer",
    detail:
      "A senior AI engineer reads every brief. You get a substantive response within two business days.",
  },
  {
    title: "Scoped discovery call",
    detail:
      "If there's potential fit, we schedule a technical call with the people who would actually build it.",
  },
  {
    title: "Honest verdict",
    detail:
      "If we're not the right partner — or AI isn't the right answer — we'll say so and point you somewhere better.",
  },
];

export default function StartAProjectPage() {
  return (
    <>
      <PageHero
        eyebrow="Start a project"
        title="Tell us what you're trying to build."
        lead="Seven short steps. The more context you give, the sharper our first response — your answers go through secure server-side validation and are never shared."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Start a Project", path: "/start-a-project" },
        ]}
      />

      <section className="section-y">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <ProjectIntake />
          </div>
          <aside className="lg:col-span-5">
            <Reveal className="card-surface p-7">
              <p className="eyebrow mb-5">What happens after you submit</p>
              <ol className="space-y-6">
                {afterSubmit.map((item, i) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="font-mono text-sm text-accent-strong">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-medium">{item.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">
                        {item.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 border-t border-line pt-6">
                <p className="mono-label uppercase text-faint">Data handling</p>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
                  <li>· Transmitted over encrypted connection; validated server-side.</li>
                  <li>· Rate-limited and bot-filtered to prevent abuse.</li>
                  <li>· Only fields you enter are stored — nothing inferred or tracked.</li>
                  <li>· Retained only as long as needed to process your enquiry (see privacy policy).</li>
                </ul>
                <p className="mt-4 text-xs text-faint">
                  Note: live submission storage is being connected — until then
                  briefs are confirmed with a reference ID and handled manually.
                  Booking link is a placeholder pending scheduling integration.
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
