import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm transition-colors duration-150 px-5 py-2.5 min-h-11";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-strong disabled:opacity-50",
  secondary:
    "border border-line-strong text-ink hover:border-accent hover:text-accent-strong",
  ghost: "text-muted hover:text-ink",
};

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
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

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
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} aria-label={ariaLabel} onClick={onClick}>
        {children}
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
    >
      {children}
    </button>
  );
}
