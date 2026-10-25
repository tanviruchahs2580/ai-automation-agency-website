import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * Build-time configuration checks.
 *
 * These two variables decide whether the deployed site is indexable and whether
 * it is still shipping a placeholder brand. Both used to fail *silently*: an
 * unset `NEXT_PUBLIC_SITE_URL` outside Vercel publishes `http://localhost:3000`
 * as every canonical URL and sitemap entry (a deindexing-class defect), and a
 * placeholder brand name ships with no signal at all. A warning at build time
 * turns each into something visible in the deploy log instead of something
 * discovered after launch.
 *
 * Warnings, not errors: a production build is still a valid artefact, and CI
 * must not fail on absent production secrets.
 */
function warnOnProductionMisconfiguration(phase: string) {
  if (phase !== PHASE_PRODUCTION_BUILD) return;
  if (process.env.CI && !process.env.VERCEL) return;

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "";

  if (!origin) {
    console.warn(
      "\n[config] NEXT_PUBLIC_SITE_URL is not set. Canonical URLs, og:url and " +
        "sitemap.xml will resolve to http://localhost:3000, which deindexes the " +
        "site. Set it to the production origin (e.g. https://example.com).\n",
    );
  }

  if (!process.env.NEXT_PUBLIC_BRAND_NAME?.trim()) {
    console.warn(
      "\n[config] NEXT_PUBLIC_BRAND_NAME is not set, so the placeholder brand " +
        "name is being published. The placeholder also collides with an existing " +
        "enterprise AI vendor — see the brand note in src/data/site.ts and " +
        "LAUNCH-CHECKLIST.md §1.\n",
    );
  }
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  /*
    Isolation headers. `same-origin-allow-popups` rather than `same-origin` so
    an authentication popup opened from this origin keeps its opener, while
    cross-origin documents still lose access to `window.opener`.
  */
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

/**
 * CSP delivery mode.
 *
 * Defaults to observation (`Content-Security-Policy-Report-Only`) because the
 * directive values still carry `'unsafe-inline'` for scripts and styles, and
 * enforcing a policy containing `'unsafe-inline'` buys little while risking a
 * broken first paint. Setting `CSP_MODE=enforce` promotes the same policy to an
 * enforcing header — a configuration change rather than the code edit
 * LAUNCH-CHECKLIST.md §3 previously required. Watch the console for reports
 * before flipping it, and prefer a nonce-based `script-src` first.
 */
function cspHeaders(): typeof securityHeaders {
  const mode = process.env.CSP_MODE?.trim().toLowerCase();
  if (mode !== "enforce") return securityHeaders;

  return securityHeaders.map((header) =>
    header.key === "Content-Security-Policy-Report-Only"
      ? { key: "Content-Security-Policy", value: header.value }
      : header,
  );
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  /*
    Next infers the workspace root by walking up for a lockfile. A stray
    package-lock.json above this directory makes it pick the wrong root, which
    prints a warning on every build and widens the traced/watch scope beyond
    the project. Pin both roots to this project explicitly.
  */
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
  experimental: {
    // Trim Framer Motion to the imported modules (§10 budget enforcement).
    optimizePackageImports: ["framer-motion"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: cspHeaders() }];
  },
};

/**
 * Named rather than an inline arrow: `import/no-anonymous-default-export`
 * flags the anonymous form, and named functions are what makes a stack trace
 * inside config evaluation readable.
 */
export default function config(phase: string): NextConfig {
  warnOnProductionMisconfiguration(phase);
  return nextConfig;
}
