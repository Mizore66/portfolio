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

  test("lands on the flagship as a single newspaper page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Anas T. Qumhiyeh" })).toBeVisible();
    await expect(page.getByText("A. T. Qumhiyeh", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("tree-caption")).toHaveCount(0);
    await expect(page.getByText(/LEAD · FLAGSHIP/i)).toHaveCount(0);
    await expect(page.getByTestId("lead-headline")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();
    await expect(page.getByText(/^\d+ alts?$/i)).toHaveCount(0);
    await expect(page.getByTestId("halftone-plate")).toBeVisible();
    await expect(page.getByTestId("glass-engine")).toBeVisible();
    await expect(page.getByTestId("eval-bar")).toBeVisible();
    await expect(page.getByTestId("newspaper-column")).toBeVisible();
    await expect(page.getByTestId("newspaper-column")).not.toContainText(/Italian Game|C50|Vol\./i);

    const boardBox = await page.getByTestId("board-column").boundingBox();
    const treeBox = await page.getByTestId("tree-column").boundingBox();
    const gutterBox = await page.getByTestId("newspaper-column").boundingBox();
    const spreadBox = await page.getByTestId("newspaper-spread").boundingBox();
    expect(boardBox && treeBox && gutterBox && spreadBox).toBeTruthy();
    expect(boardBox!.x).toBeGreaterThan(gutterBox!.x);
    expect(gutterBox!.x).toBeGreaterThan(treeBox!.x);
    expect(Math.abs(gutterBox!.x - (treeBox!.x + treeBox!.width))).toBeLessThan(3);
    expect(Math.abs(boardBox!.x - (gutterBox!.x + gutterBox!.width))).toBeLessThan(3);
    const leftGutter = spreadBox!.x;
    const rightGutter = 1280 - (spreadBox!.x + spreadBox!.width);
    expect(Math.abs(leftGutter - rightGutter)).toBeLessThan(24);

    const treeOverflow = await page.getByTestId("tree-view").evaluate((el) => {
      return el.scrollWidth <= el.clientWidth + 1;
    });
    expect(treeOverflow).toBe(true);

    const canvasBox = await page.getByTestId("tree-canvas").boundingBox();
    expect(canvasBox).toBeTruthy();
    const leftPad = canvasBox!.x - treeBox!.x;
    const rightPad = treeBox!.x + treeBox!.width - (canvasBox!.x + canvasBox!.width);
    expect(Math.abs(leftPad - rightPad)).toBeLessThan(16);

    await expect(page.locator('[data-piece-id="wNb1"] svg[data-piece-type="N"]')).toBeVisible();
    expect(gutterBox!.width).toBeLessThan(28);

    await page.locator('[data-testid="tree-view"] [data-node-id="e4"]').click();
    await expect(page.getByRole("heading", { level: 2, name: "The University Opening" })).toBeVisible();
    await page.locator('[data-testid="tree-view"] [data-node-id="d4"]').click();
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();
  });

  test("the engine eval stays inside the bar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await expect(page.getByTestId("engine-eval")).not.toHaveText("…", { timeout: 4000 });

    const bar = page.getByTestId("eval-bar");
    const score = page.getByTestId("engine-eval");
    const barBox = await bar.boundingBox();
    const scoreBox = await score.boundingBox();
    expect(barBox && scoreBox).toBeTruthy();
    expect(scoreBox!.x).toBeGreaterThanOrEqual(barBox!.x - 0.5);
    expect(scoreBox!.x + scoreBox!.width).toBeLessThanOrEqual(barBox!.x + barBox!.width + 0.5);
    expect(scoreBox!.y).toBeGreaterThanOrEqual(barBox!.y - 0.5);
    expect(scoreBox!.y + scoreBox!.height).toBeLessThanOrEqual(barBox!.y + barBox!.height + 0.5);

    const inkFits = await score.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const ink = range.getBoundingClientRect();
      const barRect = (el.closest("[data-testid='eval-bar']") as HTMLElement).getBoundingClientRect();
      return (
        ink.width <= barRect.width - 2 &&
        ink.left >= barRect.left + 1 &&
        ink.right <= barRect.right - 1
      );
    });
    expect(inkFits).toBe(true);
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
    await expect(page.getByTestId("read-the-game")).toContainText("Read the game");
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
    await expect(page.getByTestId("architecture-figure")).toBeVisible();
  });

  test("the column uses one gutter and the page is the only scroller", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();

    const boardX = (await page.getByTestId("board-diagram").boundingBox())!.x;
    const engineX = (await page.getByTestId("glass-engine").boundingBox())!.x;
    const annotX = (await page.getByTestId("annotation-panel").boundingBox())!.x;
    expect(Math.abs(boardX - engineX)).toBeLessThan(2);
    expect(Math.abs(engineX - annotX)).toBeLessThan(2);

    const overflowY = await page.getByTestId("board-column").evaluate((el) => getComputedStyle(el).overflowY);
    expect(overflowY === "auto" || overflowY === "scroll").toBe(false);

    await expect(page.getByTestId("broadsheet-filler")).toBeVisible();
    await expect(page.getByTestId("broadsheet-filler")).toContainText("Situations Wanted");
    await expect(page.getByTestId("pv-arrow")).toBeVisible({ timeout: 4000 });
  });

  test("the diagram quiz and a legal play ply both work", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/?move=nf6");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await expect(page.getByTestId("find-the-break")).toBeVisible();
    await page.locator('[data-sq="d4"]').click();
    await expect(page.getByRole("heading", { level: 2, name: "The Central Break" })).toBeVisible();

    await page.goto("/?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    const pawn = page.locator('[data-piece-id="wPe2"]');
    const before = await pawn.boundingBox();
    await page.locator('[data-sq="e2"]').click();
    await page.locator('[data-sq="e4"]').click();
    await page.waitForTimeout(450);
    const after = await pawn.boundingBox();
    expect(before && after).toBeTruthy();
    expect(after!.y).toBeLessThan(before!.y - 8);
  });
});
