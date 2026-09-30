import { test, expect } from "@playwright/test";

// Phase 6, step 5: a scene more than a screen away gives up its drawing buffers (keep.ts). On the owner's Mac the one
// page held 1.6 GB of them and the Lab 2.8 GB, and page changes went black. A scene coming near has them back.
const sizes = (page: import("@playwright/test").Page) => page.evaluate(() =>
  Object.fromEntries([...document.querySelectorAll("canvas")].map((c) => [c.closest("section")?.id || c.closest("section")?.className.split(" ")[0], c.width])));

test("far scenes sleep, and wake before they are seen", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
  await page.goto("/");
  await expect.poll(async () => (await sizes(page)).roles, { timeout: 60_000 }).toBeGreaterThan(1);
  await page.evaluate(() => document.getElementById("contact")!.scrollIntoView());
  await expect.poll(async () => { const s = await sizes(page); return [s.top, s.roles, s.work, s.archive]; }).toEqual([1, 1, 1, 1]);
  await page.evaluate(() => document.getElementById("work")!.scrollIntoView());
  await expect.poll(async () => (await sizes(page)).work).toBeGreaterThan(1);
  // no frame shows a sleeping canvas on screen, even straight after a jump
  const empty = await page.evaluate(async () => {
    scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(r));
    return [...document.querySelectorAll("canvas")].filter((c) => { const r = c.getBoundingClientRect(); return c.width <= 1 && r.bottom > 0 && r.top < innerHeight; }).length;
  });
  expect(empty).toBe(0);
});

// Play's scene on the one page is kept like the others (the frame report: rebuilding it on every return cost the
// owner's Mac an 800 ms frame each time). Back from another page it is the same canvas, and the game still drives it.
test("Play's board is kept across a page change, and still answers the game", async ({ page }) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
  await page.goto("/#contact");
  const pin = page.locator('#lab [data-ch="7"] .ch-pin');
  // built (once the scroll is still: a new canvas is 300 px wide until its renderer sizes it), and near, so awake
  await expect.poll(() => pin.locator("canvas").first().evaluate((c) => (c as HTMLCanvasElement).width === Math.round(c.clientWidth * devicePixelRatio)), { timeout: 60_000 }).toBe(true);
  await pin.locator("canvas").first().evaluate((c) => { (c as HTMLCanvasElement & { mark?: number }).mark = 7; });
  await page.locator("#contact [data-layer=ink] .ct-links a").last().click();
  await expect(page).toHaveURL(/\/colophon$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect.poll(() => pin.locator("canvas").first().evaluate((c) => (c as HTMLCanvasElement & { mark?: number }).mark ?? 0), { timeout: 60_000 }).toBe(7); // the one page mounting again takes a while under load
  // brought on screen it wakes, and choosing Black turns its board round
  await page.evaluate(() => { const s = document.querySelector('#lab [data-ch="7"]')!; scrollTo(0, s.getBoundingClientRect().top + scrollY); });
  await expect.poll(() => pin.locator("canvas").first().evaluate((c) => (c as HTMLCanvasElement).width)).toBeGreaterThan(1);
  await page.waitForTimeout(1500);
  const before = await pin.locator("canvas").first().screenshot();
  await page.locator('[data-ch="7"] [data-layer="ink"]').getByRole("button", { name: "Black" }).click();
  await page.waitForTimeout(1500);
  expect((await pin.locator("canvas").first().screenshot()).equals(before)).toBe(false);
});
