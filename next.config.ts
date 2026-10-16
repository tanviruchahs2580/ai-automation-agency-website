import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  /**
   * Observation-phase CSP. Watch browser console reports after launch; once
   * analytics/storage providers are known, add their origins and switch to
   * the enforcing `Content-Security-Policy` header. 'unsafe-inline' stays
   * until a nonce-based strategy (middleware) is introduced.
   */
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
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
