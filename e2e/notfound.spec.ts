import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Phase 5, step 5: the 404 (key frame 404-c, "Taken"), chosen at the step 5 gate.
test("an unknown address is Taken: a 404 with the path, Work's paper edge, and a way back", async ({ page }) => {
  const res = await page.goto("/notes/2019");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Taken.");
  await expect(page.getByText("There is nothing at /notes/2019 any more.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the start" })).toHaveAttribute("href", "/");
  await expect.poll(() => page.locator(".site").evaluate((e) => getComputedStyle(e).getPropertyValue("--seam"))).toBe("1.5%");
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations.map((v) => v.id)).toEqual([]);
});
