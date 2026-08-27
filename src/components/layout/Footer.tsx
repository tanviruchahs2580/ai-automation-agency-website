import Link from "next/link";
import { footerColumns, legalLinks, contact } from "@/data/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="divider-top bg-surface/50">
      <div className="container-x py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <p className="text-lg font-bold tracking-tight">VANTIQ</p>
            <p className="mono-label mt-1 text-muted">SYSTEMS — AI ENGINEERING &amp; AUTOMATION</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              We design, build, deploy and operate intelligent systems that make
              businesses faster, safer and more autonomous.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-4 block text-xs text-muted transition-colors hover:text-ink"
            >
              {contact.email}
            </a>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="mono-label mb-3 uppercase text-faint">{column.heading}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-faint">
            © {year} VANTIQ SYSTEMS. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted">
            <a href={`mailto:${contact.email}`} className="hover:text-ink">
              {contact.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
