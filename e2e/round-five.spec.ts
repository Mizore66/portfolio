import { expect, test } from "@playwright/test";

test.describe("round five invariants", () => {

  test("Opening Preparation heading order is H1 then H2 then H3", async ({ page }) => {
    await page.goto("/opening-preparation");
    const outline = await page.evaluate(() =>
      [...document.querySelectorAll("h1, h2, h3")].map((el) => ({
        level: Number(el.tagName.slice(1)),
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
      })),
    );
    expect(outline[0]?.level).toBe(1);
    const firstH3 = outline.findIndex((row) => row.level === 3);
    const firstH2 = outline.findIndex((row) => row.level === 2);
    expect(firstH2).toBeGreaterThanOrEqual(0);
    expect(firstH3).toBeGreaterThan(firstH2);
  });

  test("evidence classifications are badges, not colour-only", async ({ page }) => {
    await page.goto("/projects/veridian");
    const badge = page.getByTestId("evidence-badge").first();
    await expect(badge).toHaveText("Controlled evaluation");
    const color = await badge.evaluate((el) => getComputedStyle(el).color);
    const border = await badge.evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(parseFloat(border)).toBeGreaterThan(0);
    expect(color).not.toBe("rgb(139, 36, 28)");
  });

  test("flagship pages do not overflow at compact through ultrawide widths", async ({ page }) => {
    for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/projects/veridian");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      );
      expect(overflow, `${width}px`).toBe(false);
    }
  });

  test("legacy about and archive routes redirect onto the homepage", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveURL(/\/#about$/);
    await page.goto("/archive");
    await expect(page).toHaveURL(/\/#work$/);
  });

});
