import Link from "next/link";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Brand wordmark.
 *
 * The lockup is an abstract "precision bracket" mark (chevron + rule + signal
 * dot, accent stroked) beside the brand set in the display face, with any
 * trailing word set in mono.
 *
 * The mark is deliberately an abstract device rather than a letterform. It was
 * drawn to read as a "V", which meant that changing the brand name would have
 * left a mark spelling the wrong letter next to it — the kind of coupling that
 * turns a rebrand into an illustration job instead of a config change.
 *
 * The name is read from `siteConfig`: the first word is display-set and the
 * remainder is mono, so any two-part name works without touching this file.
 * Scales: `compact` shrinks 20% for the scroll-compressed navbar.
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  const [primary, ...remainder] = siteConfig.name.split(" ");
  const secondary = remainder.join(" ");

  return (
    <Link
      href="/"
      className="group relative flex items-center gap-2.5"
      aria-label={`${siteConfig.name} — home`}
    >
      <span
        className="glow-halo pointer-events-none absolute -start-4 -top-4 h-16 w-16 opacity-70"
        aria-hidden="true"
      />
      <svg
        width={compact ? 26 : 32}
        height={compact ? 26 : 32}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="relative transition-all duration-200"
      >
        <path
          d="M5 6.5 16 25.5 27 6.5"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 6.5h11"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="25.5" r="2" fill="var(--color-signal)" />
      </svg>
      <span className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display font-bold tracking-tight transition-all duration-200",
            compact ? "text-base" : "text-lg",
          )}
        >
          {primary}
        </span>
        {secondary && (
          <span className="mono-label hidden text-muted sm:inline">
            {secondary}
          </span>
        )}
      </span>
    </Link>
  );
}
