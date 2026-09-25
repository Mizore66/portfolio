import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PROJECTS } from "../../src/content/site/projects";

test.describe("case studies", () => {
  test("every project page resolves with its name as the only h1", async ({ page }) => {
    for (const p of PROJECTS) {
      const res = await page.goto(`/projects/${p.slug}`);
      expect(res?.status(), p.slug).toBe(200);
      await expect(page.locator("h1"), p.slug).toHaveCount(1);
      await expect(page.locator("h1"), p.slug).toContainText(p.name);
    }
  });

  test("unknown projects return 404", async ({ page }) => {
    const res = await page.goto("/projects/not-a-project");
    expect(res?.status()).toBe(404);
  });

  test("keeps the shared fragment ids in the brief's order", async ({ page }) => {
    await page.goto("/projects/veridian");
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual([
      "measurement",
      "problem",
      "decision",
      "constraint",
      "example",
      "rejected",
      "apparatus",
      "line",
      "limitations",
      "retrospective",
      "links",
    ]);
  });

  test("the back link keeps the work filter", async ({ page }) => {
    await page.goto("/projects/veridian?path=ml");
    await page.getByRole("link", { name: "Back to all work" }).click();
    await expect(page).toHaveURL(/\/\?path=ml#work$/);
  });

  test("walks to the next project", async ({ page }) => {
    await page.goto("/projects/faultline");
    await page.getByRole("navigation", { name: "More projects" }).getByRole("link", { name: /Gemini Teleportal/ }).click();
    await expect(page).toHaveURL(/\/projects\/gemini-teleportal$/);
  });

  test("copies a section link", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/projects/faultline");
    await page.locator("#problem").getByRole("button", { name: /Copy link/ }).click();
    await expect(page.locator("#problem").getByRole("button", { name: /Link copied/ })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/projects\/faultline#problem$/);
  });

  test("a trip from the annotated career into a case study comes back to the same move", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/opening-preparation?move=d4");
    await page.getByRole("link", { name: "Veridian" }).first().evaluate((el: HTMLAnchorElement) => el.click());
    await expect(page.getByRole("heading", { level: 1, name: /Veridian/ })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/move=d4/);
  });

  test("carries the lines the brief requires", async ({ page }) => {
    await page.goto("/projects/gemini-teleportal");
    await expect(page.getByText("Built together with Kai; the repository is under his account.")).toBeVisible();
    await page.goto("/projects/multi-agent-graphrag");
    await expect(page.getByText(/\+45% is the Monash contract/)).toBeVisible();
    await page.goto("/projects/slm-distillation-engine");
    await expect(page.locator("main")).not.toContainText("50%");
  });

  test("publishes project JSON-LD", async ({ page }) => {
    await page.goto("/projects/faultline");
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent || "{}")["@type"]));
    expect(types).toContain("SoftwareSourceCode");
  });

  test("screenshots load", async ({ page }) => {
    for (const slug of ["faultline", "gemini-teleportal", "circuitmindai"]) {
      await page.goto(`/projects/${slug}`);
      for (const img of await page.locator(".media img").all()) {
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), slug).toBe(true);
      }
    }
  });

  test("front-page thumbnails load when scrolled to", async ({ page }) => {
    await page.goto("/");
    for (const img of await page.locator(".card-thumb img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });

  for (const slug of ["faultline", "gemini-teleportal", "circuitmindai", "veridian", "mirrorfi"]) {
    test(`${slug} has no axe violations`, async ({ page }) => {
      await page.goto(`/projects/${slug}`);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("no page overflows at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const p of PROJECTS) {
      await page.goto(`/projects/${p.slug}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, p.slug).toBeLessThanOrEqual(0);
    }
  });
});
