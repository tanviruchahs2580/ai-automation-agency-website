"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Theme = "light" | "dark";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("vantiq-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const initialRef = useRef(true);

  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      setTheme(getStoredTheme());
      return;
    }
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("vantiq-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

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
