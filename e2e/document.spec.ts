import { expect, test } from "@playwright/test";

test.describe("deep links", () => {

  test("exhibit subsection #apparatus is addressable", async ({ page }) => {
    await page.goto("/projects/veridian#apparatus");
    await expect(page.locator("#apparatus")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /Veridian/ })).toBeVisible();
  });

  test("lab #result is addressable", async ({ page }) => {
    await page.goto("/lab/learned-evaluator#result");
    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("#result")).toContainText(/−143/);
  });
});

test.describe("opening paper", () => {

  test("the front page is shorter than the scoresheet plate", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const home = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.goto("/opening-preparation");
    const paper = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(home).toBeLessThan(paper);
    expect(home).toBeLessThan(14000);
  });
});

test.describe("plates", () => {

  test("internal routes and the print edition respond", async ({ request }) => {
    for (const path of [
      "/",
      "/opening-preparation",
      "/projects/veridian",
      "/lab/learned-evaluator",
      "/colophon",
      "/print-edition",
    ]) {
      const res = await request.get(path);
      expect(res.ok(), path).toBe(true);
    }
    const missing = await request.get("/page-that-never-made-the-plate");
    expect(missing.status()).toBe(404);
  });
});

test.describe("narrow exhibits", () => {
  test("Veridian and the homepage do not scroll sideways at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ["/", "/projects/veridian"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, path).toBe(false);
    }
  });
});

