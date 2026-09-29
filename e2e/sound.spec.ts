import { test, expect } from "@playwright/test";

// Phase 5, step 5: the sound toggle (motion.md, "Sound"). Off by default, opt-in, remembered; nothing loads until on.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1")); });
const toggle = (page: import("@playwright/test").Page) => page.locator('.chrome [data-layer="ink"]').getByRole("button", { name: /^Sound (off|on)$/ });

test("every page has the toggle in its bottom-right corner, off, and no sound is fetched", async ({ page }) => {
  test.setTimeout(180_000); // five 3D pages in a row under software GL
  const fetched: string[] = [];
  page.on("request", (r) => r.url().includes("/sound/") && fetched.push(r.url()));
  for (const path of ["/", "/work", "/roles", "/lab", "/contact"]) {
    await page.goto(path);
    const t = toggle(page);
    // the hero holds the chrome back until its stage is up, which under software GL can take a while
    await expect(t, path).toHaveText("Sound off", { timeout: 30_000 });
    await expect(t).toHaveAttribute("aria-pressed", "false");
    const box = (await t.boundingBox())!, vp = page.viewportSize()!;
    expect(vp.width - (box.x + box.width)).toBeLessThan(60);
    expect(vp.height - (box.y + box.height)).toBeLessThan(60);
  }
  expect(fetched).toEqual([]);
});

test("turning it on loads the four cues and is remembered", async ({ page }) => {
  test.setTimeout(90_000);
  const fetched: string[] = [];
  page.on("request", (r) => r.url().includes("/sound/") && fetched.push(new URL(r.url()).pathname));
  await page.goto("/work");
  await toggle(page).click();
  await expect(toggle(page)).toHaveText("Sound on");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => [...fetched].sort()).toEqual(["/sound/break.m4a", "/sound/place.m4a", "/sound/seam.m4a", "/sound/tick.m4a"]);
  await page.reload();
  await expect(toggle(page)).toHaveText("Sound on", { timeout: 30_000 });
  await toggle(page).click();
  await expect(toggle(page)).toHaveText("Sound off");
});
