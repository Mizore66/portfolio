import { expect, test } from "@playwright/test";
import { OPENING_NODES } from "../src/content/opening";

test.describe("Opening Preparation", () => {
  test("notation lists every node and stays in sync with the panel", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
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

  test("lands on the flagship and the lead headline holds the node", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Anas T. Qumhiyeh" })).toBeVisible();
    await expect(page.getByText("A. T. Qumhiyeh", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("tree-caption")).toHaveCount(0);
    await expect(page.getByText(/LEAD · FLAGSHIP/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();
    await expect(page.getByTestId("lead-headline")).toContainText("The Central Break");
    await expect(page.getByTestId("lead-headline")).not.toContainText("THE CENTRAL BREAK");
    await expect(page.getByTestId("lead-headline")).not.toContainText("You castle");
    await expect(page.getByText(/^\d+ alts?$/i)).toHaveCount(0);
    await expect(page.getByTestId("halftone-plate")).toBeVisible();
    await expect(page.getByTestId("glass-engine")).toBeVisible();
    await expect(page.getByTestId("eval-bar")).toBeVisible();

    const boardBox = await page.getByTestId("board-column").boundingBox();
    const treeBox = await page.getByTestId("tree-column").boundingBox();
    expect(boardBox && treeBox).toBeTruthy();
    expect(boardBox!.x).toBeGreaterThan(treeBox!.x);
    await expect(page.getByTestId("halftone-plate")).toBeVisible();
    await expect(page.getByTestId("glass-engine")).toBeVisible();

    await page.locator('[data-testid="tree-view"] [data-node-id="e4"]').click();
    await expect(page.getByRole("heading", { level: 2, name: "The University Opening" })).toBeVisible();
    await page.getByTestId("lead-headline").click();
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();
  });

  test("arrow keys walk the mainline", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/?move=start");
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
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    await expect(page.locator('[data-testid="tree-view"] [data-node-id="start"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
    await page.locator('[data-testid="tree-view"] [data-node-id="oo"]').click();
    await expect(page.getByRole("heading", { level: 2, name: "Castling" })).toBeVisible();
    await expect(page.locator('[data-testid="tree-view"] [data-node-id="oo"]')).toHaveAttribute(
      "aria-current",
      "true",
    );

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

  test("move query selects a node and survives an exhibit round-trip", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/?move=d4");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();

    await page.goto("/?move=not-a-node");
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();

    await page.goto("/?move=d4");
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();
    await page.getByRole("link", { name: "Veridian" }).first().evaluate((el: HTMLAnchorElement) => {
      el.click();
    });
    await expect(page.getByRole("heading", { level: 1, name: "Veridian" })).toBeVisible();
    await expect(page.getByTestId("halftone-plate")).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/move=d4/);
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();
  });

  test("the e-pawn glides on 1.e4 instead of teleporting", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    const pawn = page.locator('[data-piece-id="wPe2"]');
    const yAt = () => pawn.evaluate((el) => el.getBoundingClientRect().y);

    const before = await yAt();
    await page.locator('[data-testid="tree-view"] [data-node-id="e4"]').click();
    await page.waitForTimeout(90);
    const mid = await yAt();
    await page.waitForTimeout(400);
    const after = await yAt();

    expect(Math.abs(mid - before)).toBeGreaterThan(2);
    expect(Math.abs(after - mid)).toBeGreaterThan(2);
    expect(after).not.toBe(before);
  });

  test("a single trunk step inks that edge and dims off-path strokes", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    await page.locator('[data-testid="tree-view"] [data-node-id="e4"]').click();
    await expect(page.locator('[data-edge="start-e4"]')).toHaveAttribute(
      "data-ink",
      "true",
    );
    await expect(page.locator('[data-edge="e4-alekhine"]')).toHaveAttribute(
      "data-on-path",
      "false",
    );
    await expect(page.locator('[data-edge="start-e4"]')).toHaveAttribute(
      "data-on-path",
      "true",
    );

    await page.locator('[data-testid="tree-view"] [data-node-id="d4"]').click();
    await expect(page.locator('[data-edge="start-e4"]')).toHaveAttribute(
      "data-ink",
      "false",
    );
    await expect(page.locator('[data-edge="e4-e5"]')).toHaveAttribute(
      "data-on-path",
      "true",
    );
    await expect(page.locator('[data-edge="e4-alekhine"]')).toHaveAttribute(
      "data-on-path",
      "false",
    );
  });

  test("the panel glyph stamps once, and Read the game steps the trunk", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await page.locator('[data-testid="tree-view"] [data-node-id="d4"]').click();
    await expect(page.getByTestId("glyph-stamp")).toHaveAttribute("data-stamp", "press");
    await page.waitForTimeout(200);
    await page.locator('[data-testid="tree-view"] [data-node-id="e4"]').click();
    await page.locator('[data-testid="tree-view"] [data-node-id="d4"]').click();
    await expect(page.getByTestId("glyph-stamp")).toHaveAttribute("data-stamp", "seen");

    await page.goto("/?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await page.getByTestId("read-the-game").click();
    await expect(page.getByRole("heading", { level: 2, name: "The University Opening" })).toBeVisible({
      timeout: 2000,
    });
    await page.locator('[data-testid="tree-view"] [data-node-id="e5"]').click();
    await expect(page.getByTestId("read-the-game")).toHaveText("Read the game");
  });

  test("hover tints a sideline square; tape clippings stay behind the flag", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    await expect(page.locator('[data-life-clip="true"]')).toHaveCount(0);
    await page.locator('[data-testid="tree-view"] [data-node-id="hike"]').hover();
    await expect(page.locator('[data-sq="g6"][data-hl="preview"]')).toBeVisible({
      timeout: 1000,
    });

    await page.goto("/?tape=1");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await expect(page.locator('[data-life-clip="true"]').first()).toBeVisible();
  });

  test("the engine prints a live PV", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await expect(page.getByTestId("engine-pv")).not.toHaveText("…", { timeout: 4000 });
    await expect(page.getByTestId("engine-pv")).not.toHaveText(/^[a-h][1-8][a-h][1-8]/);
    await expect(page.getByTestId("engine-eval")).not.toHaveText("…");
  });

  test("exhibits read as a pasted clipping", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects/veridian");
    await expect(page.getByRole("heading", { level: 1, name: "Veridian" })).toBeVisible();
    await expect(page.getByText("Pasted from the desk")).toBeVisible();
    await expect(page.getByText("Clipping · Exhibit")).toBeVisible();
    await expect(page.getByTestId("halftone-plate")).toBeVisible();
  });
});
