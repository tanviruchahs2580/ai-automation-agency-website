import type { ReactNode } from "react";

/**
 * MetricsPulse — the "live operations" signature: a 1px signal dot on a
 * 2s cycle beside a computed metric. Decorative (aria-hidden); the number
 * itself stays plain text for screen readers.
 */
export function MetricsPulse({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="signal-dot" aria-hidden="true" />
      <span className="tabular">{children}</span>
    </span>
  );
}
