import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Request proxy: trailing-slash canonicalization.
 *
 * Next.js App Router does not require trailing slashes, so `/path/` and
 * `/path` would otherwise both serve the same page under two URLs. This
 * redirects the slashed form to the clean one with 308, so the canonical URL
 * emitted by `buildMetadata` is the only one that resolves.
 *
 * Named `proxy` and placed at `src/proxy.ts` because Next.js 16 renamed the
 * `middleware` file convention to `proxy`; the file previously also claimed to
 * do "simple bot detection logging", which was never implemented.
 */

const TRAILING_SLASH_RE = /\/+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js paths, API routes, and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Redirect trailing slash to clean path (except root /)
  if (pathname.length > 1 && TRAILING_SLASH_RE.test(pathname)) {
    const cleanPath = pathname.replace(TRAILING_SLASH_RE, "");
    const url = request.nextUrl.clone();
    url.pathname = cleanPath;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and internals
    "/((?!_next|api|favicon.ico|.*\\..*).*)",
  ],
};
