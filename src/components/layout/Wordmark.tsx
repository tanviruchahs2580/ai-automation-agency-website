import Link from "next/link";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Brand wordmark.
 *
 * The lockup is the Keystone mark — an architectural arch with the keystone
 * wedge seated at its apex — beside the brand set in the display face, with any
 * trailing word set in mono. The keystone is the brand's whole argument in one
 * glyph: the engineered piece that makes an unstable assembly hold.
 *
 * The mark is deliberately an abstract device rather than a letterform. The
 * previous mark read as a "V", which meant changing the brand name would have
 * left a mark spelling the wrong letter next to it — the kind of coupling that
 * turns a rebrand into an illustration job instead of a config change. An arch
 * names no letter and stays correct for any future rename.
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
        {/* Arch: pillars + shoulders, apex deliberately open for the wedge. */}
        <path
          d="M6.5 26V17a9.5 9.5 0 0 1 5.94-8.81M19.56 8.19A9.5 9.5 0 0 1 25.5 17v9"
          stroke="var(--color-muted)"
          strokeWidth="2.2"
          strokeLinecap="square"
        />
        {/* Keystone — the one copper element in the lockup. */}
        <path d="M12.2 4h7.6l-1.4 5h-4.8z" fill="var(--color-accent)" />
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
