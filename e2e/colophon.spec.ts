import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Phase 6, step 4: the colophon (key frame colophon-a), linked from Contact after Résumé.
test.describe("the colophon", () => {
  test("says how the site was made, on paper, with its credits", async ({ page }) => {
    await page.goto("/colophon");
    await expect(page).toHaveTitle("How this site was made · Anas Qumhiyeh");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("How this site was made.");
    for (const h of ["The seam", "Type", "The engine", "Made for this site", "Publishing", "Tested"]) await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
    await expect(page.locator("[data-layer=ink]").getByText("The PeSTO piece-square tables by Ronald Friederich.")).toBeVisible();
    await expect(page.locator("[data-layer=ink]").getByText("Designed and built by Anas Qumhiyeh.")).toBeVisible();
    await expect.poll(() => page.locator(".site").evaluate((e) => getComputedStyle(e).getPropertyValue("--seam"))).toBe("100%");
    // the perft receipt settles on the engine's own numbers
    await expect(page.locator("[data-layer=ink] [data-count]")).toHaveText(["20", "400", "8,902"]);
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test("no sideways scroll on a small phone, and the notes end clear of the sound toggle", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/colophon");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    const [by, toggle] = await Promise.all([
      page.locator("[data-layer=ink] .co-by").boundingBox(),
      page.locator(".chrome [data-layer=ink] .sound-toggle").boundingBox(),
    ]);
    expect(by!.y + by!.height).toBeLessThan(toggle!.y);
  });

  test("Contact links to it after Résumé, and the seam floods to paper on the way", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
    await page.goto("/#contact");
    const links = page.locator("#contact [data-layer=ink] .ct-links a");
    await expect(links).toHaveText(["Email", "LinkedIn", "GitHub", "Résumé", "Colophon"]);
    await links.last().click();
    await expect(page).toHaveURL(/\/colophon$/);
    await expect.poll(() => page.locator(".site").evaluate((e) => getComputedStyle(e).getPropertyValue("--seam")), { timeout: 10_000 }).toBe("100%");
  });
});
