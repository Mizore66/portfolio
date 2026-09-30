import { test, expect } from "@playwright/test";

// The frame-rate readout for real devices (phase 6, step 5): off for every visitor, on with ?fps for the tab.
test("the frame-rate readout shows only with ?fps, and stays until ?fps=0", async ({ page }) => {
  await page.goto("/colophon");
  await expect(page.locator(".frame-meter")).toHaveCount(0);
  await page.goto("/colophon?fps");
  await expect(page.locator(".frame-meter")).toContainText("fps");
  await page.goto("/resume");
  await expect(page.locator(".frame-meter")).toBeVisible();
  await page.goto("/colophon?fps=0");
  await expect(page.locator(".frame-meter")).toHaveCount(0);
});
