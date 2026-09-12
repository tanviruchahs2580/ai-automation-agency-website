import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Three variants only (§7.2). `secondary`/`ghost` are deprecated aliases. */
type Variant = "primary" | "quiet" | "link" | "secondary" | "ghost";

const resolved: Record<Variant, "primary" | "quiet" | "link"> = {
  primary: "primary",
  quiet: "quiet",
  link: "link",
  secondary: "quiet",
  ghost: "link",
};

const base =
  "btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "btn-primary",
  quiet: "btn-quiet",
  link: "btn-link",
} as const;

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  external?: boolean;
  /** A/B-testing hook: every primary home CTA carries one (§14). */
  dataCtaId?: string;
}

export function Button({
  children,
  href,
  variant = "primary",
  className,
  type = "button",
  onClick,
  disabled,
  ariaLabel,
  external,
  dataCtaId,
}: ButtonProps) {
  const kind = resolved[variant];
  const classes = cn(base, variants[kind], className);
  const content =
    kind === "link" ? (
      <>
        <span>{children}</span>
        <span className="btn-arrow" aria-hidden="true">
          →
        </span>
      </>
    ) : (
      children
    );

  if (href && !disabled) {
    if (external || href.startsWith("http")) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          data-cta-id={dataCtaId}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick}
        data-cta-id={dataCtaId}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-cta-id={dataCtaId}
    >
      {content}
    </button>
  );
}
