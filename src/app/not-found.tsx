import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="section-y">
      <div className="container-x py-20 text-center">
        <p className="mono-label text-accent-strong">ERROR 404</p>
        <h1 className="h-section mt-4">This page doesn&apos;t exist.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          The link may be outdated or mistyped. The sitemap below covers every
          section of the site.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/">Back to Home</Button>
          <Button href="/solutions" variant="secondary">
            Explore Solutions
          </Button>
        </div>
        <nav aria-label="Helpful links" className="mono-label mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 uppercase text-muted">
          <Link href="/services" className="hover:text-ink">Services</Link>
          <Link href="/industries" className="hover:text-ink">Industries</Link>
          <Link href="/insights" className="hover:text-ink">Insights</Link>
          <Link href="/start-a-project" className="hover:text-ink">Start a Project</Link>
        </nav>
      </div>
    </section>
  );
}
