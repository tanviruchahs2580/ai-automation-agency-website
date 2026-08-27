"use client";

import { useEffect, useRef, useState } from "react";

const CONSENT_KEY = "vantiq-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const stored = localStorage.getItem(CONSENT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage once on mount to decide banner visibility is intentional and not reactive
      if (!stored) setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 z-[90] w-full border-t border-line bg-canvas/95 p-4 shadow-lg backdrop-blur-md sm:p-6">
      <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          We use essential cookies for site functionality. Optional analytics
          cookies help us improve. You can change your preference at any time.
          See our{" "}
          <a href="/cookie-policy" className="underline underline-offset-2 hover:text-ink">
            cookie policy
          </a>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={decline}
            className="rounded-md border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-ink"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}