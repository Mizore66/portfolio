import { expect, test } from "@playwright/test";

test.describe("round five invariants", () => {
  test("the homepage learned-evaluator sentence appears once", async ({ page }) => {
    await page.goto("/");
    const caption = page.getByTestId("hero-engine-caption");
    await expect(caption).toHaveCount(1);
    const matches = page.getByText(/Learned evaluator, same search and 50k-node budget/);
    await expect(matches).toHaveCount(1);
  });

  test("Opening Preparation exposes a single settling status", async ({ page }) => {
    await page.goto("/opening-preparation?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    const settling = page.getByTestId("engine-settling");
    await expect(settling).toHaveCount(1);
    await expect(page.getByTestId("engine-depth")).not.toHaveText(/settling/);
  });

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

  test("Petronas facts stay canonical on the scoresheet", async ({ page }) => {
    await page.goto("/opening-preparation?move=nf3");
    await expect(page.locator("#chapter-nf3")).toContainText(
      "Replaced MATLAB-dependent back-end functionality with Python packages",
    );
    await expect(page.locator("#chapter-nf3")).toContainText("post-release acceptance cases");
    await expect(page.locator("#chapter-nf3")).not.toContainText(/converting paid MATLAB licences/i);
    await expect(page.locator("#chapter-nf3 [data-testid='news-clipping']")).toContainText(
      "PETRONAS TAKES ON SOFTWARE ENGINEERING INTERN",
    );
  });

  test("the hero board can pause the Italian autoplay", async ({ page }) => {
    await page.goto("/");
    const play = page.getByTestId("hero-play");
    await expect(play).toBeVisible();
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "false");
  });

  test("hero CTAs do not steal arrow keys from the page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByTestId("hero-experiment").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/$/);
  });

  test("playable squares stay out of the tab order", async ({ page }) => {
    await page.goto("/opening-preparation?move=start");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    const plane = page.getByTestId("board-plane");
    await expect(plane).toHaveAttribute("tabindex", "0");
    const squareTab = await page.locator("[data-testid='board-plane'] [data-sq]").evaluateAll((els) =>
      els.map((el) => el.getAttribute("tabindex")),
    );
    expect(squareTab.every((value) => value === "-1")).toBe(true);
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

  test("the name-format note lives in the colophon, not the homepage footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-footer")).not.toContainText(/on the résumé/);
    await page.goto("/colophon");
    await expect(page.getByTestId("name-note")).toContainText("Anas Tarek Qumhiyeh on the résumé");
  });

  test("robots and export keep the editor private", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toMatch(/Disallow: \/admin/);
    const exported = await request.get("/admin/export", { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(exported.status());
    const pdf = await request.get("/print-edition");
    expect(pdf.headers()["cache-control"]).toMatch(/no-store/);
    const again = await request.get("/print-edition");
    expect(again.headers().etag).toBe(pdf.headers().etag);
  });

  test("a recruiter can name the work in thirty seconds of headings", async ({ page }) => {
    await page.goto("/");
    const headings = await page.locator("h1, h2").allTextContents();
    const blob = headings.join(" · ");
    expect(blob).toMatch(/Anas T\. Qumhiyeh/);
    expect(blob).toMatch(/Selected work/);
    expect(blob).toMatch(/Experience/);
    expect(blob).toMatch(/Contact/);
    await expect(page.getByTestId("masthead-role")).toContainText(/Software engineer/);
    await expect(page.getByTestId("masthead-proof")).toContainText(/−40% production defects/);
    await expect(page.getByTestId("masthead-proof")).toContainText(/100M-event capacity/);
    await page.goto("/projects/veridian");
    await expect(page.getByTestId("exhibit-rejected")).toBeVisible();
    await expect(page.getByTestId("exhibit-retrospective")).toBeVisible();
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
});
