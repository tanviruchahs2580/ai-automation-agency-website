import { processPhases } from "@/data/architecture";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export function ProcessTimeline() {
  return (
    <section className="section-y" aria-labelledby="process-heading">
      <div className="container-x">
        <SectionHeader
          eyebrow="Delivery process"
          title="Eight phases. No surprises."
          lead="Each phase ends with a decision point and evidence — you always know what was learned, built or validated."
          id="process-heading"
        />

        <ol className="relative mt-14 max-w-3xl space-y-2">
          {processPhases.map((phase, i) => (
            <li key={phase.index} className="relative pl-14 sm:pl-20">
              {i < processPhases.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[1.35rem] top-12 h-full w-px bg-[color:var(--color-line-strong)] sm:left-[2.6rem]"
                />
              )}
              <Reveal delay={i * 0.04}>
                <div className="pb-8">
                  <span className="mono-label absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-canvas text-accent-strong sm:h-12 sm:w-12">
                    {phase.index}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="text-lg font-semibold">{phase.name}</h3>
                    <span className="mono-label text-faint">{phase.duration}</span>
                  </div>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                    {phase.detail}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
