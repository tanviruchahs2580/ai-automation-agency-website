import { siteConfig } from "@/data/site";

/**
 * Shared social card renderer used by every `opengraph-image` route.
 *
 * One component so all cards share the brand (graphite ground, accent aurora,
 * wordmark, signal dot) and a single place decides how a long headline scales
 * down. Rendered by Satori, which supports a subset of CSS: inline styles only,
 * explicit `display: flex` on any element with more than one child, and no CSS
 * custom properties.
 *
 * Each route also exports `alt`, as the file convention expects. In practice
 * `buildMetadata` sets `openGraph.images[].alt` per page — it can describe the
 * specific page rather than the family — and a page-level `openGraph` object
 * replaces the file convention's values, so the exported `alt` is a fallback
 * that Next uses only if a page ever stops setting its own.
 */

const INK = "#f4f2ec";
const MUTED = "#8b93a3";
const ACCENT = "#2e6bf6";
const SIGNAL = "#00e5a8";

/**
 * Headline size by character count. A fixed 76px looked right for the site
 * tagline and overflowed the card for anything longer, and article titles run
 * to ~90 characters. Three steps is enough to keep every title inside two
 * lines at 1200px without a measurement pass.
 */
function titleSize(length: number): number {
  if (length <= 46) return 76;
  if (length <= 78) return 62;
  return 52;
}

export interface OgCardProps {
  /** Small uppercase label above the headline — the page's section. */
  kicker: string;
  /** The headline. Truncated by the caller if it could be unbounded. */
  title: string;
  /** Bottom-left caption. */
  footerLeft: string;
  /** Bottom-right caption, rendered in the accent colour. */
  footerRight: string;
}

export function OgCard({
  kicker,
  title,
  footerLeft,
  footerRight,
}: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0a0b0e",
        backgroundImage:
          "radial-gradient(700px 340px at 12% -10%, rgba(46,107,246,0.22), transparent 65%), radial-gradient(560px 300px at 92% 12%, rgba(0,229,168,0.12), transparent 60%)",
        color: INK,
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `3px solid ${ACCENT}`,
            borderRadius: 12,
            fontSize: 36,
            fontWeight: 700,
            color: ACCENT,
          }}
        >
          {siteConfig.name.charAt(0)}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 10,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: SIGNAL,
            marginLeft: 4,
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 4,
            color: ACCENT,
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize(title.length),
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: "2px solid rgba(244,242,236,0.12)",
          paddingTop: 28,
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: MUTED }}>
          {footerLeft}
        </div>
        <div
          style={{ display: "flex", fontSize: 26, fontWeight: 700, color: ACCENT }}
        >
          {footerRight}
        </div>
      </div>
    </div>
  );
}
