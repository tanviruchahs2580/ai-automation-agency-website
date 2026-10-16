"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "vantiq-cookie-consent";

/**
 * Storage access is wrapped: browsers in strict privacy modes (and
 * enterprise policy) throw SecurityError on localStorage, and an unguarded
 * throw here would leave the banner stuck on screen with dead buttons.
 * A failed read is treated as "no choice recorded yet".
 */
function readConsent(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function writeConsent(value: "accepted" | "declined"): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* Preference is not persisted; the banner simply reappears next visit. */
  }
}

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
 * (src/lib/analytics.ts dispatches to a hook point only), so the banner must
 * not ask consent for tracking that does not exist.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reading localStorage once on mount to decide banner visibility is
    // intentional and not reactive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!readConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preference"
      className="fixed bottom-4 right-4 z-[90] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface/95 p-5 shadow-2xl backdrop-blur-md sm:bottom-6 sm:right-6"
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
