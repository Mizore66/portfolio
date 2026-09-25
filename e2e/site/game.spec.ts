import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const LEGACY_IDS = ["start", "e4", "alekhine", "e5", "nf3", "elephant", "philidor", "nc6", "bc4", "bc5", "oo", "nf6", "d4", "closed", "bb6", "exd4", "re1"];

test.describe("the engine", () => {
  test("loads nothing until started, then replies to a keyboard move", async ({ page }) => {
    const engine: string[] = [];
    let workers = 0;
    page.on("request", (r) => r.url().includes("/engine/") && engine.push(r.url()));
    page.on("worker", () => workers++);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(engine).toEqual([]);
    expect(workers).toBe(0);

    await page.getByRole("button", { name: "Start engine" }).click();
    await expect(page.locator(".gb-stats dd").nth(1)).not.toHaveText("…", { timeout: 15_000 });
    expect(workers).toBe(1);

    // White to move after 10…Bg4: h2–h3 from the keyboard.
    await page.locator('.gb-board [data-square="e2"]').focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await expect(page.locator(".gb-status")).toHaveText(/Engine thinking/);
    await expect(page.locator(".gb-status")).toHaveText(/your move/, { timeout: 20_000 });
    await expect(page.locator('.gb-board [data-square="h3"]')).toHaveAttribute("aria-label", /white pawn/);
  });

  test("fetches the learned weights only when Learned is chosen", async ({ page }) => {
    const engine: string[] = [];
    page.on("request", (r) => r.url().includes("/engine/") && engine.push(r.url()));
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "Start engine" }).click();
    await expect(page.locator(".gb-stats dd").nth(1)).not.toHaveText("…", { timeout: 15_000 });
    expect(engine.filter((u) => u.endsWith(".bin"))).toEqual([]);
    await page.getByText("Learned (NNUE)").click();
    await expect.poll(() => engine.filter((u) => u.endsWith(".bin")).length, { timeout: 15_000 }).toBe(1);
  });

  test("stops searching while the tab is hidden", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "Start engine" }).click();
    await expect(page.locator(".gb-stats dd").nth(1)).not.toHaveText("…", { timeout: 15_000 });
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(page.locator(".gb-pv")).not.toHaveText("Searching…");
  });
});

test.describe("the career graph", () => {
  test("a point sets the board and lands on its chapter", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.locator('#career a.cg-mark[href="/#deriv"]').click();
    await expect(page).toHaveURL(/#deriv$/);
    await expect(page.locator(".board-caption")).toContainText("Deriv");
  });

  test("offers the same data as a table", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Show as a table").click();
    await expect(page.locator(".career-table tbody tr")).not.toHaveCount(0);
  });
});

test.describe("the scoresheet", () => {
  test("every legacy and new id resolves to its chapter", async ({ page }) => {
    for (const id of [...LEGACY_IDS, "deriv", "skribble-lab", "faultline", "outlook"]) {
      const res = await page.goto(`/opening-preparation?move=${id}`);
      expect(res?.status(), id).toBe(200);
      await expect(page.locator(`#chapter-${id}`), id).toHaveCount(1);
      await expect(page.locator(".tree a[aria-current]"), id).toHaveCount(1);
    }
  });

  test("gives each position its own title", async ({ page }) => {
    await page.goto("/opening-preparation?move=deriv");
    await expect(page).toHaveTitle(/Nbxd2 The Deepest Move/);
  });

  test("steps to the next move and back", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/opening-preparation?move=d4");
    await page.getByRole("link", { name: "Next move" }).click();
    await expect(page).toHaveURL(/move=exd4/);
    await page.goBack();
    await expect(page).toHaveURL(/move=d4/);
  });

  test("the puzzle accepts d4", async ({ page }) => {
    await page.goto("/opening-preparation?move=nf6");
    await page.getByRole("button", { name: "5. d4" }).click();
    await expect(page.getByText("!! — found over the board.")).toBeVisible();
    await page.getByRole("button", { name: "5. O-O" }).click();
    await expect(page.getByText("A developing move. The break was d4. — Ed.")).toBeVisible();
  });

  test("reads without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/opening-preparation");
    await expect(page.locator("#chapter-deriv")).toContainText("Deriv");
    await context.close();
  });
});

for (const path of ["/opening-preparation", "/opening-preparation?move=nf6", "/lab/learned-evaluator"]) {
  test(`${path} has no axe violations and no overflow at 320px`, async ({ page }) => {
    await page.goto(path);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
}

test("the lab keeps its fragments and discloses the clamp", async ({ page }) => {
  await page.goto("/lab/learned-evaluator");
  for (const id of ["hypothesis", "experiment", "result", "failed", "learned"]) await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.locator("main")).toContainText("±60 centipawns");
  await expect(page.locator("main")).not.toContainText("2200");
});
