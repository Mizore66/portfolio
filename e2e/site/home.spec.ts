import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("front page", () => {
  test("opens with the statement as the first heading", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("main h1").first();
    await expect(h1).toHaveText("I like systems that have to survive measurement.");
    await expect(h1).not.toHaveText(/\d/);
  });

  test("keeps every legacy fragment id", async ({ page }) => {
    await page.goto("/");
    for (const id of [
      "work", "proof", "experience", "education", "lab", "about", "contact",
      "monash-university", "western-digital", "setel", "petronas", "deriv", "skribble-lab",
      "veridian", "circuitmindai", "multi-agent-graphrag", "the-game",
      "claim-setelDefects", "claim-monashRetrieval", "claim-leadThroughput",
    ]) {
      await expect(page.locator(`[id="${id}"]`), id).toHaveCount(1);
    }
  });

  test("filters work with ?path=", async ({ page }) => {
    await page.goto("/?path=product");
    await expect(page.locator("#circuitmindai")).toBeVisible();
    await expect(page.locator("#faultline")).toHaveCount(0);
  });

  test("redirects legacy chess deep links", async ({ page }) => {
    await page.goto("/?move=d4");
    await expect(page).toHaveURL(/\/opening-preparation\?move=d4$/);
  });

  test("loads no engine assets", async ({ page }) => {
    const engine: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/engine/")) engine.push(r.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(engine).toEqual([]);
  });

  test("has no axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("does not overflow at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("copies the email", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/#contact");
    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  });

  test("unknown URLs get a 404 that leads back to the front page", async ({ page }) => {
    const response = await page.goto("/this-plate-was-never-set");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: /misprint/i })).toBeVisible();
    await page.getByRole("link", { name: "Back to the front page" }).click();
    await expect(page.locator("main h1").first()).toHaveText("I like systems that have to survive measurement.");
  });

  test("puts work before the board on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const order = await page.evaluate(() => {
      const work = document.getElementById("work")!;
      const board = document.getElementById("the-game")!;
      return work.compareDocumentPosition(board) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
    expect(order).toBeTruthy();
  });
});
