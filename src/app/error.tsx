"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to your monitoring provider here (never log sensitive content).
    if (process.env.NODE_ENV !== "production") {
      console.error("[error-boundary]", error.digest ?? error.message);
    }
  }, [error]);

  return (
    <section className="section-y" role="alert">
      <div className="container-x py-20 text-center">
        <p className="mono-label text-warn">SOMETHING WENT WRONG</p>
        <h1 className="h-section mt-4">We hit an unexpected error.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          The issue has been noted. You can retry immediately — if it persists,
          please try again later.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
        >
          Try Again
        </button>
        {error.digest && (
          <p className="mono-label mt-6 text-faint">Reference: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
