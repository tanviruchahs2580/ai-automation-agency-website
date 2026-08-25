import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite runs against the production build (`next start`), not dev,
 * so assertions cover what actually ships.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3117",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /smoke\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npx next start -p 3117",
    url: "http://localhost:3117",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
