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

// The owner's Mac showed single 0.8-0.9 s frames that could not be reproduced here: the report names what ran in each.
test("the report lists the slowest frames with what ran in them", async ({ page, browserName }) => {
  // what is copied, kept: clipboard permissions are Chromium's alone, and the suite also runs in Firefox and WebKit
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: (t: string) => { (window as unknown as { copied: string }).copied = t; return Promise.resolve(); } } });
  });
  await page.goto("/colophon?fps");
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => { const t = performance.now(); while (performance.now() - t < 120); r(); })));
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Copy report" }).click();
  const text = await page.evaluate(() => (window as unknown as { copied: string }).copied);
  expect(text).toContain("Slowest frames");
  // only Chromium reports long animation frames; the others say so
  const thread = browserName === "chromium" ? "busy \\d+ ms" : "not reported by this browser";
  expect(text).toMatch(new RegExp(`\\n\\d+ ms at [\\d.]+ s, /colophon\\n  logged: .+\\n  main thread: ${thread}`));
});
