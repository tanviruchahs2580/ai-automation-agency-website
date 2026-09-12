import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GridLines } from "@/components/ui/GridLines";

/**
 * 404 — themed as an operator error: console-style message, the missing
 * path is unknowable in a static 404, so we offer search + destinations.
 */
export default function NotFound() {
  return (
    <section className="section-y relative overflow-hidden">
      <GridLines opacity={0.4} />
      <div className="container-x relative py-10">
        <div className="mx-auto max-w-2xl rounded-xl border border-line bg-surface p-6 font-mono text-sm sm:p-8">
          <p className="text-critical">$ vantiq route --resolve</p>
          <p className="mt-3 text-faint">
            <span className="text-critical">404</span> — route not found.
          </p>
          <p className="mt-2 leading-relaxed text-muted">
            The address is mistyped, moved, or never existed. Nothing here was
            logged; no action needed on your side.
          </p>
          <p className="mt-4 border-t border-line pt-4 text-faint">
            $ vantiq search --site <span className="animate-pulse">▊</span>
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl text-center">
          <h1 className="h-section">This page doesn&apos;t exist.</h1>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/">Back to Home</Button>
            <Button href="/solutions" variant="quiet">
              Explore Solutions
            </Button>
          </div>
          <nav
            aria-label="Suggested destinations"
            className="mono-label mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 uppercase text-muted"
          >
            <Link href="/services" className="hover:text-ink">
              Services
            </Link>
            <Link href="/industries" className="hover:text-ink">
              Industries
            </Link>
            <Link href="/insights" className="hover:text-ink">
              Insights
            </Link>
            <Link href="/start-a-project" className="hover:text-ink">
              Start a Project
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
