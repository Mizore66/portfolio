import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// design/motion.md, "Navigation": every page change is the seam sweeping from where it is to where the
// next page rests. The URL changes at the start; Back and Forward play the same sweep.
const REST: Record<string, string> = { "/": "55.9", "/work": "1.5", "/roles": "100.0", "/lab": "30.5", "/contact": "55.9" };
const seam = (page: Page) => page.locator(".site").evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue("--seam")).toFixed(1));
const nav = (page: Page, name: string) => page.locator(".chrome [data-layer=ink] .nav").getByRole("link", { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
});

test.describe("navigation", () => {
  test("each nav item sweeps the seam to its page and marks it current", async ({ page }) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto("/");
    // each page's h1: the Lab's is its match score (lab-a)
    for (const [name, path, h1] of [["Work", "/work", "Work"], ["Lab", "/lab", "−143.3"], ["Contact", "/contact", "Contact"], ["Roles", "/roles", "Roles"]]) {
      await nav(page, name).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect.poll(() => seam(page), { timeout: 40_000 }).toBe(REST[path]);
      await expect(nav(page, name)).toHaveAttribute("aria-current", "page");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    }
    expect(errors).toEqual([]);
  });

  test("the URL changes at the start of the sweep", async ({ page }) => {
    await page.goto("/");
    await nav(page, "Work").click();
    await expect(page).toHaveURL(/\/work$/, { timeout: 1_000 });
    // mid-sweep, the seam is still between the two pages
    expect(Number(await seam(page))).toBeGreaterThan(1.5);
  });

  test("Back and Forward sweep the same way", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/");
    await nav(page, "Lab").click();
    await expect.poll(() => seam(page), { timeout: 25_000 }).toBe(REST["/lab"]);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => seam(page), { timeout: 25_000 }).toBe(REST["/"]);
    await page.goForward();
    await expect(page).toHaveURL(/\/lab$/);
    await expect.poll(() => seam(page), { timeout: 25_000 }).toBe(REST["/lab"]);
  });

  test("the nav and the résumé link work from the keyboard", async ({ page }) => {
    await page.goto("/lab");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to content");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Roles");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work$/);
    await expect.poll(() => seam(page), { timeout: 25_000 }).toBe(REST["/work"]);
  });

  test("résumé mode is a plain page: no chrome, no seam", async ({ page }) => {
    await page.goto("/work");
    await page.locator(".chrome [data-layer=ink] a.resume-link").click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator(".chrome")).toHaveCount(0);
  });

  test("every room is accessible", async ({ page }) => {
    test.setTimeout(90_000); // four rooms, three of them WebGL, drawn by the CPU here
    for (const path of ["/work", "/roles", "/lab", "/contact"]) {
      await page.goto(path);
      const a11y = await new AxeBuilder({ page }).analyze();
      expect(a11y.violations.map((v) => `${path}: ${v.id}`)).toEqual([]);
    }
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("a page change is a cut", async ({ page }) => {
      await page.goto("/");
      // a cut: the seam never moves on its own (no sweep), it is simply at the new page's rest
      await page.evaluate(() => {
        const w = window as unknown as { __swept: boolean }; w.__swept = false;
        new MutationObserver(() => { if (document.querySelector(".site[data-seam-moving]")) w.__swept = true; })
          .observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-seam-moving"] });
      });
      await nav(page, "Work").click();
      await expect(page).toHaveURL(/\/work$/);
      // generous: the Work room's first build can hold CPU-drawn WebGL for a moment
      await expect.poll(() => seam(page), { timeout: 5_000 }).toBe(REST["/work"]);
      expect(await page.evaluate(() => (window as unknown as { __swept: boolean }).__swept)).toBe(false);
    });
  });

  test.describe("without View Transitions", () => {
    test("the seam still travels", async ({ page }) => {
      await page.addInitScript(() => { delete (Document.prototype as { startViewTransition?: unknown }).startViewTransition; });
      await page.goto("/");
      await nav(page, "Work").click();
      await expect.poll(() => seam(page), { timeout: 25_000 }).toBe(REST["/work"]);
    });
  });
});
