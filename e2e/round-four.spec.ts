import { expect, test } from "@playwright/test";

test.describe("round four recruiter order", () => {
  test("compact DOM puts selected work before the analysis board", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const order = await page.evaluate(() => {
      const work = document.querySelector("#work");
      const board = document.querySelector("[data-testid='hero-engine']");
      if (!work || !board) return null;
      const pos = work.compareDocumentPosition(board);
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    });
    expect(order).toBe(true);
    const work = await page.getByTestId("selected-work").boundingBox();
    const board = await page.getByTestId("hero-engine").boundingBox();
    expect(work && board).toBeTruthy();
    expect(work!.y).toBeLessThan(board!.y);
  });

  test("desktop still places the board beside the hero", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    const engine = page.getByTestId("hero-engine");
    await expect(engine).toBeVisible();
    const box = await engine.boundingBox();
    expect(box!.y).toBeLessThan(640);
  });

  test("hero proof is three metrics in one strip", async ({ page }) => {
    await page.goto("/");
    const rows = page.getByTestId("masthead-proof").locator(".metric-row");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toHaveText("−40% production defects");
    await expect(rows.nth(2)).toHaveText("100M-event capacity benchmark");
    await expect(page.getByTestId("masthead-proof")).not.toContainText(/hours cut/i);
  });

  test("selected work labels evidence kind and archives secondary projects", async ({ page }) => {
    await page.goto("/#work");
    await expect(page.locator("#veridian")).toContainText(/Controlled evaluation/);
    await expect(page.locator("#circuitmindai")).toContainText(/Capability/);
    await expect(page.getByRole("heading", { level: 3, name: "Archive" })).toBeVisible();
    await expect(page.getByTestId("project-archive")).toContainText(/MirrorFi/);
  });
});

test.describe("round four accessibility", () => {
  test("Opening Preparation has an H2 scoresheet and classified Veridian uptime", async ({ page }) => {
    await page.goto("/opening-preparation");
    await expect(page.getByRole("heading", { level: 1, name: "Opening Preparation" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Scoresheet", exact: true })).toBeVisible();
    await expect(page.locator("#chapter-oo")).toContainText(/Veridian Cloud Run evaluation: 99.9% observed uptime/);
    await expect(page.getByTestId("recruiter-nav").locator('a[href="/opening-preparation"]')).toHaveAttribute(
      "aria-label",
      "Opening Preparation — C50",
    );
  });

  test("arrow keys do not steal scroll when the board is not focused", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/opening-preparation?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await page.getByTestId("paper-title").click();
    await expect(page.locator('[data-testid="tree-view"] [data-node-id="start"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('[data-testid="tree-view"] [data-node-id="start"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("the lab chart exposes a table of every plotted point", async ({ page }) => {
    await page.goto("/lab/learned-evaluator");
    const table = page.getByTestId("elo-commits-table");
    await expect(table).toBeVisible();
    await expect(table).toContainText("A · 50k");
    await expect(table).toContainText("C · 256");
    await expect(table).toContainText("-143");
  });

  test("flagship exhibits include rejected alternatives and a retrospective", async ({ page }) => {
    await page.goto("/projects/veridian");
    await expect(page.getByTestId("exhibit-rejected")).toContainText(/carbon ledger/);
    await expect(page.getByTestId("exhibit-retrospective")).toContainText(/evaluation period/);
    await page.goto("/projects/circuitmindai");
    await expect(page.getByTestId("exhibit-rejected")).toContainText(/server-only/);
    await page.goto("/projects/multi-agent-graphrag");
    await expect(page.getByTestId("exhibit-rejected")).toContainText(/vector-only/);
  });
});

test.describe("round four zoom and landscape", () => {
  test("200% and 400% proxies do not overflow the homepage", async ({ page }) => {
    for (const size of [
      { width: 640, height: 400 },
      { width: 320, height: 200 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(size);
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      );
      expect(overflow, `${size.width}x${size.height}`).toBe(false);
    }
  });
});

test.describe("round four artifacts", () => {
  test("the résumé is not cached for an hour", async ({ request }) => {
    const pdf = await request.get("/print-edition");
    expect(pdf.ok()).toBe(true);
    expect(pdf.headers()["cache-control"]).toMatch(/no-store/);
    expect(pdf.headers().etag).toMatch(/resume-/);
  });
});

test.describe("homepage diagram and band layout", () => {
  test("the hero board mounts newspaper pieces from the sprite", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    const board = page.locator("#hero-board");
    await expect(board).toBeVisible();
    await expect(board.locator("[data-piece-id]")).toHaveCount(32);
    await expect(page.locator("svg.piece-sprite symbol#np-wP")).toHaveCount(1);
    await expect(board.locator('[data-piece-id="wPd2"] use')).toHaveAttribute("href", "#np-wP");
    await expect(board.locator('[data-piece-id="wNb1"] use')).toHaveAttribute("href", "#np-wN");
  });

  test("the intro proof box is closed on all four sides", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    const borders = await page.locator(".hero-proof").evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        top: parseFloat(s.borderTopWidth),
        right: parseFloat(s.borderRightWidth),
        bottom: parseFloat(s.borderBottomWidth),
        left: parseFloat(s.borderLeftWidth),
      };
    });
    expect(borders.top).toBeGreaterThan(0);
    expect(borders.right).toBeGreaterThan(0);
    expect(borders.bottom).toBeGreaterThan(0);
    expect(borders.left).toBeGreaterThan(0);
  });

  test("section kickers sit near the rule instead of in a 72px void", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    for (const testId of ["education-band", "lab-band", "about-band", "contact-band"]) {
      const paddingTop = await page.getByTestId(testId).evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
      expect(paddingTop, testId).toBeLessThanOrEqual(40);
      expect(paddingTop, testId).toBeGreaterThanOrEqual(24);
    }
  });
});
