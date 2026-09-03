import { expect, test } from "@playwright/test";

test.describe("admin editor", () => {
  test("/admin/login is a real editor door, not the custom 404", async ({ page }) => {
    const response = await page.goto("/admin/login");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByTestId("correction")).toHaveCount(0);
    await expect(page).toHaveTitle(/Editor/);
  });

  test("/admin without a session is sent to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("the login desk is noindexed and has no public registration", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByText(/No public registration/)).toBeVisible();
    await expect(page.locator("a[href*='register']")).toHaveCount(0);
    await expect(page.locator("form")).toHaveCount(1);
  });
});
