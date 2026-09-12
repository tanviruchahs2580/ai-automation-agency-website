import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeroInstrument } from "@/components/scenes/HeroInstrument";
import { GridLines } from "@/components/ui/GridLines";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { StatusDot } from "@/components/ui/Tag";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <GridLines opacity={0.6} />
      <div
        className="aurora-bleed pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div className="container-x section-y relative grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow mb-5 flex flex-wrap items-center gap-2.5">
            <StatusDot tone="signal" />
            <span>AI Engineering &amp; Automation — Architecture first</span>
          </p>
          <h1 className="text-hero">
            The autonomous operations layer for enterprises that{" "}
            <span className="text-gradient">cannot afford guesswork.</span>
          </h1>
          <p className="lead mt-6">
            VANTIQ Systems designs, engineers, and operates the systems that
            make AI trustworthy enough to run your operations — from first
            architecture to production, with governance built in.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic>
              <Button href="/start-a-project" dataCtaId="home-hero-primary-a">
                Start a Project
              </Button>
            </Magnetic>
            <Button
              href="/solutions"
              variant="quiet"
              dataCtaId="home-hero-secondary-a"
            >
              Explore Solutions
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
          <HeroInstrument />
        </Reveal>
      </div>
    </section>
  );
}
