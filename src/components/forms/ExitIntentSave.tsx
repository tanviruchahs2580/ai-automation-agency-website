"use client";

import { useEffect } from "react";

const DRAFT_KEY = "vantiq:intake-draft:v1";
const SEEN_KEY = "vantiq:exit-intent-seen";
const DWELL_MS = 90_000;

/**
 * Exit-intent save prompt for /start-a-project (§14).
 * Fires at most once per session, desktop fine-pointer only, only after 90s
 * dwell, never on first paint, and only when a restorable draft exists.
 * The draft already auto-saves to this browser — the prompt surfaces that
 * fact with [Keep editing] / [Start fresh]. No email link is promised
 * because no email infrastructure exists for it (honesty rule wins).
 */
export function ExitIntentSave() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const mountTime = Date.now();
    let banner: HTMLElement | null = null;

    const show = () => {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      let draft: string | null = null;
      try {
        draft = localStorage.getItem(DRAFT_KEY);
      } catch {
        return;
      }
      if (!draft) return;
      sessionStorage.setItem(SEEN_KEY, "1");

      banner = document.createElement("div");
      banner.setAttribute("role", "dialog");
      banner.setAttribute("aria-label", "Draft saved");
      banner.className =
        "fixed bottom-6 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-line bg-surface p-5 shadow-2xl";
      banner.innerHTML =
        "<p class='mono-label uppercase text-faint'>Before you go</p>" +
        "<p class='mt-2 text-sm leading-relaxed'>Your draft is saved in this browser — pick up exactly where you left off.</p>" +
        "<div class='mt-4 flex gap-2'>" +
        "<button type='button' data-act='keep' class='btn btn-primary flex-1'>Keep editing</button>" +
        "<button type='button' data-act='fresh' class='btn btn-quiet flex-1'>Start fresh</button>" +
        "</div>";

      const dismiss = () => banner?.remove();
      banner.querySelector("[data-act='keep']")?.addEventListener("click", dismiss);
      banner.querySelector("[data-act='fresh']")?.addEventListener("click", () => {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* best-effort */
        }
        dismiss();
        window.location.reload();
      });
      document.body.appendChild(banner);
      (banner.querySelector("[data-act='keep']") as HTMLElement | null)?.focus();
    };

    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      if (Date.now() - mountTime < DWELL_MS) return;
      show();
    };

    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mouseleave", onLeave);
      banner?.remove();
    };
  }, []);

  return null;
}
