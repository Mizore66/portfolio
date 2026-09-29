import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Phase 5, step 4c: the Lab (lab-a, lab2-1 to lab2-7). design/motion.md §5, §11 and §12.
const seam = (page: Page) => page.locator(".site").evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue("--seam")));
const errorsOf = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};
const to = (page: Page, ch: number, at = 0.5) => page.evaluate(([ch, at]) => {
  const s = document.querySelector<HTMLElement>(`[data-ch="${ch}"]`)!;
  window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * at);
}, [ch, at]);
const ink = (page: Page, ch: number) => page.locator(`[data-ch="${ch}"] [data-layer="ink"]`);
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1")); });

test.describe("the Lab", () => {
  test("opens on the match score and the search tree, then six chapters and Play", async ({ page }) => {
    test.setTimeout(60_000);
    const errors = errorsOf(page);
    await page.goto("/lab");
    await expect(page.locator(".lab-open")).toContainText("−143.3");
    await expect(page.locator(".op-tree line").first()).toBeAttached();
    await expect(page.locator(".op-tree .pv")).toBeAttached();
    for (const [n, text] of [[1, "One search,"], [3, "Trained"], [5, "Then the"], [7, "Play"]] as const)
      await expect(ink(page, n).getByRole("heading")).toContainText(text);
    await expect(ink(page, 2).getByRole("heading")).toHaveText("20,000,000");
    await expect(page.locator("section.ch")).toHaveCount(7);
    expect(errors).toEqual([]);
  });

  test("the seam takes each chapter's share: all white for training, gallery black for what failed", async ({ page }) => {
    test.setTimeout(240_000); // under software GL each chapter's shaders take ~20 s to compile, holding the page
    await page.goto("/lab"); await page.waitForTimeout(2000);
    await to(page, 3); await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
    await expect.poll(() => seam(page), { timeout: 100_000 }).toBeCloseTo(100, 0);
    await to(page, 6); await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
    await expect.poll(() => seam(page), { timeout: 100_000 }).toBeCloseTo(0, 0);
  });

  test("Play: Start loads the net, and as Black the engine moves first", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = errorsOf(page);
    await page.goto("/lab");
    await to(page, 7);
    const play = ink(page, 7);
    await expect(play.locator(".moves:not(.ev-ph)")).toHaveText("");
    await expect(play.locator(".status .wide")).toHaveText("Your move. At 50,000 nodes the learned net rates this +0.31 for White, and would play e4.");
    await expect(play.locator(".ev")).toHaveText("+0.31 · 52.9%");
    await play.getByRole("button", { name: "Start the engine" }).click();
    await expect(play.getByRole("button", { name: "Start the engine" })).toHaveCount(0, { timeout: 30_000 });
    await play.getByRole("button", { name: "Black" }).click();
    await expect(play.getByRole("button", { name: "Black" })).toHaveAttribute("aria-pressed", "true");
    await expect(play.locator(".moves:not(.ev-ph)")).toHaveText(/^1\. \S+$/, { timeout: 60_000 });
    await expect(play.locator(".status .wide")).toHaveText(/^Your move\. .* for Black, and would play \S+\.$/, { timeout: 60_000 });
    expect(errors).toEqual([]);
  });

  test("is accessible", async ({ page }) => {
    await page.goto("/lab");
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("every chapter is its key frame, without scrubbing", async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto("/lab"); await page.waitForTimeout(2000);
      await expect(page.locator(".lab-open [data-rise]").first()).toBeVisible();
      await to(page, 5, 0);
      await expect(page.locator('[data-ch="5"]')).toHaveAttribute("data-done", { timeout: 90_000 });
    });
  });
});
