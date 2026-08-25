import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { TechnologyMap } from "@/components/home/TechnologyMap";
import { OpsControlVisual } from "@/components/home/OpsControlVisual";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Technology & Platform",
  description:
    "Model-agnostic, architecture-first: how we assemble models, infrastructure, RAG, agents and observability into production AI systems.",
  path: "/technology",
});

const aiStackLayers = [
  { name: "Model Router", detail: "Task-aware routing across providers with fallbacks and budgets." },
  { name: "Agent Orchestrator", detail: "Coordinates specialised agents, retries and escalation paths." },
  { name: "Tool Registry", detail: "Schema-validated, least-privilege access to business systems." },
  { name: "RAG Pipeline", detail: "Permission-aware retrieval over your approved knowledge." },
  { name: "Memory", detail: "Task-scoped state with retention rules and user controls." },
  { name: "Evaluation Harness", detail: "Golden datasets and regression gates wired into CI." },
  { name: "Observability", detail: "Traces for every prompt, tool call and output." },
];

export default function TechnologyPage() {
  return (
    <>
      <PageHero
        eyebrow="Technology"
        title="The platform behind every system we deliver."
        lead="A proven internal stack — model gateway, orchestration, retrieval, evaluation, observability — assembled per engagement, never hard-wired to one vendor."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Technology", path: "/technology" },
        ]}
        actions={
          <Link
            href="/start-a-project"
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Talk to an AI Engineer
          </Link>
        }
      />

      <section className="section-y" aria-labelledby="stack-heading">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-3">Internal AI stack</p>
            <h2 id="stack-heading" className="h-section">Seven layers between a prompt and a production system.</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Every layer is replaceable. That&apos;s the point — when models,
              vendors or regulations shift, your system adapts in configuration
              rather than surgery.
            </p>
          </Reveal>
          <div className="lg:col-span-7">
            <ol className="space-y-px overflow-hidden rounded-lg border border-line">
              {aiStackLayers.map((layer, i) => (
                <li key={layer.name} className="flex items-baseline gap-4 bg-surface px-5 py-4">
                  <span className="mono-label w-7 shrink-0 text-accent-strong">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-medium">{layer.name}</span>
                    <span className="block text-sm text-muted">{layer.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface/30" aria-labelledby="demo-heading">
        <div className="container-x py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <SectionHeader
                eyebrow="Live demo"
                title="What operating AI looks like."
                id="demo-heading"
              />
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                The panel shows the control surface we deploy with production
                systems: agent states, throughput, human approvals and exceptions
                — all traceable, all alertable.
              </p>
              <p className="mt-6 rounded border border-warn/40 bg-warn/10 px-4 py-3 text-xs leading-relaxed text-warn">
                Interactive Simulation — figures shown are synthetic. No client
                data appears anywhere on this site.
              </p>
            </div>
            <div className="lg:col-span-7">
              <OpsControlVisual />
            </div>
          </div>
        </div>
      </section>

      <TechnologyMap />

      <CtaSection />
    </>
  );
}
