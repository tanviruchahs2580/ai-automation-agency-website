import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: trailing-slash canonicalization, trailing-slash redirect,
 * and simple bot detection logging.
 *
 * Next.js App Router does not require trailing slashes; this middleware
 * ensures consistent canonical URLs by redirecting /path/ → /path.
 */

const TRAILING_SLASH_RE = /\/+$/;

export function middleware(request: NextRequest) {
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
