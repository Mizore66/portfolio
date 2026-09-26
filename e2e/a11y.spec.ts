import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function expectNoAxeViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

test.describe("axe", () => {

  test("the lab article has no violations", async ({ page }) => {
    await page.goto("/lab/learned-evaluator");
    await expect(page.getByRole("heading", { level: 1, name: /underperformed PeSTO by 143\.3 ±35\.4 Elo/i })).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test("the 404 has no violations", async ({ page }) => {
    const response = await page.goto("/page-that-never-made-the-plate");
    expect(response?.status()).toBe(404);
    await expect(page.getByTestId("correction")).toBeVisible();
    await expect(page).toHaveTitle(/Correction/);
    await expect(page).not.toHaveTitle(/Opening Preparation/);
    await expect(page.locator("main")).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test("the colophon has no axe violations", async ({ page }) => {
    await page.goto("/colophon");
    await expect(page.getByTestId("colophon")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expectNoAxeViolations(page);
  });
});
