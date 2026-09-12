"use client";

import { useEffect, useState } from "react";
import { contact } from "@/data/site";

/**
 * 500 — console-style operator error with request ID (digest),
 * timestamp, and a report-to-engineering mailto link.
 */
export default function GlobalError({
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
    <section className="section-y" role="alert">
      <div className="container-x py-10">
        <div className="mx-auto max-w-2xl rounded-xl border border-line bg-surface p-6 font-mono text-sm sm:p-8">
          <p className="text-critical">$ vantiq serve --status</p>
          <p className="mt-3 text-faint">
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
            <a
              href={`mailto:${contact.email}?subject=${encodeURIComponent(`Error report ${requestId}`)}`}
              className="text-accent-strong underline underline-offset-4"
            >
              report it to engineering
            </a>
            .
          </p>
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
          >
            Try Again
          </button>
        </div>
      </div>
    </section>
  );
}
