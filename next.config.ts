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
/**
 * Next evaluates the config function more than once per build, so each warning
 * is emitted once per process rather than once per evaluation — otherwise the
 * same two lines appear twice in every deploy log and read as two problems.
 */
const warned = new Set<string>();

function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(message);
}

function warnOnProductionMisconfiguration(phase: string) {
  if (phase !== PHASE_PRODUCTION_BUILD) return;
  if (process.env.CI && !process.env.VERCEL) return;

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "";

  if (!origin) {
    warnOnce(
      "site-url",
      "\n[config] NEXT_PUBLIC_SITE_URL is not set. Canonical URLs, og:url and " +
        "sitemap.xml will resolve to http://localhost:3000, which deindexes the " +
        "site. Set it to the production origin (e.g. https://example.com).\n",
    );
  }

  if (
    process.env.NEXT_PUBLIC_BRAND_NAME?.trim() &&
    process.env.NEXT_PUBLIC_BRAND_NAME.trim() !== "ARKYON"
  ) {
    // ARKYON is the owner-confirmed public brand and the shipped default, so
    // an unset variable is the correct state. What deserves a signal now is
    // the opposite: an override renaming the site to a brand the owner has
    // not confirmed.
    warnOnce(
      "brand",
      "\n[config] NEXT_PUBLIC_BRAND_NAME is set to a value other than ARKYON, " +
        "so this build publishes a brand the owner has not confirmed — see " +
        "the brand note in src/data/site.ts.\n",
    );
  }
}

const securityHeaders = [
  /*
    `on` was the default choice for prefetching, but the site loads nothing from
    a third-party origin — no CDN, no fonts, no analytics — so prefetching has
    nothing to resolve and the header only tells the browser it may prerender
    arbitrary DNS names a link points at. `off` removes that without any cost,
    and it is transmitted rather than merely omitted so every response states
    the policy explicitly.
  */
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  /*
    The legacy XSS auditor is removed from every current browser. Where it still
    exists it is a liability: its heuristics have been used to *introduce*
    reflected-XSS gadgets by stripping page fragments, and it can be steered into
    blocking attacker-chosen content. `0` turns it off explicitly; CSP is the
    real control. The header is sent anyway because a proxy or an old client
    stack may still honour it.
  */
  { key: "X-XSS-Protection", value: "0" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  /*
    Isolation headers. `same-origin-allow-popups` rather than `same-origin` so
    an authentication popup opened from this origin keeps its opener, while
    cross-origin documents still lose access to `window.opener`.
  */
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  /*
    Guarantees no cross-origin resource is embedded without its own opt-in. Safe
    here because the site loads nothing from another origin — measured: zero
    remote `src`/`href` subresources across the rendered documents, and the only
    absolute URLs are the canonical/RSS links in metadata, which are not fetched.
    If a third-party embed is ever added it must carry `Cross-Origin-Resource-Policy`
    or this header will block it, which is the intended trade.
  */
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
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
      /*
        `upgrade-insecure-requests` is deliberately absent. It is ignored in a
        report-only policy — the browser says so in the console, which the
        console-cleanliness test caught — so adding it here would be decoration
        that changes nothing. It belongs in the enforcing policy, in the same
        change that sets CSP_MODE=enforce.
      */
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
 * LAUNCH-CHECKLIST.md §3 previously required.
 *
 * This is observation with **no reporter**: neither `report-to` nor `report-uri`
 * is set, so violations surface only in the browser's own console. That is a
 * real limitation rather than a detail — nobody is notified, and only someone
 * with devtools open sees anything. Adding a collector means sending every
 * blocked-request URL to a third party, which is a privacy decision the owner
 * has not made, so it is deferred rather than forgotten. Until then, "watch the
 * console before flipping it" means exactly that, and prefer a nonce-based
 * `script-src` first.
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
