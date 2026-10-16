import { defineConfig, devices } from "@playwright/test";

// End-to-end checks of the key flows, run against demo mode (no real accounts or data).
const port = Number(process.env.E2E_PORT ?? 3005);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] }
    }
  ],
  webServer: {
    command: `pnpm exec next dev -p ${port}`,
    url: `http://127.0.0.1:${port}`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      APP_MODE: "demo",
      NEXT_PUBLIC_APP_MODE: "demo"
    }
  }
});
