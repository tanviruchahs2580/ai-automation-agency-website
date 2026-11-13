import Link from "next/link";
import { useId } from "react";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Brand lockup — the approved final ARKYON identity (2026-11 reference),
 * rebuilt as clean vector geometry: the abstract "A" symbol (warm-orange left
 * stroke, metallic-grey right stroke) with its luminous orbital sweep and
 * glowing endpoint, the geometric ARKYON wordmark (hand-authored paths, orange
 * counter accent in the A), and the descriptor line.
 *
 * Construction rules (logo-integration master prompt §2):
 *  - One canonical geometry source (this file); Navbar, Footer and the favicon
 *    pipeline all derive from it, so variants cannot drift.
 *  - Transparent background everywhere — no rectangular backing on any surface.
 *  - Gradients get per-instance ids via useId: the mark renders twice on most
 *    pages (header + footer) and duplicate SVG ids were a real defect class in
 *    this repo's history (the old grid-id bug) — `check:rendered` fails on them.
 *  - The wordmark strokes and grey face use currentColor / theme tokens, so the
 *    lockup stays legible in both themes without a second colour variant.
 *  - The descriptor and secondary line are live text in the site's own faces —
 *    no unbundled fonts, and screen readers get them as ordinary text.
 *
 * Variants: `header` (default) = mark + divider + wordmark + descriptor;
 * `compact` (scroll-compressed navbar / mobile) = mark + wordmark, no
 * descriptor (prompt §3.1: never shrink the descriptor to illegibility);
 * `footer` = larger lockup + the BUILD • AUTOMATE • SCALE secondary line.
 */

/* Symbol geometry — viewBox 0 0 100 108. The A: apex (48,2), baseline 98;
   the two faces split on the centre ridge; counter apex at (48,52). The orbit
   sweeps from mid-left, around the bottom-left, up to the glowing endpoint at
   the top-right — in front of both faces, as in the reference. */
function ArkynonSymbol({ className, idBase }: { className?: string; idBase: string }) {
  return (
    <svg
      viewBox="0 0 100 108"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`${idBase}-left`} x1="48" y1="2" x2="30" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff8a34" />
          <stop offset="0.55" stopColor="#e06c1c" />
          <stop offset="1" stopColor="#9c4708" />
        </linearGradient>
        <linearGradient id={`${idBase}-right`} x1="70" y1="2" x2="82" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57524c" />
          <stop offset="1" stopColor="#a49e95" />
        </linearGradient>
        <linearGradient
          id={`${idBase}-orbit`}
          x1="3"
          y1="54"
          x2="97"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ff8a34" stopOpacity="0.15" />
          <stop offset="0.4" stopColor="#ff9a4d" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffe7cd" />
        </linearGradient>
        <radialGradient id={`${idBase}-dot`}>
          <stop offset="0" stopColor="#ffb066" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffb066" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* right (metallic grey) face first — the orange face folds over the apex */}
      <path
        d="M48 2 L48 52 L70 98 L94 98 Z"
        fill={`url(#${idBase}-right)`}
        stroke={`url(#${idBase}-right)`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* left (warm orange) face */}
      <path
        d="M48 2 L2 98 L26 98 L48 52 Z"
        fill={`url(#${idBase}-left)`}
        stroke={`url(#${idBase}-left)`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* orbital sweep — soft underlay glow + crisp line, one gradient */}
      <path
        d="M3 54 C1 80 14 102 36 103 C62 104 90 72 97 30"
        stroke={`url(#${idBase}-orbit)`}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.22"
      />
      <path
        d="M3 54 C1 80 14 102 36 103 C62 104 90 72 97 30"
        stroke={`url(#${idBase}-orbit)`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* glowing endpoint, upper-right */}
      <circle cx="97" cy="30" r="8" fill={`url(#${idBase}-dot)`} />
      <circle cx="97" cy="30" r="3.1" fill="#fff3e4" />
    </svg>
  );
}

/* Wordmark geometry — geometric uppercase, uniform 13-unit stroke on a 60-unit
   cap height, drawn as strokes so the weight stays perfectly even. The A keeps
   the approved orange counter accent (filled triangle). viewBox 0 0 336 64. */
function ArkynonWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 336 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="13" strokeLinecap="butt" strokeLinejoin="miter">
        {/* A */}
        <path d="M8 60 L31 6 L54 60" />
        {/* R */}
        <path d="M70 60 L70 6 L91 6 A14 14 0 0 1 91 34 L70 34 M91 34 L110 60" />
        {/* K */}
        <path d="M124 60 L124 6 M166 6 L130 34 M141 26 L168 60" />
        {/* Y */}
        <path d="M180 6 L202 33 L224 6 M202 33 L202 60" />
        {/* O — rounded-square ring, as in the reference */}
        <rect x="241.5" y="12.5" width="29" height="41" rx="14.5" />
        {/* N */}
        <path d="M286 60 L286 6 L330 60 L330 6" />
      </g>
      {/* the approved orange accent inside the A counter */}
      <path d="M22.5 60 L31 42 L39.5 60 Z" fill="#f97e26" />
    </svg>
  );
}

const DESCRIPTOR = "AI ENGINEERING & AUTOMATION";
const SECONDARY_LINE = ["BUILD", "AUTOMATE", "SCALE"] as const;

export function Wordmark({
  compact = false,
  variant = "header",
}: {
  compact?: boolean;
  variant?: "header" | "footer";
}) {
  const rawId = useId();
  const idBase = `arkyon-${rawId.replace(/:/g, "")}`;
  const mode = compact ? "compact" : variant;

  return (
    <Link
      href="/"
      className="group relative flex items-center gap-2.5"
      aria-label={`${siteConfig.name} — home`}
    >
      {mode === "footer" ? (
        /* Stacked lockup: the footer brand column is one grid track wide, so
           the horizontal lockup would overlap the next column — the balanced
           stacked arrangement (§3.2) fits without touching the grid. */
        <span className="flex flex-col items-start gap-2.5">
          <ArkynonSymbol idBase={idBase} className="h-14 w-13" />
          <span className="flex flex-col items-start gap-1.5">
            <ArkynonWordmark className="h-auto w-44 text-ink" />
            <span className="whitespace-nowrap font-mono text-[7.5px] uppercase leading-none tracking-[0.26em] text-muted">
              {DESCRIPTOR}
            </span>
            <span className="whitespace-nowrap font-mono text-[7.5px] uppercase leading-none tracking-[0.26em] text-faint">
              {SECONDARY_LINE.map((word, i) => (
                <span key={word}>
                  {i > 0 && <span className="mx-1.5 text-accent" aria-hidden="true">•</span>}
                  {word}
                </span>
              ))}
            </span>
          </span>
        </span>
      ) : (
        <>
          <ArkynonSymbol
            idBase={idBase}
            className={cn(
              "shrink-0 transition-all duration-200",
              compact ? "h-7 w-6.5" : "h-9 w-8 xl:h-10 xl:w-9",
            )}
          />
          {mode !== "compact" && (
            <span aria-hidden="true" className="my-1.5 self-stretch w-px bg-line-strong" />
          )}
          <span className="flex flex-col items-start justify-center gap-1">
            <ArkynonWordmark
              className={cn(
                "text-ink transition-all duration-200",
                compact ? "h-4.5 w-24" : "w-28 xl:w-32 h-auto",
              )}
            />
            {mode !== "compact" && (
              <span className="whitespace-nowrap font-mono text-[5px] uppercase leading-none tracking-[0.22em] text-muted xl:text-[5.5px]">
                {DESCRIPTOR}
              </span>
            )}
          </span>
        </>
      )}
    </Link>
  );
}
