import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

interface CtaSectionProps {
  eyebrow?: string;
  title?: string;
  lead?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CtaSection({
  eyebrow = "Next step",
  title = "Start a project",
  lead = "Tell us what you're trying to improve. You'll get an honest technical read — including when AI is the wrong tool.",
  primaryLabel = "Start a Project",
  primaryHref = "/start-a-project",
  secondaryLabel = "Assess My AI Opportunity",
  secondaryHref = "/ai-readiness",
}: CtaSectionProps) {
  return (
    <section className="section-y" aria-labelledby="cta-heading">
      <div className="container-x">
        <Reveal className="card-surface relative overflow-hidden px-6 py-14 text-center md:px-16 md:py-20">
          <div
            className="panel-grid pointer-events-none absolute inset-0 opacity-20"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="eyebrow mb-4">{eyebrow}</p>
            <h2 id="cta-heading" className="h-section mx-auto max-w-2xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{lead}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={primaryHref} className="w-full sm:w-auto">
                {primaryLabel}
              </Button>
              <Button
                href={secondaryHref}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {secondaryLabel}
              </Button>
            </div>
            <p className="mono-label mt-6 text-faint">
              Honest technical read — including when AI is the wrong tool
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
