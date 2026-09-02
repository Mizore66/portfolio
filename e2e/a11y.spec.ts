import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function expectNoAxeViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

test.describe("axe", () => {
  test("home has no violations", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.getByTestId("masthead-role")).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test("an exhibit has no violations", async ({ page }) => {
    await page.goto("/projects/veridian");
    await expect(page.getByRole("heading", { level: 1, name: "Veridian" })).toBeVisible();
    await expect(page.locator("main#exhibit")).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test("the lab article has no violations", async ({ page }) => {
    await page.goto("/lab/learned-evaluator");
    await expect(page.getByRole("heading", { level: 1, name: /learned evaluator lost 143 Elo/i })).toBeVisible();
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
});
