import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Unified icon set — 24×24 grid, 1.5px stroke, round caps/joins,
 * `currentColor` inheritance. `filled` is for status indicators only.
 * Extend by adding a path to `paths`; never import a third-party set.
 */

type IconName =
  | "arrow-right"
  | "arrow-up"
  | "arrow-up-right"
  | "check"
  | "chevron-down"
  | "menu"
  | "close"
  | "search"
  | "sun"
  | "moon"
  | "shield"
  | "lock"
  | "cpu"
  | "layers"
  | "workflow"
  | "database"
  | "gauge"
  | "doc"
  | "users"
  | "calendar"
  | "mail"
  | "globe"
  | "bank"
  | "health"
  | "factory"
  | "cart"
  | "truck"
  | "code"
  | "eye"
  | "stamp"
  | "compass"
  | "terminal"
  | "pulse";

const paths: Record<IconName, ReactNode> = {
  "arrow-right": <path d="M3 12h17M14 6l6 6-6 6" />,
  "arrow-up": <path d="M12 20V4M6 10l6-6 6 6" />,
  "arrow-up-right": <path d="M6 18 18 6M9 6h9v9" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  "chevron-down": <path d="m5 9 7 7 7-7" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4.5 4.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />,
  shield: <path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.4 7 9.3 4.1-1.9 7-5 7-9.3V5.8L12 3Z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </>
  ),
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 2.5V5M14 2.5V5M10 19v2.5M14 19v2.5M2.5 10H5M2.5 14H5M19 10h2.5M19 14h2.5" />
    </>
  ),
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3.5 13.5 12 18l8.5-4.5M3.5 17.5 12 22l8.5-4.5" />,
  workflow: (
    <>
      <circle cx="6" cy="6" r="2.8" />
      <circle cx="18" cy="18" r="2.8" />
      <circle cx="18" cy="6" r="2.8" />
      <path d="M8.5 7.5 15 16M6 8.8v4.4c0 1.5 1.2 2.8 2.8 2.8H15" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 19a9 9 0 1 1 16 0" />
      <path d="M12 15l4.5-5.5" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.6a3.5 3.5 0 0 1 0 6.8M17.5 14.4c2 .8 3.5 2.7 3.5 5.1" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8.5 3v4M15.5 3v4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5S9.5 5.8 12 3.5Z" />
    </>
  ),
  bank: <path d="M3 9.5 12 4l9 5.5M4.5 9.5V19M9.5 9.5V19M14.5 9.5V19M19.5 9.5V19M3 19.5h18" />,
  health: (
    <>
      <path d="M12 20s-7-4.3-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.7 12 20 12 20Z" />
      <path d="M12 8.5v5M9.5 11h5" />
    </>
  ),
  factory: <path d="M4 20V10l5 3.5V10l5 3.5V5.5L19 9v11H4ZM4 20h16" />,
  cart: (
    <>
      <path d="M3 4h2.5l2.2 11.5h11.6l2.2-8H7" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6.5H14V17H2.5V6.5ZM14 10h4l3.5 3.5V17H14" />
      <circle cx="7" cy="19" r="1.8" />
      <circle cx="17.5" cy="19" r="1.8" />
    </>
  ),
  code: <path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  stamp: (
    <>
      <path d="M9 10.5c-1.5-.8-2.5-2-2.5-3.7 0-1.9 1.3-3.3 3-3.3h5c1.7 0 3 1.4 3 3.3 0 1.7-1 2.9-2.5 3.7l-.7 3h-4.6l-.7-3Z" />
      <path d="M5 16.5h14v4H5v-4Z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="m7 9.5 3 3-3 3M12.5 15.5H17" />
    </>
  ),
  pulse: (
    <>
      <path d="M3 12h4l2.5-6 4 12L16 12h5" />
    </>
  ),
};

export type { IconName };

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.5,
  filled = false,
  className,
  ariaLabel,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      className={cn("shrink-0", className)}
    >
      {paths[name]}
    </svg>
  );
}

/** Convenience: icon-button with guaranteed 44px target + label. */
export function IconButton({
  name,
  label,
  onClick,
  href,
  className,
}: {
  name: IconName;
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const cls = cn(
    "inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-surface2 hover:text-ink",
    className,
  );
  const icon = <Icon name={name} size={20} />;
  if (href) {
    return (
      <Link href={href} className={cls} aria-label={label}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} aria-label={label} onClick={onClick}>
      {icon}
    </button>
  );
}
