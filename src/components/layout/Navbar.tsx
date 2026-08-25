"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";import { siteNav } from "@/data/site";
import { track, AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    firstMobileLinkRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled || open
          ? "border-line bg-canvas/90 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-baseline gap-2"
          aria-label="Meridian AI Engineering — home"
        >
          <span className="text-lg font-bold tracking-tight">MERIDIAN</span>
          <span className="mono-label hidden text-muted sm:inline">
            AI ENGINEERING
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {siteNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded px-3 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "text-accent-strong"
                  : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/ai-readiness"
            onClick={() => track(AnalyticsEvent.CtaClick, { location: "nav-assess" })}
            className="rounded-md border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent-strong"
          >
            Assess My AI Opportunity
          </Link>
          <Link
            href="/start-a-project"
            onClick={() => track(AnalyticsEvent.CtaClick, { location: "nav-start" })}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            Start a Project
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded border border-line lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => {
            setOpen((v) => !v);
            track(AnalyticsEvent.NavToggle);
          }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            {open ? (
              <g stroke="currentColor" strokeWidth="2">
                <path d="M1 1l16 12M17 1L1 13" />
              </g>
            ) : (
              <g stroke="currentColor" strokeWidth="2">
                <path d="M0 1h18M0 7h18M0 13h18" />
              </g>
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-line bg-canvas lg:hidden"
      >
        <nav aria-label="Mobile" className="container-x flex flex-col py-4">
          {siteNav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              ref={i === 0 ? firstMobileLinkRef : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded px-3 py-3 text-base",
                isActive(item.href) ? "text-accent-strong" : "text-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/ai-readiness"
              onClick={() => {
                setOpen(false);
                track(AnalyticsEvent.CtaClick, { location: "nav-assess" });
              }}
              className="rounded-md border border-line-strong px-4 py-3 text-center text-sm"
            >
              Assess My AI Opportunity
            </Link>
            <Link
              href="/start-a-project"
              onClick={() => {
                setOpen(false);
                track(AnalyticsEvent.CtaClick, { location: "nav-start" });
              }}
              className="rounded-md bg-accent px-4 py-3 text-center text-sm font-medium text-white"
            >
              Start a Project
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
