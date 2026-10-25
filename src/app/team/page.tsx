import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig, teamByline } from "@/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Team",
  description: `The ${siteConfig.proseName} engineering team: how we work, what we publish under our shared byline, and how to reach us.`,
  path: "/team",
});

/**
 * Minimal team page — deliberately collective, not personal.
 * No individual names, photos, or LinkedIn URLs are published until real,
 * verified authorship exists (honesty rule: no invented people).
 */
export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Team"
        title="One engineering team, shared byline."
        lead={`Every article on this site is published as the ${teamByline}. No ghost authors, no stock faces.`}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Team", path: "/team" },
        ]}
      />

      <section className="section-y" aria-labelledby="how-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="How we work"
            title="Senior, distributed, accountable."
            id="how-heading"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Senior only",
                detail:
                  "Engagements are staffed with engineers who have shipped production systems before — never bench juniors learning on your budget.",
              },
              {
                title: "Distributed by design",
                detail:
                  "Async-first across US, European, and APAC overlap hours. Decisions are written down, not trapped in meetings.",
              },
              {
                title: "Named ownership",
                detail:
                  "Every system has a named owner through build and operation. Responsibility is assigned, not implied.",
              },
            ].map((item, i) => (
              <Reveal key={item.title}>
                <div className="card-surface h-full p-6">
                  {/*
                    h3, not h2: these sat at the same level as the section
                    heading above them, so the page outline read as four peer
                    sections instead of one section with three parts. The mono
                    index also brings the card into line with every other card
                    on the site, which all carry a numbered eyebrow.
                  */}
                  <p className="mono-label text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="h-card mt-3">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            We publish capability rather than headshots: no individual profiles
            appear until there is verified authorship to attach them to. Reach
            the whole team via{" "}
            <Link
              href="/start-a-project"
              className="text-accent-strong underline underline-offset-4 hover:text-ink"
            >
              Start a Project →
            </Link>
          </p>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
