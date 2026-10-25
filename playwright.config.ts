import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite runs against the production build (`next start`), not dev,
 * so assertions cover what actually ships.
 *
 * Set `PLAYWRIGHT_BASE_URL` to point the same suite at an already-running
 * deployment (staging or production) instead of a local build — the checklist
 * has always referenced this variable, but it was not read anywhere, so
 * "test the live URL" required editing this file. No web server is started
 * when a target is supplied, because one is already running.
 */
const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL?.trim();
const localBaseURL = "http://localhost:3117";
const baseURL = remoteBaseURL || localBaseURL;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  /*
    15s, not the 10s default. The suite is CPU-bound — most of it is axe-core
    waiting for a DOM to settle — and under parallel load a 10s budget produced
    failures that passed in isolation and on retry. Every remaining failure in
    the last full run behaved that way: four of them, each green when run alone.
    A gate that fails for reasons unrelated to the code teaches people to ignore
    it, so the budget is set where the work actually completes.
  */
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: 1,
  /*
    Two, locally as well as in CI.

    Playwright otherwise sizes this to the CPU count, and the axe scans starve at
    that width: they hold a page open while axe-core waits for the DOM to settle,
    and the resulting failures pass on retry and in isolation. Matching CI's width
    costs wall-clock time (about 25 minutes for the full four-project suite) and
    buys a gate whose result means the same thing locally as it does in CI, which
    is the property that matters for a pre-deploy check nobody runs on save.
  */
  workers: 2,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    colorScheme: "dark",
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /smoke\.spec\.ts/,
    },
  ],
  webServer: remoteBaseURL
    ? undefined
    : {
        command: "npx next start -p 3117",
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
