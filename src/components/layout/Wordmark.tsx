import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * VANTIQ wordmark — the brand's mark. A precision "V" bracket (accent,
 * 1.5px stroke) beside display-set VANTIQ + mono SYSTEMS.
 * Scales: `compact` shrinks 20% for the scroll-compressed navbar.
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group relative flex items-center gap-2.5"
      aria-label="VANTIQ SYSTEMS — home"
    >
      <span
        className="glow-halo pointer-events-none absolute -left-4 -top-4 h-16 w-16 opacity-70"
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
          VANTIQ
        </span>
        <span className="mono-label hidden text-muted sm:inline">SYSTEMS</span>
      </span>
    </Link>
  );
}
