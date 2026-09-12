"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Theme = "light" | "dark";

/**
 * Theme toggle — reads the blocking pre-paint script's decision from the DOM
 * after mount (same SSR-safe rAF gate as Reveal: no hydration mismatch, no
 * theme flash). Writes go back to the same source of truth the script reads.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "light" || current === "dark") setTheme(current);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("vantiq-theme", next);
      } catch {
        /* private mode — theme simply won't persist */
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-muted transition-colors duration-150 hover:border-accent hover:text-accent-strong"
    >
      <span key={theme} className="theme-rotate inline-flex">
        <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
      </span>
    </button>
  );
}
