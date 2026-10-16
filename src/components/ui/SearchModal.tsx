"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { footerColumns, siteNav } from "@/data/site";
import { Icon } from "@/components/ui/Icon";

interface SearchItem {
  title: string;
  href: string;
  description?: string;
  category: string;
}

/**
 * The search index is derived from the navigation and footer data instead of
 * being maintained as a parallel list. A slug that is added, renamed or
 * removed in `site.ts` therefore appears in search automatically and can never
 * linger as a dead result — the previous hand-maintained copy had already
 * drifted from the real navigation.
 */
function buildSearchIndex(): SearchItem[] {
  const byHref = new Map<string, SearchItem>();
  const add = (item: SearchItem) => {
    if (!byHref.has(item.href)) byHref.set(item.href, item);
  };

  for (const item of siteNav) {
    if (item.children) {
      add({ title: item.label, href: item.href, category: "Section" });
      for (const child of item.children) {
        add({
          title: child.label,
          href: child.href,
          description: child.description,
          category: item.label,
        });
      }
    } else {
      add({ title: item.label, href: item.href, category: "Company" });
    }
  }

  for (const column of footerColumns) {
    for (const link of column.links) {
      add({ title: link.label, href: link.href, category: column.heading });
    }
  }

  return [...byHref.values()];
}

const searchItems = buildSearchIndex();

const popularHrefs = [
  "/roi-calculator",
  "/ai-readiness",
  "/solutions/ai-agents",
  "/start-a-project",
];

const popularItems: SearchItem[] = popularHrefs
  .map((href) => searchItems.find((item) => item.href === href))
  .filter((item): item is SearchItem => Boolean(item));

const RECENT_KEY = "vantiq-recent-searches";

/** localStorage throws in strict privacy modes; history is best-effort. */
function readRecent(): SearchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((href): href is string => typeof href === "string")
      .map((href) => searchItems.find((item) => item.href === href))
      .filter((item): item is SearchItem => Boolean(item))
      .slice(0, 4);
  } catch {
    return [];
  }
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const filtered = query.trim()
    ? searchItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.description?.toLowerCase().includes(q) ?? false) ||
          item.category.toLowerCase().includes(q)
        );
      })
    : [];

  const close = useCallback(() => setOpen(false), []);

  const remember = useCallback((item: SearchItem) => {
    setOpen(false);
    try {
      const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as unknown;
      const stored = Array.isArray(raw)
        ? raw.filter((href): href is string => typeof href === "string")
        : [];
      const next = [item.href, ...stored.filter((h) => h !== item.href)].slice(0, 4);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* recent history is best-effort */
    }
  }, []);

  const onOpen = useCallback(() => {
    // Capture the trigger so closing can hand focus back instead of dropping
    // the caret on <body> and restarting the user at the top of the page.
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
    setQuery("");
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const raf = requestAnimationFrame(() => setRecent(readRecent()));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  /*
    Return focus once the dialog has actually unmounted, on the next frame.
    The dialog holds focus and is then removed from the DOM, and WebKit
    re-runs its own focus-fixup (dropping focus to <body>) after the commit —
    so a synchronous focus() inside the effect was silently overwritten and
    keyboard users ended up back at the top of the document.
  */
  useEffect(() => {
    if (open) return;
    const raf = requestAnimationFrame(() => restoreFocusRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Scroll lock, with the previous value restored rather than cleared so this
  // cannot stomp the mobile menu's own lock if both ever overlap.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  // aria-modal promises that Tab cannot leave the dialog; this makes it true.
  const onDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const container = dialogRef.current;
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.getClientRects().length > 0);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && filtered.length > 0) {
      e.preventDefault();
      resultRefs.current[0]?.focus();
    }
  };

  const onResultKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    index: number,
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      resultRefs.current[Math.min(index + 1, filtered.length - 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) inputRef.current?.focus();
      else resultRefs.current[index - 1]?.focus();
    }
  };

  const statusText = !query.trim()
    ? ""
    : filtered.length === 0
      ? "No results found."
      : `${filtered.length} result${filtered.length === 1 ? "" : "s"}.`;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div
        className="fixed inset-0 bg-canvas/80 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg rounded-xl border border-line bg-canvas shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
        onKeyDown={onDialogKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" size={16} className="text-faint" />
          <label htmlFor="site-search-input" className="sr-only">
            Search solutions, services, industries
          </label>
          <input
            id="site-search-input"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search solutions, services, industries..."
            autoComplete="off"
            aria-controls={query.trim() ? "site-search-results" : undefined}
            aria-describedby="site-search-status"
            className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-faint"
          />
          <kbd
            aria-hidden="true"
            className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline"
          >
            ESC
          </kbd>
        </div>

        {/*
          Result count changes as the user types. The count lives in a live
          region so assistive tech hears the list collapse to zero results
          rather than silently tabbing into nothing.
        */}
        <p
          id="site-search-status"
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {statusText}
        </p>

        {!query.trim() ? (
          <div className="max-h-72 overflow-y-auto p-2">
            {recent.length > 0 && (
              <div className="px-3 pb-1 pt-2">
                <p className="mono-label uppercase text-faint">Recent</p>
                <ul className="mt-1 space-y-0.5">
                  {recent.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => remember(item)}
                        className="block rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface2 hover:text-ink"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="px-3 pb-1 pt-2">
              <p className="mono-label uppercase text-faint">Popular</p>
              <ul className="mt-1 space-y-0.5">
                {popularItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => remember(item)}
                      className="flex flex-col rounded-lg px-2 py-1.5 transition-colors hover:bg-surface2"
                    >
                      <span className="text-xs text-faint">{item.category}</span>
                      <span className="text-sm font-medium text-ink">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <ul
            id="site-search-results"
            aria-label="Search results"
            className="max-h-72 overflow-y-auto p-2"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-faint">
                No results found.
              </li>
            )}
            {filtered.map((item, index) => (
              <li key={item.href}>
                {/*
                  Real links, not role="option": these navigate, so they must
                  keep link semantics (and middle-click / open-in-new-tab).
                  Arrow keys move focus between them from the input.
                */}
                <Link
                  ref={(el) => {
                    resultRefs.current[index] = el;
                  }}
                  href={item.href}
                  onClick={() => remember(item)}
                  onKeyDown={(e) => onResultKeyDown(e, index)}
                  className="flex flex-col rounded-lg px-3 py-2.5 transition-colors hover:bg-surface2"
                >
                  <span className="text-xs text-faint">{item.category}</span>
                  <span className="text-sm font-medium text-ink">
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="text-xs text-muted">{item.description}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-line px-4 py-2 text-[11px] text-faint">
          Press{" "}
          <kbd className="rounded border border-line px-1 py-0.5 font-mono">
            <span className="key-mac">⌘K</span>
            <span className="key-other">Ctrl+K</span>
          </kbd>{" "}
          to open search anywhere.
        </div>
      </div>
    </div>
  );
}
