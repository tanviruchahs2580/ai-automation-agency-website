"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface SearchItem {
  title: string;
  href: string;
  description: string;
  category: string;
}

const searchItems: SearchItem[] = [
  { title: "AI Agents", href: "/solutions/ai-agents", description: "Autonomous agents that reason, act, and learn.", category: "Solutions" },
  { title: "Workflow Automation", href: "/solutions/workflow-automation", description: "End-to-end process automation.", category: "Solutions" },
  { title: "AI Software", href: "/solutions/ai-software", description: "Custom AI-powered software.", category: "Solutions" },
  { title: "Enterprise AI", href: "/solutions/enterprise-ai", description: "Enterprise-grade AI platforms.", category: "Solutions" },
  { title: "Private AI", href: "/solutions/private-ai", description: "On-premise AI with full data control.", category: "Solutions" },
  { title: "AI Transformation", href: "/solutions/ai-transformation", description: "Organization-wide AI adoption.", category: "Solutions" },
  { title: "AI Strategy", href: "/services/ai-strategy", description: "Roadmaps, feasibility, and governance.", category: "Services" },
  { title: "AI Engineering", href: "/services/ai-engineering", description: "Build production AI systems.", category: "Services" },
  { title: "Automation", href: "/services/automation", description: "Process and document automation.", category: "Services" },
  { title: "Software Engineering", href: "/services/software-engineering", description: "Platforms, SaaS, modernisation.", category: "Services" },
  { title: "Data & AI Infrastructure", href: "/services/data-ai-infrastructure", description: "Pipelines, vector stores, governance.", category: "Services" },
  { title: "Security", href: "/services/security", description: "Isolation, audit, compliance.", category: "Services" },
  { title: "AI Operations", href: "/services/ai-operations", description: "Monitoring, rollback, cost control.", category: "Services" },
  { title: "Financial Services", href: "/industries/financial-services", description: "Banks, insurers, fintech.", category: "Industries" },
  { title: "Healthcare", href: "/industries/healthcare", description: "Hospitals, pharma, biotech.", category: "Industries" },
  { title: "Manufacturing", href: "/industries/manufacturing", description: "Factory automation, quality.", category: "Industries" },
  { title: "Retail", href: "/industries/retail", description: "E-commerce, inventory, CX.", category: "Industries" },
  { title: "Logistics", href: "/industries/logistics", description: "Routing, warehousing, supply chain.", category: "Industries" },
  { title: "SaaS & Technology", href: "/industries/saas-technology", description: "Product AI, developer tools.", category: "Industries" },
  { title: "AI Readiness Assessment", href: "/ai-readiness", description: "Score your process, data, and governance.", category: "Tools" },
  { title: "ROI Calculator", href: "/roi-calculator", description: "Estimate savings from automation.", category: "Tools" },
  { title: "Start a Project", href: "/start-a-project", description: "Tell us what you need.", category: "Tools" },
  { title: "About", href: "/about", description: "Philosophy, expertise, commitments.", category: "Company" },
  { title: "Approach", href: "/approach", description: "How we deliver.", category: "Company" },
  { title: "Work", href: "/work", description: "Reference architectures.", category: "Company" },
  { title: "Insights", href: "/insights", description: "Engineering notes and guides.", category: "Company" },
  { title: "Technology", href: "/technology", description: "Our technology ecosystem.", category: "Company" },
];

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

function readRecent(): SearchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
    return raw
      .map((href) => searchItems.find((item) => item.href === href))
      .filter((item): item is SearchItem => Boolean(item))
      .slice(0, 4);
  } catch {
    return [];
  }
}

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? searchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const remember = useCallback((item: SearchItem) => {
    setOpen(false);
    try {
      const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
      const next = [item.href, ...raw.filter((h) => h !== item.href)].slice(0, 4);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* recent history is best-effort */
    }
  }, []);

  const onOpen = useCallback(() => {
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-lg rounded-xl border border-line bg-canvas shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" size={16} className="text-faint" />
          <label htmlFor="site-search-input" className="sr-only">
            Search solutions, services, industries
          </label>
          <input
            id="site-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search solutions, services, industries..."
            className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="site-search-results"
            aria-autocomplete="list"
          />
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">ESC</kbd>
        </div>
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
                      <span className="text-sm font-medium text-ink">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
        <ul id="site-search-results" className="max-h-72 overflow-y-auto p-2" role="listbox" aria-label="Search results">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-faint">No results found.</li>
          )}
          {filtered.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => remember(item)}
                className="flex flex-col rounded-lg px-3 py-2.5 transition-colors hover:bg-surface2"
                role="option"
              >
                <span className="text-xs text-faint">{item.category}</span>
                <span className="text-sm font-medium text-ink">{item.title}</span>
                <span className="text-xs text-muted">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
        )}
        <div className="border-t border-line px-4 py-2 text-[11px] text-faint">
          Press <kbd className="rounded border border-line px-1 py-0.5 font-mono">Cmd+K</kbd> to open search anywhere.
        </div>
      </div>
    </div>
  );
}
