/**
 * Minimal fixed-window rate limiter for server routes.
 *
 * Suitable for single-instance deployments. For horizontally scaled
 * production, back this with Redis — the call-site contract stays identical.
 *
 * Memory is bounded by an explicit cap, not by hope. The previous version only
 * swept *expired* buckets, which helps when traffic has moved on but does
 * nothing while every bucket is still fresh: the map then grows with the
 * number of distinct keys. A caller able to present many distinct addresses —
 * trivial on a wide IPv6 range — could drive that without limit.
 *
 * If the map reaches the cap and no expired slot can be reclaimed, a new key
 * is refused. A full map of live state is a capacity ceiling, not permission to
 * forget clients' counters: dropping even a below-limit bucket gives that client
 * a fresh allowance, while dropping a blocked bucket ends a block. Either would
 * reset the exact state the limiter is meant to preserve.
 *
 * Housekeeping — dropping expired buckets across the whole map — is throttled
 * to at most once per second, because it is O(entries) and running it on every
 * check turned a full map into a per-request cost.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
  /** Current number of tracked keys. Exposed for tests and diagnostics. */
  size(): number;
}

/** Start housekeeping once the map reaches this many keys. */
const SWEEP_AT_ENTRIES = 4096;

/** Hard ceiling on tracked keys; nothing may push the map above it. */
const MAX_KEYS = 10_000;

/** Minimum gap between housekeeping sweeps, so a full map is not O(n) per request. */
const SWEEP_INTERVAL_MS = 1_000;

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  now?: () => number;
  /** Hard cap on tracked keys. Defaults to `MAX_KEYS`. */
  maxKeys?: number;
  /** Test hook, called after each full sweep. */
  onSweep?: () => void;
}): RateLimiter {
  const { windowMs, max } = options;
  const maxKeys = options.maxKeys ?? MAX_KEYS;
  if (!Number.isInteger(maxKeys) || maxKeys < 1) {
    throw new Error("maxKeys must be a positive integer");
  }
  const now = options.now ?? (() => Date.now());
  const buckets = new Map<string, Bucket>();

  let lastSweepAt = -Infinity;

  /** Drop every expired bucket. O(n), so it runs on the throttled schedule only. */
  function sweepExpired(t: number): void {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= t) buckets.delete(key);
    }
    lastSweepAt = t;
    options.onSweep?.();
  }

  /**
   * Drop expired buckets from the front of the map.
   *
   * `Map` iterates in insertion order, and every bucket is stamped
   * `t + windowMs` at insertion with one window length for the whole limiter, so
   * insertion order *is* expiry order: the first entry is the next to expire.
   * Nothing re-orders an existing bucket except re-insertion, which also moves
   * its `resetAt` later. That makes reclaiming expired entries O(1) amortised
   * instead of a full scan — which matters because this runs on the insertion
   * path, once the map is full, on every new key.
   */
  function reclaimExpired(t: number): boolean {
    let reclaimed = false;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt > t) break;
      buckets.delete(key);
      reclaimed = true;
    }
    return reclaimed;
  }

  /** Insert a bucket, keeping the map at or below the cap. */
  function insert(key: string, bucket: Bucket, t: number): boolean {
    buckets.delete(key);
    if (buckets.size >= maxKeys && !reclaimExpired(t)) {
      return false;
    }
    buckets.set(key, bucket);
    return true;
  }

  return {
    size(): number {
      return buckets.size;
    },

    check(key: string): RateLimitResult {
      const t = now();

      if (
        buckets.size >= Math.min(SWEEP_AT_ENTRIES, maxKeys) &&
        t - lastSweepAt >= SWEEP_INTERVAL_MS
      ) {
        sweepExpired(t);
      }

      const bucket = buckets.get(key);

      if (!bucket || bucket.resetAt <= t) {
        const admitted = insert(key, { count: 1, resetAt: t + windowMs }, t);
        return admitted
          ? {
              allowed: true,
              remaining: max - 1,
              retryAfterSeconds: Math.ceil(windowMs / 1000),
            }
            : /*
              The map is at capacity and no expired bucket was reclaimed. The
              incoming key is refused rather than discarding another client's
              live counter or block.
            */

            {
              allowed: false,
              remaining: 0,
              retryAfterSeconds: Math.ceil(windowMs / 1000),
            };
      }

      if (bucket.count < max) {
        bucket.count += 1;
        return {
          allowed: true,
          remaining: max - bucket.count,
          retryAfterSeconds: Math.ceil((bucket.resetAt - t) / 1000),
        };
      }

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - t) / 1000)),
      };
    },
  };
}
