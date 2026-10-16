"use client";

import { useEffect, useRef, useState } from "react";

const DRAFT_KEY = "vantiq:intake-draft:v1";
const SEEN_KEY = "vantiq:exit-intent-seen";
const DWELL_MS = 90_000;

/**
 * Storage access is wrapped because these APIs throw SecurityError in strict
 * privacy modes and under enterprise policy. An unguarded read on the mount
 * path would kill the effect; an unguarded write would leave the prompt
 * re-arming on every leave.
 */
function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* Prompt still shows; it may show again next visit. */
  }
}

function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function removeLocal(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* best-effort */
  }
}

/**
 * Exit-intent save prompt for /start-a-project (§14).
 * Fires at most once per session, desktop fine-pointer only, only after 90s
 * dwell, never on first paint, and only when a restorable draft exists.
 * The draft already auto-saves to this browser — the prompt surfaces that
 * fact with [Keep editing] / [Start fresh]. No email link is promised
 * because no email infrastructure exists for it (honesty rule wins).
 *
 * Rendered as React state rather than injected HTML so the copy stays in the
 * component system, and so dismissal can restore focus instead of dropping it
 * on <body>. Focus moves to the primary action on open (which is what makes
 * role="dialog" accurate here) and returns to the previously focused element
 * on close; Escape dismisses.
 */
export function ExitIntentSave() {
  const [visible, setVisible] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (readSession(SEEN_KEY)) return;
    // Touch and coarse-pointer devices have no exit gesture.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const mountTime = Date.now();
    let armed = true;

    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      if (Date.now() - mountTime < DWELL_MS) return;
      if (!armed || readSession(SEEN_KEY)) return;
      if (!readLocal(DRAFT_KEY)) return;
      armed = false;
      writeSession(SEEN_KEY, "1");
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setVisible(true);
    };

    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, []);

  useEffect(() => {
    if (visible) {
      keepRef.current?.focus();
      return;
    }
    // The element that had focus before the prompt opened gets it back, so
    // keyboard users are not dropped to the top of the document.
    restoreFocusRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Draft saved"
      className="fixed bottom-6 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-line bg-surface p-5 shadow-2xl"
    >
      <p className="mono-label uppercase text-faint">Before you go</p>
      <p className="mt-2 text-sm leading-relaxed">
        Your draft is saved in this browser — pick up exactly where you left off.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          ref={keepRef}
          type="button"
          onClick={() => setVisible(false)}
          className="btn btn-primary flex-1"
        >
          Keep editing
        </button>
        <button
          type="button"
          onClick={() => {
            removeLocal(DRAFT_KEY);
            window.location.reload();
          }}
          className="btn btn-quiet flex-1"
        >
          Start fresh
        </button>
      </div>
    </div>
  );
}
