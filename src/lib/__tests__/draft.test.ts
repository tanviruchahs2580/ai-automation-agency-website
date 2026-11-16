import { describe, expect, it } from "vitest";
import { DRAFT_TTL_MS, isDraftRestorable } from "@/lib/draft";

/**
 * Draft expiry.
 *
 * The draft holds the visitor's name, email and problem statement in
 * `localStorage`. Before this, nothing aged it out: the documented retention
 * window did not apply to the browser copy, and a shared machine exposed the
 * previous visitor's brief indefinitely.
 */
describe("isDraftRestorable", () => {
  const now = Date.UTC(2026, 10, 15, 12, 0, 0);

  it("restores a fresh draft", () => {
    expect(isDraftRestorable(now - 1_000, now)).toBe(true);
    expect(isDraftRestorable(now, now)).toBe(true);
  });

  it("restores one second before the TTL and expires one second after", () => {
    expect(isDraftRestorable(now - DRAFT_TTL_MS + 1_000, now)).toBe(true);
    expect(isDraftRestorable(now - DRAFT_TTL_MS - 1_000, now)).toBe(false);
  });

  it("expires a draft that is exactly at the TTL", () => {
    // Boundary is exclusive: at the TTL the retention window has elapsed.
    expect(isDraftRestorable(now - DRAFT_TTL_MS, now)).toBe(false);
  });

  it("refuses to trust a savedAt that is not a finite number", () => {
    /*
      Treating a malformed value as valid would let a corrupted or tampered
      entry keep PII on disk indefinitely — the exact failure being fixed.
    */
    for (const value of [undefined, null, "2026-11-15", NaN, Infinity, -Infinity, {}, []]) {
      expect(isDraftRestorable(value, now), String(value)).toBe(false);
    }
  });

  it("treats a future timestamp as untrusted rather than fresh", () => {
    // A clock change or hand-edited entry must not extend the window.
    expect(isDraftRestorable(now + 60_000, now)).toBe(false);
  });
});
