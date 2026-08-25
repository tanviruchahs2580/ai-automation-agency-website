/**
 * Minimal fixed-window rate limiter for server routes.
 *
 * Suitable for single-instance deployments. For horizontally scaled
 * production, back this with Redis — the call-site contract stays identical.
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
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  now?: () => number;
}): RateLimiter {
  const { windowMs, max } = options;
  const now = options.now ?? (() => Date.now());
  const buckets = new Map<string, Bucket>();

  return {
    check(key: string): RateLimitResult {
      const t = now();
      const bucket = buckets.get(key);

      if (!bucket || bucket.resetAt <= t) {
        buckets.set(key, { count: 1, resetAt: t + windowMs });
        return {
          allowed: true,
          remaining: max - 1,
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
