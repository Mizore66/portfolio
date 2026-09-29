import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Phase 5, step 4d: Contact, the ending (contact-a). design/motion.md §6.
const seam = (page: Page) => page.locator(".site").evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue("--seam")).toFixed(1));
const ink = (page: Page) => page.locator('.contact [data-layer="ink"]');
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1")); });

test.describe("Contact", () => {
  test("is 11. and an open move, the address, the links and the clock, on the seam at 55.9%", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/contact");
    await expect(page).toHaveURL(/\/#contact$/); // the one page's Contact section
    await expect(page.locator("#contact").getByRole("heading", { level: 2 })).toHaveText("11.");
    await expect(ink(page)).toContainText("Your move.");
    await expect(ink(page).getByRole("link", { name: "anasqumhiyeh@gmail.com" })).toHaveAttribute("href", "mailto:anasqumhiyeh@gmail.com");
    const links = ink(page).getByRole("list").getByRole("link");
    await expect(links).toHaveText(["Email", "LinkedIn", "GitHub", "Résumé"]);
    await expect(links.nth(1)).toHaveAttribute("href", "https://linkedin.com/in/anasqumhiyeh/");
    await expect(links.nth(2)).toHaveAttribute("href", "https://github.com/Mizore66");
    await expect(links.nth(3)).toHaveAttribute("href", "/resume");
    await expect.poll(() => seam(page), { timeout: 20_000 }).toBe("55.9");
    expect(errors).toEqual([]);
  });

  test("the clock: your face runs to the second, Anas's runs in Kuala Lumpur time", async ({ page, context }) => {
    test.setTimeout(90_000);
    await context.clearCookies();
    await page.goto("/contact");
    const faces = page.locator(".clock .face");
    await expect(faces.nth(1).locator("small")).toHaveText("Anas, MYT", { timeout: 30_000 });
    const kl = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kuala_Lumpur" });
    await expect(faces.nth(1).locator("b")).toHaveText(kl);
    const s0 = await faces.nth(0).locator("sup").textContent();
    await expect(faces.nth(0).locator("sup")).not.toHaveText(s0!, { timeout: 30_000 }); // the page builds its scenes in idle time after load, slow under software GL
  });

  test("Copy email puts the address on the clipboard", async ({ page, context, browserName }) => {
    test.setTimeout(90_000);
    // only Chromium lets a test grant the clipboard and read it back, so this runs there alone
    test.skip(browserName !== "chromium", "the clipboard can be granted to a test only in Chromium");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/contact");
    await expect(page.locator(".site[data-seam-bound]")).toBeAttached({ timeout: 60_000 }); // hydrated: the button is live
    const button = ink(page).getByRole("button", { name: "Copy email" });
    await button.click();
    await expect(ink(page).getByRole("button", { name: "Copied" })).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("anasqumhiyeh@gmail.com");
    await expect(ink(page).getByRole("button", { name: "Copy email" })).toBeVisible({ timeout: 30_000 });
  });

  test("the caret blinks once the page has arrived", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator(".contact")).toHaveAttribute("data-caret", "on", { timeout: 30_000 });
  });

  test("is accessible", async ({ page }) => {
    await page.goto("/contact");
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test("no sideways scrolling at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/contact");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("everything is in place, the caret steady, the clock by the minute", async ({ page }) => {
      await page.goto("/contact");
      await expect(page.locator(".contact")).toHaveAttribute("data-caret", "on");
      await expect(page.locator(".clock .face").first().locator("sup")).toHaveCount(0);
      await expect(ink(page).getByText("Your move.")).toBeVisible({ timeout: 30_000 });
    });
  });
});
