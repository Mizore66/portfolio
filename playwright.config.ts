import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // four at once: six (the default here, half the cores) left three or four of the 89 timing out in each full run,
  // each passing alone; the scenes are drawn in software, so more at once only queues them
  workers: 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // the test browser has no GPU: every shader compiles on the main thread, seconds a scene, and the page can be busy
  // for 10 s at a time while the one page builds its scenes ahead
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  // CI runs the suite against the production build (`npm run build` runs first).
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
