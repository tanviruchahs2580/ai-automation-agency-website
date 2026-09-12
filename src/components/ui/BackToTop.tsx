"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-canvas/90 text-muted shadow-lg backdrop-blur-md transition-colors hover:border-accent hover:text-accent-strong"
    >
      <Icon name="arrow-up" size={16} />
    </button>
  );
}
