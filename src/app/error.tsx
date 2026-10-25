"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contact, siteConfig } from "@/data/site";

/**
 * 500 — console-style operator error with request ID (digest), timestamp, and
 * a report-to-engineering link.
 *
 * Named RouteError, not GlobalError: the identifier was previously shared with
 * the unrelated root boundary in global-error.tsx, which made stack traces and
 * searches ambiguous.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [timestamp] = useState(() => new Date().toISOString());

  useEffect(() => {
    // Report to your monitoring provider here (never log sensitive content).
    if (process.env.NODE_ENV !== "production") {
      console.error("[error-boundary]", error.digest ?? error.message);
    }
  }, [error]);

  const requestId = error.digest ?? "n/a";

  return (
    /*
      No `role="alert"` on this wrapper. An assertive live region is meant to
      carry a short status message; this one contained the whole panel —
      heading, request ID, timestamp, the mailto link and the "Try Again"
      button — so it was force-announced in full on render, and any DOM update
      inside it (the timestamp settling, a focus change) re-announced the entire
      page. For a full-page error the heading and copy are read as ordinary
      content, which is the correct behaviour.
    */
    <section className="section-y">
      <div className="container-x py-10">
        {/* Heading-navigation anchor — the visual design is a console readout,
            which otherwise leaves this page with no heading at all. */}
        <h1 className="sr-only">Server error — this page could not be loaded</h1>
        <div className="grain mx-auto max-w-2xl rounded-xl border border-line bg-surface p-6 font-mono text-sm sm:p-8">
          <p className="text-critical">
            $ {siteConfig.shortName.toLowerCase()} serve --status
          </p>
          <p className="mt-3 text-faint" role="alert">
            <span className="text-critical">500</span> — server error.
          </p>
          <dl className="mt-2 space-y-1 text-muted">
            <div className="flex gap-2">
              <dt className="text-faint">request_id:</dt>
              <dd>{requestId}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-faint">time:</dt>
              <dd>{timestamp || "…"}</dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-line pt-4 leading-relaxed text-muted">
            We hit an unexpected error. Retry immediately — if it persists,{" "}
            {contact.email ? (
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent(`Error report ${requestId}`)}`}
                className="text-accent-strong underline underline-offset-4"
              >
                report it to engineering
              </a>
            ) : (
              <Link href="/start-a-project" className="text-accent-strong underline underline-offset-4">
                send it to engineering
              </Link>
            )}
            , quoting the request ID above.
          </p>
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-press"
          >
            Try Again
          </button>
        </div>
      </div>
    </section>
  );
}
