"use client";

import { siteConfig } from "@/data/site";

import { useState } from "react";

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
  /*
    Contact is env-driven at build time. The root layout is not mounted here,
    so this file cannot import src/data/site without pulling the whole app data
    module into the fallback bundle; the env read is repeated deliberately and
    the channel is omitted rather than faked when unset — a reserved *.example
    address would render as a mailto that silently bounces.
  */
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
  const [timestamp] = useState(() => new Date().toISOString());
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06101b",
          color: "#f5f7fa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem", maxWidth: "34rem" }}>
          <p
            style={{
              letterSpacing: "0.25em",
              fontSize: 12,
              fontWeight: 700,
              color: "#8f9cac",
              textTransform: "uppercase",
            }}
          >
            {siteConfig.name}
          </p>
          <h1 style={{ fontSize: "1.8rem", margin: "1.1rem 0 0.6rem" }}>
            Something went wrong on our side.
          </h1>
          <p style={{ color: "#b7c2cf", lineHeight: 1.65, margin: 0 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#f87171" }}>
              500 — server error.
            </span>
            <br />
            An unexpected error occurred while loading this page.{" "}
            {contactEmail ? (
              <>
                Please try again — if it keeps happening, email{" "}
                <a href={`mailto:${contactEmail}`} style={{ color: "#ffa13a" }}>
                  {contactEmail}
                </a>{" "}
                and we will follow up directly.
              </>
            ) : (
              <>
                Please try again — if it keeps happening,{" "}
                <a href="/start-a-project" style={{ color: "#ffa13a" }}>
                  send us the reference below
                </a>{" "}
                through the project brief form.
              </>
            )}
          </p>
          <p
            style={{
              marginTop: "1.2rem",
              fontSize: 12,
              color: "#8f9cac",
              fontFamily: "monospace",
            }}
          >
            request_id: {error.digest ?? "n/a"}
            {timestamp ? ` · time: ${timestamp}` : ""}
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: "1.2rem",
                fontSize: 12,
                color: "#8f9cac",
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
              background: "#f58a1f",
              color: "#17120c",
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
