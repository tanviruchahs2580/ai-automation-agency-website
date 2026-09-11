import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { OpsControlVisual } from "@/components/home/OpsControlVisual";
import { Reveal } from "@/components/ui/Reveal";
import { StatusDot } from "@/components/ui/Tag";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="panel-grid pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent"
        aria-hidden="true"
      />
      <div className="container-x section-y relative grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow mb-5 flex flex-wrap items-center gap-2.5">
            <StatusDot tone="ok" />
            <span>AI Engineering &amp; Automation — Architecture first</span>
          </p>
          <h1 className="h-display">
            Build the AI systems your business actually needs.
          </h1>
          <p className="lead mt-6">
            We design, engineer and operate intelligent automation systems that
            connect your people, software, data and workflows — from first
            architecture to production, with governance built in.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/start-a-project">Start a Project</Button>
            <Button href="/solutions" variant="secondary">
              Explore What We Can Automate
            </Button>
          </div>
          <p className="mt-4 text-sm">
            <Link
              href="/ai-readiness"
              className="text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
            >
              Not sure where to start? Get your AI readiness score →
            </Link>
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <dt className="mono-label text-faint">LIFECYCLE</dt>
              <dd className="mono-label text-muted">
                Strategy → Engineering → Deployment → Operations
              </dd>
            </div>
          </dl>
          <p className="mono-label mt-3 text-faint">
            Model-agnostic · Human-in-the-loop · No hype metrics
          </p>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-5">
          <OpsControlVisual />
        </Reveal>
      </div>
    </section>
  );
}
