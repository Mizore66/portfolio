import { test, expect, type Page } from "@playwright/test";

// Tablets (the owner, 2026-10-02): held upright, the phone composition at tablet scale, with Play's controls in two
// columns under the board and Contact's links beside the clock; on their side, the desktop composition with Play and
// Contact made to fit the width.
const box = (page: Page, sel: string) => page.locator(sel).first().boundingBox().then((b) => b!);

test.describe("a tablet held upright", () => {
  test.use({ viewport: { width: 834, height: 1194 }, isMobile: true, hasTouch: true });
  test("no page scrolls sideways", async ({ page }) => {
    test.setTimeout(120_000);
    for (const path of ["/", "/lab", "/roles/deriv", "/work/faultline", "/colophon", "/resume"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
  });
  test("Play's options and its account stand side by side under the board", async ({ page }) => {
    await page.goto("/#lab");
    const opts = await box(page, '#lab [data-ch="7"] [data-layer=ink] .opts'), say = await box(page, '#lab [data-ch="7"] [data-layer=ink] .say');
    expect(say.x).toBeGreaterThan(opts.x + opts.width);
    expect(Math.abs(say.y + say.height - (opts.y + opts.height))).toBeLessThan(200); // the same foot, not stacked
  });
  test("Contact's links stand beside the clock", async ({ page }) => {
    await page.goto("/#contact");
    const clock = await box(page, "#contact [data-layer=ink] .clock, #contact .clock"), links = await box(page, "#contact [data-layer=ink] .ct-links");
    expect(links.x).toBeGreaterThan(clock.x + clock.width);
    expect(links.y).toBeLessThan(clock.y + clock.height);
  });
});

test.describe("a tablet on its side", () => {
  test.use({ viewport: { width: 1024, height: 768 } });
  test("Contact's links start clear of the clock, and the clock of the address", async ({ page }) => {
    await page.goto("/#contact");
    const clock = await box(page, "#contact .clock"), links = await box(page, "#contact [data-layer=ink] .ct-links"), copy = await box(page, "#contact [data-layer=ink] .ct-copy");
    expect(links.x).toBeGreaterThan(clock.x + clock.width);
    expect(clock.x).toBeGreaterThan(copy.x + copy.width);
  });
  test("Play's title is one line, clear of the controls", async ({ page }) => {
    await page.goto("/lab");
    const ttl = await box(page, '[data-ch="7"] [data-layer=ink] .ttl'), ctl = await box(page, '[data-ch="7"] [data-layer=ink] .ctl');
    expect(ttl.height).toBeLessThan(110);
    expect(ttl.y + ttl.height).toBeLessThan(ctl.y);
  });
});
