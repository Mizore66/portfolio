import { expect, test } from "@playwright/test";
import { OPENING_NODES } from "../src/content/opening";

test.describe("Opening Preparation", () => {
  test("notation lists every node and stays in sync with the panel", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    await page.getByRole("button", { name: "Notation" }).click();
    await expect(page.getByTestId("notation-view")).toBeVisible();

    for (const node of OPENING_NODES) {
      await expect(
        page.locator('[data-testid="notation-view"]').locator(`[data-node-id="${node.id}"]`),
      ).toBeVisible();
    }

    await page.locator('[data-testid="notation-view"] [data-node-id="d4"]').click();
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();
    await expect(page.getByText("The line so far")).toBeVisible();
    await expect(page.getByText("1. e4! e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O! Nf6! 5. d4!!")).toBeVisible();
  });

  test("arrow keys walk the mainline", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    await expect(page.getByRole("heading", { level: 2, name: "Opening Preparation" })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { level: 2, name: "The University Opening" })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { level: 2, name: "Meeting e4 with e5" })).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("heading", { level: 2, name: "The University Opening" })).toBeVisible();
  });

  test("tree and notation stay in sync", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    await expect(page.getByTestId("tree-view")).toBeVisible();
    await expect(page.getByTestId("tree-caption")).toContainText("Opening Preparation");
    await page.locator('[data-testid="tree-view"] [data-node-id="oo"]').click();
    await expect(page.getByRole("heading", { level: 2, name: "Castling" })).toBeVisible();
    await expect(page.getByTestId("tree-caption")).toContainText("Castling");

    await page.getByRole("button", { name: "Notation" }).click();
    await expect(page.getByTestId("notation-view")).toBeVisible();
    await expect(
      page.locator('[data-testid="notation-view"] [data-node-id="oo"]'),
    ).toHaveAttribute("aria-current", "true");
  });

  test("mobile viewport shows notation, not the tree", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    await expect(page.getByTestId("notation-view")).toBeVisible();
    await expect(page.getByTestId("tree-view")).toBeHidden();
    await expect(page.getByRole("button", { name: "Tree" })).toBeHidden();
  });
});
