"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { readConsent, writeConsent } from "@/lib/consent";

/**
 * Cookie preference banner.
 *
 * Deliberately NOT role="dialog": this banner never traps focus, never blocks
 * the page behind it, and is dismissed with the buttons it shows. Advertising
 * dialog semantics the component does not honour is worse for assistive tech
 * than declaring a labeled region, which is what it actually is. It renders
 * immediately after the skip link in the layout so it sits near the top of the
 * accessibility tree and tab order rather than after the footer.
 *
 * Copy mirrors /cookie-policy: no analytics provider is wired up
 * (src/lib/analytics.ts tracks nothing without one, and is consent-gated when one
 * is added), so the banner must not ask consent for tracking that does not exist.
 *
 * This banner writes the preference that `src/lib/analytics.ts` reads. Both use
 * the storage key from `src/lib/consent.ts` so the two cannot disagree about
 * whether a visitor consented.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reading localStorage once on mount to decide banner visibility is
    // intentional and not reactive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!readConsent()) setVisible(true);
  }, []);

  /*
    Publish the banner's own height so fixed controls in the same corner can sit
    above it instead of underneath it. Measured rather than hard-coded, and kept
    in sync with a ResizeObserver, so it stays correct when the copy wraps to an
    extra line, when the user zooms, or at narrow widths where the banner is
    nearly full-bleed.
  */
  useEffect(() => {
    if (!visible) return;
    const card = cardRef.current;
    const root = document.documentElement;
    if (!card) return;

    const publish = () => {
      root.style.setProperty(
        "--consent-offset",
        `${card.offsetHeight + 24}px`,
      );
    };
    publish();

    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(publish);
    observer?.observe(card);

    return () => {
      observer?.disconnect();
      root.style.removeProperty("--consent-offset");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={cardRef}
      role="region"
      aria-label="Cookie preference"
      className="fixed bottom-4 end-4 z-[90] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface/95 p-5 shadow-2xl backdrop-blur-md sm:bottom-6 sm:end-6"
    >
      <p className="mono-label uppercase text-faint">Cookies</p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        This site sets no advertising or analytics cookies today, and stores
        this preference in your browser only. If analytics are enabled later,
        your answer here decides whether they run. See the{" "}
        <Link
          href="/cookie-policy"
          className="underline underline-offset-2 hover:text-ink"
        >
          cookie policy
        </Link>{" "}
        for details.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            writeConsent("declined");
            setVisible(false);
          }}
          className="btn-quiet btn min-h-10 flex-1 px-3 py-1.5 text-[13px]"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => {
            writeConsent("accepted");
            setVisible(false);
          }}
          className="btn-primary btn min-h-10 flex-1 px-3 py-1.5 text-[13px]"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
