import { Button } from "@/components/ui/Button";
import { OpsControlVisual } from "@/components/home/OpsControlVisual";
import { Reveal } from "@/components/ui/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="panel-grid pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-x section-y relative grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow mb-5">AI Engineering &amp; Automation for the Enterprise</p>
          <h1 className="h-display">
            Build the AI systems your business actually needs.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            We design, engineer and operate intelligent automation systems that
            connect your people, software, data and workflows — from first
            architecture to production.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/solutions">Explore What We Can Automate</Button>
            <Button href="/start-a-project" variant="secondary">
              Start a Project
            </Button>
          </div>
          <p className="mono-label mt-8 text-faint">
            Strategy → Engineering → Deployment → Operations
          </p>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-5">
          <OpsControlVisual />
        </Reveal>
      </div>
    </section>
  );
}
