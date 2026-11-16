import { expect, test } from "@playwright/test";

/**
 * Security headers as a gated surface.
 *
 * These headers were configured in `next.config.ts` and were verified by hand
 * once, which is not a gate: nothing failed if a header was dropped, misspelled,
 * or overridden by a route. The frontend suite covered content and layout; the
 * unit suite covered pure logic. This file is the missing third case — the
 * response headers an actual server actually emitted.
 *
 * Assertions are on *values*, not presence. `strict-origin-when-cross-origin`
 * degraded to `no-referrer-when-downgrade` is still a present header, and still
 * the wrong policy; a presence check would pass it.
 *
 * No browser is launched: `request` is the APIRequestContext and talks to the
 * same production build the rest of the suite runs against.
 */

const HSTS = "max-age=63072000; includeSubDomains; preload";

/** Headers every response must carry, identical across routes and asset types. */
const COMMON = {
  "x-dns-prefetch-control": "off",
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "x-xss-protection": "0",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cross-origin-opener-policy": "same-origin-allow-popups",
  "cross-origin-resource-policy": "same-origin",
  "cross-origin-embedder-policy": "require-corp",
  "x-permitted-cross-domain-policies": "none",
  "origin-agent-cluster": "?1",
  "strict-transport-security": HSTS,
} as const;

async function headersFor(
  request: import("@playwright/test").APIRequestContext,
  path: string,
): Promise<Record<string, string>> {
  const response = await request.get(path);
  // A 404 would also carry headers, so the status is asserted by callers rather
  // than inferred here — but a redirect would make this assert on the wrong hop.
  expect(response.status(), `${path} must serve directly, not redirect`).toBeLessThan(300);
  return response.headers();
}

test.describe("security headers", () => {
  test("a page response carries the full set", async ({ request }) => {
    const headers = await headersFor(request, "/");

    for (const [name, value] of Object.entries(COMMON)) {
      expect(headers[name], name).toBe(value);
    }
  });

  test("a static asset carries them too", async ({ request }) => {
    /*
      The security headers are declared on `/(.*)`, which is supposed to cover
      everything. A narrower source would silently exempt assets — the classic
      way HSTS ends up missing on exactly the subresource that gets sniffed.
    */
    const page = await request.get("/");
    const html = await page.text();
    const asset = /\/_next\/static\/[^"']+?\.(?:js|css)/.exec(html)?.[0];

    expect(asset, "the rendered page must reference at least one static asset").toBeTruthy();
    const headers = await headersFor(request, asset!);

    for (const [name, value] of Object.entries(COMMON)) {
      expect(headers[name], `${name} on ${asset}`).toBe(value);
    }
  });

  test("an API response carries them and is never cacheable", async ({ request }) => {
    /*
      A POST, because that is the shape real traffic uses. The body is
      deliberately invalid: this asserts transport headers, and a request that
      reaches validation proves the handler ran rather than a CDN short-circuit.
      Nothing is submitted, so no notification is triggered.
    */
    const response = await request.post("/api/project-brief", {
      data: {},
      headers: { "content-type": "application/json" },
    });

    expect(response.status()).toBe(422);
    const headers = response.headers();
    for (const [name, value] of Object.entries(COMMON)) {
      expect(headers[name], name).toBe(value);
    }
    // Personal data must never be cached by a CDN or the browser.
    expect(headers["cache-control"]).toBe("no-store");
  });

  test("the policy is delivered and well-formed", async ({ request }) => {
    /*
      Either the report-only or the enforcing header is acceptable here: which
      one ships is `CSP_MODE`, an operational choice, and this gate must not
      force it. What must hold is that exactly one is present and that it states
      the directives the config intends — a truncated or empty policy is a
      silently disabled control.
    */
    const headers = await headersFor(request, "/");
    const reportOnly = headers["content-security-policy-report-only"];
    const enforced = headers["content-security-policy"];

    expect(
      Number(Boolean(reportOnly)) + Number(Boolean(enforced)),
      "exactly one CSP header must be present",
    ).toBe(1);

    const policy = enforced ?? reportOnly;
    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]) {
      expect(policy, directive).toContain(directive);
    }
  });

  test("the framework does not advertise itself", async ({ request }) => {
    const headers = await headersFor(request, "/");
    // `poweredByHeader: false` is the config; this is the assertion.
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});
