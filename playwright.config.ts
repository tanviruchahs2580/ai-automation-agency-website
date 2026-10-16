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
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 1,
  workers: process.env.CI ? 2 : undefined,
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
