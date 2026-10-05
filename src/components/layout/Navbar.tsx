"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteNav, type NavItem } from "@/data/site";
import { track, AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/ui/SearchModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Wordmark } from "@/components/layout/Wordmark";
import { Icon } from "@/components/ui/Icon";

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

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
    if (e.key === "Enter" || e.key === " ") {
      setOpen((v) => !v);
    }
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open ]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
      onKeyDown={onKeyDown}
    >
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
          className={cn(
            "relative flex items-center gap-1 whitespace-nowrap rounded px-2 py-2 text-sm transition-colors duration-150 xl:px-3",
            isActive ? "text-accent-strong" : "text-muted hover:text-ink",
          )}
        >
          {label}
          <Icon
            name="chevron-down"
            size={10}
            className={cn("transition-transform duration-200", open && "rotate-180")}
          />
          {isActive && (
            <span
              className="absolute inset-x-3 bottom-0.5 h-0.5 rounded bg-accent transition-all duration-200"
              aria-hidden="true"
            />
          )}
        </Link>

      {open && (
        <div
          className="dropdown-in absolute left-0 top-full z-50 w-[19rem] overflow-hidden rounded-xl border border-line-strong bg-surface/95 shadow-overlay backdrop-blur-xl"
          role="menu"
        >
          <Link
            href={href}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface2"
            role="menuitem"
          >
            {label} Overview
            <span aria-hidden="true" className="font-mono text-xs text-faint">
              →
            </span>
          </Link>
          <div className="border-t border-line" />
          <div className="p-1.5">
            {children}
          </div>
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
      <div
        className={cn(
          "container-x flex items-center justify-between gap-4 transition-all duration-200",
          scrolled ? "h-16" : "h-24",
        )}
      >
        <Wordmark compact={scrolled} />

        <nav aria-label="Primary" className="hidden items-center lg:flex lg:gap-0 xl:gap-1">
          {siteNav.map((item) =>
            item.children ? (
              <Dropdown
                key={item.href}
                label={item.label}
                href={item.href}
                isActive={isActive(item.href)}
              >
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="group/item block rounded-lg px-3 py-2 transition-colors hover:bg-surface2"
                    role="menuitem"
                  >
                    <span
                      className={cn(
                        "block text-sm transition-colors",
                        isActive(child.href)
                          ? "text-accent-strong"
                          : "text-ink group-hover/item:text-accent-strong",
                      )}
                    >
                      {child.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-faint">
                      {child.description}
                    </span>
                  </Link>
                ))}
              </Dropdown>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap rounded px-2 py-2 text-sm transition-colors duration-150 xl:px-3",
                  isActive(item.href) ? "text-accent-strong" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span
                    className="absolute inset-x-3 bottom-0.5 h-0.5 rounded bg-accent"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex xl:gap-3">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            className="flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-3 py-2 text-sm text-muted transition-colors duration-150 hover:border-accent hover:text-accent-strong"
            aria-label="Search (Ctrl+K)"
          >
            <Icon name="search" size={14} />
            <span className="hidden xl:inline">Search</span>
            <kbd className="hidden rounded border border-line px-1 py-0.5 font-mono text-[10px] text-faint xl:inline">⌘K</kbd>
          </button>
          <ThemeToggle />
          {/*
            "Assess My AI Opportunity" is deliberately desktop-header-only
            below xl. Eight primary links + two CTAs measured 195px of
            horizontal overflow at 1024px, so the tertiary path stays in the
            mobile menu, hero, ROI teaser and final CTA — and the desktop
            header keeps a single primary CTA.
          */}
          <Link
            href="/start-a-project"
            onClick={() => track(AnalyticsEvent.CtaClick, { location: "nav-start" })}
            className="btn btn-primary whitespace-nowrap rounded-md px-4"
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
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="mobile-menu-spring border-t border-line bg-canvas/95 backdrop-blur-md lg:hidden"
      >
        {/*
          Mobile utility row. Both controls live in the desktop-only header
          cluster (`hidden lg:flex`), which left search and the theme toggle
          completely unreachable below 1024px — and ⌘K does not exist on a
          touch keyboard. Rendering them here restores feature parity without
          crowding the mobile header.
        */}
        <div className="container-x flex items-center gap-2 border-b border-line py-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
              );
            }}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line-strong px-4 text-sm text-muted transition-colors duration-150 hover:border-accent hover:text-accent-strong"
          >
            <Icon name="search" size={14} />
            Search
          </button>
          <ThemeToggle />
        </div>
        <nav aria-label="Mobile" className="container-x flex flex-col py-4">
          {siteNav.map((item, i) =>
            item.children ? (
              <MobileDropdownSection
                key={item.href}
                dropdown={item}
                isActive={isActive}
                onNavigate={() => setOpen(false)}
                firstRef={i === 0 ? firstMobileLinkRef : undefined}
              />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded px-3 py-3 text-base",
                  isActive(item.href) ? "text-accent-strong" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
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
              className="btn btn-primary rounded-md px-4 py-3"
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
  dropdown: NavItem;
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
          className="mr-2 flex min-h-11 min-w-11 items-center justify-center rounded p-2 text-muted transition-colors hover:text-accent-strong"
          aria-expanded={expanded}
          aria-label={`Show ${dropdown.label} options`}
        >
          <Icon
            name="chevron-down"
            size={12}
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
          />
        </button>
      </div>
      {expanded && (
        <div className="ml-4 border-l border-line pl-3">
          {(dropdown.children ?? []).map((child) => (
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
