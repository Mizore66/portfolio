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
test("the report lists the slowest frames with what ran in them", async ({ browser }) => {
  const ctx = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  await page.goto("/colophon?fps");
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => { const t = performance.now(); while (performance.now() - t < 120); r(); })));
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Copy report" }).click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("Slowest frames");
  expect(text).toMatch(/\n\d+ ms at [\d.]+ s, \/colophon\n  logged: .+\n  main thread: busy \d+ ms/);
  await ctx.close();
});
