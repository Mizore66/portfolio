import { test, expect } from "@playwright/test";

// Phase 6, step 5: a scene more than a screen away gives up its drawing buffers (keep.ts). On the owner's Mac the one
// page held 1.6 GB of them and the Lab 2.8 GB, and page changes went black. A scene coming near has them back.
const sizes = (page: import("@playwright/test").Page) => page.evaluate(() =>
  Object.fromEntries([...document.querySelectorAll("canvas")].map((c) => [c.closest("section")?.id || c.closest("section")?.className.split(" ")[0], c.width])));

test("far scenes sleep, and wake before they are seen", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
  await page.goto("/");
  await expect.poll(async () => (await sizes(page)).roles, { timeout: 15_000 }).toBeGreaterThan(1);
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
