import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * SITE_URL is computed at module-evaluation time from the environment, so
 * each case re-imports the module with a stubbed env value. These tests pin
 * the contract that builds can never crash on a bad env var (regression
 * guard for the Vercel deploy where an empty NEXT_PUBLIC_SITE_URL produced
 * `new URL("")` → ERR_INVALID_URL).
 */
async function loadSiteUrl(envValue: string | undefined): Promise<string> {
  vi.resetModules();
  if (envValue === undefined) {
    vi.unstubAllEnvs();
  } else {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", envValue);
  }
  const mod = await import("@/lib/seo");
  return mod.SITE_URL;
}

/**
 * Resolution with no NEXT_PUBLIC_SITE_URL but with the hosting platform's own
 * system variables present. Vercel exposes both at build time, so a deploy that
 * forgets the env var must still publish correct canonicals instead of
 * self-canonicalising every page to localhost.
 */
async function loadSiteUrlWithPlatformEnv(env: {
  production?: string;
  deployment?: string;
}): Promise<string> {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", env.production ?? "");
  vi.stubEnv("VERCEL_URL", env.deployment ?? "");
  const mod = await import("@/lib/seo");
  return mod.SITE_URL;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("SITE_URL resolution", () => {
  it("falls back to localhost when unset", async () => {
    expect(await loadSiteUrl(undefined)).toBe("http://localhost:3000");
  });

  it("treats an empty string as unset (Vercel panel saves empty vars)", async () => {
    expect(await loadSiteUrl("")).toBe("http://localhost:3000");
  });

  it("treats whitespace as unset", async () => {
    expect(await loadSiteUrl("   ")).toBe("http://localhost:3000");
  });

  it("prepends https:// to protocol-less production domains", async () => {
    expect(await loadSiteUrl("vantiqsystems.com")).toBe(
      "https://vantiqsystems.com",
    );
  });

  it("keeps full origins untouched", async () => {
    expect(await loadSiteUrl("https://vantiqsystems.com")).toBe(
      "https://vantiqsystems.com",
    );
    expect(await loadSiteUrl("http://localhost:3117")).toBe(
      "http://localhost:3117",
    );
  });

  it("strips trailing slashes, paths and queries via origin normalization", async () => {
    expect(await loadSiteUrl("https://vantiqsystems.com/")).toBe(
      "https://vantiqsystems.com",
    );
    expect(await loadSiteUrl("https://vantiqsystems.com/some/path?x=1")).toBe(
      "https://vantiqsystems.com",
    );
  });

  it("keeps http:// for localhost-style hosts without a protocol", async () => {
    expect(await loadSiteUrl("localhost:3000")).toBe("http://localhost:3000");
    expect(await loadSiteUrl("127.0.0.1:3117")).toBe("http://127.0.0.1:3117");
  });

  it("never throws on unparseable garbage — falls back instead", async () => {
    expect(await loadSiteUrl("ht!tp://bad value")).toBe(
      "http://localhost:3000",
    );
  });
});

describe("SITE_URL platform fallback", () => {
  it("prefers the stable production domain over the deployment URL", async () => {
    expect(
      await loadSiteUrlWithPlatformEnv({
        production: "ai-automation-agency-website-lilac.vercel.app",
        deployment: "ai-automation-agency-website-abc123.vercel.app",
      }),
    ).toBe("https://ai-automation-agency-website-lilac.vercel.app");
  });

  it("uses the deployment URL when no production domain is exposed", async () => {
    expect(
      await loadSiteUrlWithPlatformEnv({
        deployment: "ai-automation-agency-website-abc123.vercel.app",
      }),
    ).toBe("https://ai-automation-agency-website-abc123.vercel.app");
  });

  it("still falls back to localhost with no env at all", async () => {
    expect(await loadSiteUrlWithPlatformEnv({})).toBe("http://localhost:3000");
  });

  it("prefers an explicit NEXT_PUBLIC_SITE_URL over the platform variables", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vantiqsystems.com");
    vi.stubEnv(
      "VERCEL_PROJECT_PRODUCTION_URL",
      "ai-automation-agency-website-lilac.vercel.app",
    );
    const mod = await import("@/lib/seo");
    expect(mod.SITE_URL).toBe("https://vantiqsystems.com");
  });
});
