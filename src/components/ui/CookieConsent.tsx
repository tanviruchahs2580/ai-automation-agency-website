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
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 right-4 z-[90] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface/95 p-5 shadow-2xl backdrop-blur-md sm:bottom-6 sm:right-6"
    >
      <p className="mono-label uppercase text-faint">Cookies</p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        We use essential cookies for site functionality. Optional analytics
        cookies help us improve. You can change your preference at any time.
        See our{" "}
        <a href="/cookie-policy" className="underline underline-offset-2 hover:text-ink">
          cookie policy
        </a>{" "}
        for details.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={decline}
          className="btn-quiet btn min-h-10 flex-1 px-3 py-1.5 text-[13px]"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={accept}
          className="btn-primary btn min-h-10 flex-1 px-3 py-1.5 text-[13px]"
        >
          Accept
        </button>
      </div>
    </div>
  );
}