"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteNav, navDropdowns } from "@/data/site";
import { track, AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/ui/SearchModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function Dropdown({ label, href, isActive, children }: {
  label: string;
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const onLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-1 rounded px-3 py-2 text-sm transition-colors",
          isActive ? "text-accent-strong" : "text-muted hover:text-ink",
        )}
      >
        {label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          className={cn("transition-transform duration-200", open && "rotate-180")}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {open && (
        <div
          className="absolute left-0 top-full z-50 min-w-[220px] rounded-lg border border-line bg-canvas p-2 shadow-xl"
          role="menu"
        >
          <Link
            href={href}
            className="block rounded px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface2"
            role="menuitem"
          >
            {label} Overview
          </Link>
          <div className="my-1 border-t border-line" />
          {children}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
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
        return;
      }
      if (e.key !== "Tab") return;
      const container = headerRef.current;
      if (!container) return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((el) => el.getClientRects().length > 0);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && container.contains(active);
      if (!inside || (e.shiftKey && active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  const dropdownLabels = navDropdowns.map((d) => d.label);
  const simpleItems = siteNav.filter((item) => !dropdownLabels.includes(item.label));

  return (
    <>
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled || open
          ? "border-line bg-canvas/90 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2" aria-label="VANTIQ SYSTEMS — home">
          <span className="text-lg font-bold tracking-tight">VANTIQ</span>
          <span className="mono-label hidden text-muted sm:inline">SYSTEMS</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
{navDropdowns.map((dropdown) => (
            <Dropdown
              key={dropdown.href}
              label={dropdown.label}
              href={dropdown.href}
              isActive={isActive(dropdown.href)}
            >
              <Link
                href={dropdown.href}
                className="block rounded px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface2"
                role="menuitem"
              >
                {dropdown.label} Overview
              </Link>
              <div className="my-1 border-t border-line" />
              {dropdown.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block rounded px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
                  role="menuitem"
                >
                  {child.label}
                </Link>
              ))}
            </Dropdown>
          ))}
          {simpleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded px-3 py-2 text-sm transition-colors",
                isActive(item.href) ? "text-accent-strong" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            className="flex items-center gap-2 rounded-md border border-line-strong px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent-strong"
            aria-label="Search (Ctrl+K)"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="hidden xl:inline">Search</span>
            <kbd className="hidden rounded border border-line px-1 py-0.5 font-mono text-[10px] text-faint xl:inline">⌘K</kbd>
          </button>
          <ThemeToggle />
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
          {navDropdowns.map((dropdown) => (
            <MobileDropdownSection
              key={dropdown.href}
              dropdown={dropdown}
              isActive={isActive}
              onNavigate={() => setOpen(false)}
              firstRef={undefined}
            />
          ))}
          {simpleItems.map((item, i) => (
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
    <SearchModal />
    </>
  );
}

function MobileDropdownSection({
  dropdown,
  isActive,
  onNavigate,
  firstRef,
}: {
  dropdown: (typeof navDropdowns)[number];
  isActive: (href: string) => boolean;
  onNavigate: () => void;
  firstRef?: React.RefObject<HTMLAnchorElement | null>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href={dropdown.href}
          ref={firstRef}
          onClick={onNavigate}
          className={cn(
            "rounded px-3 py-3 text-base",
            isActive(dropdown.href) ? "text-accent-strong" : "text-muted",
          )}
        >
          {dropdown.label}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mr-2 rounded p-2 text-muted"
          aria-expanded={expanded}
          aria-label={`Show ${dropdown.label} options`}
        >
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
          >
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="ml-4 border-l border-line pl-3">
          {dropdown.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="block rounded px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
