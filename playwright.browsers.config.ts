import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

// Phase 6: the same suite in Firefox and WebKit (Safari's engine). Run with
// npx playwright test -c playwright.browsers.config.ts
export default defineConfig({
  ...base,
  projects: [
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
