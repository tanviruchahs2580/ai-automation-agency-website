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

  it("caps the bucket map and refuses new live keys rather than growing without limit", () => {
    /*
      A stream of unique keys must not grow memory without limit. Expired
      buckets may be reclaimed; when the cap is full of live state, the new key
      is refused rather than resetting an existing client's allowance.
    */
    let t = 0;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 5,
      maxKeys: 100,
      now: () => (t += 1),
    });

    for (let i = 0; i < 10_000; i += 1) limiter.check(`2001:db8:${i}::/64`);

    // The invariant is the thing: the map cannot exceed the cap.
    expect(limiter.size()).toBeLessThanOrEqual(100);
  });

  it("keeps limiting a blocked client through a flood of fresh keys", () => {
    /*
      The regression this pins was reported by an independent review and was
      introduced by the first version of the cap. That version evicted the oldest
      insertion when the map was full. Because every bucket is stamped
      `t + windowMs` at insertion, the oldest insertion is the earliest to
      expire — which is exactly the client whose window opened first, and is
      therefore exactly the client serving a block. Evicting it reset their
      allowance: a flood of distinct keys switched the limiter off for the one
      client it was holding back.

      The previous version of this test could not fail. It asserted
      `typeof outcome.allowed === "boolean"`, which is true for both outcomes and
      for an implementation that always allows, and its comment granted the
      eviction permission ("may have been evicted, which is allowed"). The
      assertion below states the property that must hold instead.
    */
    let t = 0;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      maxKeys: 10,
      now: () => (t += 1),
    });

    expect(limiter.check("victim").allowed).toBe(true);
    expect(limiter.check("victim").allowed).toBe(true);
    expect(limiter.check("victim").allowed, "third request blocks").toBe(false);

    // 50 distinct keys against a 10-key cap: an eviction storm.
    for (let i = 0; i < 50; i += 1) limiter.check(`filler-${i}`);

    // The block must survive it. This is the whole point of the limiter.
    expect(limiter.check("victim").allowed, "still blocked after the flood").toBe(false);
    expect(limiter.size()).toBeLessThanOrEqual(10);
  });

  it("rejects a zero-key cap", () => {
    expect(() =>
      createRateLimiter({
        windowMs: 60_000,
        max: 5,
        maxKeys: 0,
      }),
    ).toThrow("maxKeys must be a positive integer");
  });

  it("never exceeds a positive cap", () => {
    for (const maxKeys of [1, 2, 3]) {
      const limiter = createRateLimiter({
        windowMs: 60_000,
        max: 5,
        maxKeys,
        now: fakeClock(),
      });
      for (let i = 0; i < 200; i += 1) limiter.check(`k${i}`);
      expect(limiter.size(), `maxKeys=${maxKeys}`).toBeLessThanOrEqual(maxKeys);
    }
  });

  it("refuses a new key rather than reset a partially used live bucket", () => {
    let t = 0;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 3,
      maxKeys: 2,
      now: () => (t += 1),
    });

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("c").allowed, "the new key is refused at capacity").toBe(false);

    expect(limiter.check("a").remaining, "a's first count must be preserved").toBe(1);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed, "a must block at its original limit").toBe(false);
    expect(limiter.size()).toBe(2);
  });

  it("refuses a new key rather than forget an active block", () => {
    /*
      With every slot held by a blocked key there is no safe victim, so the
      incoming key must be refused. Admitting it by evicting a block would make
      the cap itself the bypass.
    */
    let t = 0;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      maxKeys: 2,
      now: () => (t += 1),
    });

    expect(limiter.check("a").allowed).toBe(true);
    limiter.check("a"); // "a" is now blocked and occupies a slot
    expect(limiter.check("b").allowed).toBe(true);
    limiter.check("b"); // "b" is blocked too; the map is full of blocks

    const intruder = limiter.check("c");
    expect(intruder.allowed, "no slot may be freed by dropping a block").toBe(false);
    expect(limiter.check("a").allowed, "existing block intact").toBe(false);
    expect(limiter.check("b").allowed, "existing block intact").toBe(false);
  });

  it("does not scan the whole map on every insert once full", () => {
    /*
      The first version of the cap called a full O(entries) sweep from inside
      `insert`, on every insertion, with no throttle — measured at a ~700x
      per-insert cliff exactly at the cap (0.29 us → 238 us). The previous
      version of this test counted `onSweep`, which only the throttled sweep
      calls, so it passed while the O(n) scan ran on every insert.

      This asserts the property directly: once the map is full and every key is
      live, inserting a fresh key must not cost time proportional to the map.
    */
    let t = 0;
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 5,
      maxKeys: 10_000,
      now: () => (t += 1),
    });

    for (let i = 0; i < 10_000; i += 1) limiter.check(`k${i}`);

    // All 10k buckets are live (60 s window, 10k x 1 ms elapsed) and below
    // `max`, so each new key must find a victim within the bounded scan.
    const startedAt = performance.now();
    for (let i = 0; i < 2_000; i += 1) limiter.check(`late-${i}`);
    const perInsert = (performance.now() - startedAt) / 2_000;

    // Generous: the pre-fix code measured ~240 us/insert here. Bounded-scan
    // code stays in the low single digits. 20 us separates them by an order of
    // magnitude without being sensitive to machine speed.
    expect(perInsert, `${perInsert.toFixed(2)} us/insert at the cap`).toBeLessThan(20);
    expect(limiter.size()).toBeLessThanOrEqual(10_000);
  });

  it("does not re-sweep on every check past the threshold", () => {
    /*
      The sweep is O(entries) and ran on every check once over the threshold, so
      a full map made every request progressively slower. It is now throttled to
      at most once a second; this pins that by checking the sweep does not
      re-enter while the clock is frozen.
    */
    let sweeps = 0;
    const limiter = createRateLimiter({
      windowMs: 1_000,
      max: 5,
      maxKeys: 50,
      now: () => 0, // frozen clock: no bucket ever expires
      onSweep: () => {
        sweeps += 1;
      },
    });

    for (let i = 0; i < 1_000; i += 1) limiter.check(`k${i}`);
    expect(sweeps).toBeLessThanOrEqual(2);
  });
});
