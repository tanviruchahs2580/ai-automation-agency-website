import { agentStages } from "@/data/architecture";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export function AgentWorkflow() {
  return (
    <section className="section-y border-t border-line bg-surface/30" aria-labelledby="agents-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="How AI agents work"
          title="Eight stages between an event and an outcome."
          lead="Agents aren't magic — they're engineered loops. Here is exactly what happens when one handles work in your business."
          id="agents-heading"
        />

        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-[color:var(--color-line)] md:grid-cols-2 lg:grid-cols-4">
          {agentStages.map((stage, i) => (
            <li key={stage.index}>
              <Reveal delay={(i % 4) * 0.06} className="h-full">
                <article className="flex h-full flex-col bg-canvas p-6">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-sm text-accent-strong">
                      {stage.index}
                    </span>
                    <span className="mono-label text-faint">STAGE</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{stage.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {stage.plain}
                  </p>
                  <p className="mt-4 border-l-2 border-accent/50 pl-3 text-xs italic leading-relaxed text-muted">
                    e.g. {stage.example}
                  </p>
                  <div className="mt-auto pt-5">
                    <p className="mono-label text-faint">LAYER</p>
                    <p className="mt-1 font-mono text-xs text-muted">{stage.layer}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-8">
          <p className="mx-auto max-w-2xl text-center text-sm text-muted">
            Business implication: every stage is instrumented — so when something
            goes wrong you can see precisely where, why, and what the agent knew.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
