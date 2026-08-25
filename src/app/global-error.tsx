"use client";

/**
 * Root-level crash boundary (errors escaping all segment boundaries).
 * Renders its own <html>/<body> because the root layout is not mounted;
 * design-system CSS is unavailable here, so critical styles are inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0b0e",
          color: "#f4f2ec",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem", maxWidth: "34rem" }}>
          <p
            style={{
              letterSpacing: "0.25em",
              fontSize: 12,
              fontWeight: 700,
              color: "#7d8494",
              textTransform: "uppercase",
            }}
          >
            VANTIQ SYSTEMS
          </p>
          <h1 style={{ fontSize: "1.8rem", margin: "1.1rem 0 0.6rem" }}>
            Something went wrong on our side.
          </h1>
          <p style={{ color: "#a3a9b4", lineHeight: 1.65, margin: 0 }}>
            An unexpected error occurred while loading this page. Please try
            again — if it keeps happening, email{" "}
            <a href="mailto:hello@vantiqsystems.example" style={{ color: "#2e6bf6" }}>
              hello@vantiqsystems.example
            </a>{" "}
            and we will follow up directly.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: "1.2rem",
                fontSize: 12,
                color: "#7d8494",
                fontFamily: "monospace",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              marginTop: "1.8rem",
              background: "#2e6bf6",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              padding: "0.7rem 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
