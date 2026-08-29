import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("axe", () => {
  test("home has no serious or critical violations", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });

  test("an exhibit has no serious or critical violations", async ({ page }) => {
    await page.goto("/projects/veridian");
    await expect(page.getByRole("heading", { level: 1, name: "Veridian" })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
});
