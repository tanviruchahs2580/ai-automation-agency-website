import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

function fakeClock() {
  let t = 0;
  return () => (t += 1000);
}

describe("createRateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 3,
      now: fakeClock(),
    });
    expect(limiter.check("ip1").allowed).toBe(true);
    expect(limiter.check("ip1").allowed).toBe(true);
    expect(limiter.check("ip1").allowed).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      now: fakeClock(),
    });
    limiter.check("ip1");
    limiter.check("ip1");
    const third = limiter.check("ip1");
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    let t = 0;
    const limiter = createRateLimiter({
      windowMs: 10_000,
      max: 1,
      now: () => (t += 1000),
    });
    expect(limiter.check("ip1").allowed).toBe(true);
    t += 11_000;
    expect(limiter.check("ip1").allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      now: fakeClock(),
    });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("reports remaining count", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 5,
      now: fakeClock(),
    });
    expect(limiter.check("x").remaining).toBe(4);
    expect(limiter.check("x").remaining).toBe(3);
  });
});
