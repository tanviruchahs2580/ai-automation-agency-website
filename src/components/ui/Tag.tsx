import { cn } from "@/lib/utils";

export function Tag({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mono-label inline-flex items-center rounded border px-2 py-0.5 uppercase tracking-wider",
        accent
          ? "border-accent/40 bg-accent/10 text-accent-strong"
          : "border-line text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  tone = "ok",
  pulse = true,
}: {
  tone?: "ok" | "warn" | "accent";
  pulse?: boolean;
}) {
  const color =
    tone === "ok"
      ? "bg-ok"
      : tone === "warn"
        ? "bg-warn"
        : "bg-accent";
  return (
    <span className="relative inline-flex h-2 w-2" aria-hidden="true">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {pulse && (
        <span
          className={cn("pulse-dot absolute inset-0 h-2 w-2 rounded-full opacity-60", color)}
        />
      )}
    </span>
  );
}
