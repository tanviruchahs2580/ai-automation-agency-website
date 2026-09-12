import type { ReactNode } from "react";

/**
 * DetailLayout — 3-column body for solution/service/industry detail pages:
 * left anchor nav / center prose / right sticky sidebar (§15).
 * Nav and sidebar collapse away below `lg`; content stays linear.
 */
export function DetailLayout({
  nav,
  sidebar,
  children,
}: {
  nav: Array<{ href: string; label: string }>;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="container-x grid gap-10 lg:grid-cols-12">
      <nav
        aria-label="On this page"
        className="hidden lg:col-span-2 lg:block"
      >
        <ol className="sticky top-28 space-y-1">
          {nav.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="mono-label flex items-baseline gap-2 rounded px-2 py-1.5 uppercase text-faint transition-colors hover:bg-surface2 hover:text-ink"
              >
                <span aria-hidden="true" className="text-accent-bright">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="min-w-0 lg:col-span-7">{children}</div>
      <aside className="lg:col-span-3">
        <div className="space-y-5 lg:sticky lg:top-28">{sidebar}</div>
      </aside>
    </div>
  );
}

/** Sticky "what this includes" sidebar card shared by detail pages. */
export function IncludesCard({
  title,
  items,
  action,
}: {
  title: string;
  items: string[];
  action: ReactNode;
}) {
  return (
    <div className="card-surface p-6">
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-snug text-muted">
            <span aria-hidden="true" className="text-signal">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t border-line pt-5">{action}</div>
    </div>
  );
}
