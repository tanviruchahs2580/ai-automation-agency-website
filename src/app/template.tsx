import type { ReactNode } from "react";

/** Subtle 200ms opacity fade between App Router routes (§8.3). */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
