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
  window.scrollTo(0, s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * at);
}, [ch, at]);
const ink = (page: Page, ch: number) => page.locator(`[data-ch="${ch}"] [data-layer="ink"]`);
// /lab builds all seven chapters ahead after load. Without a GPU (CI) every shader compiles on the main thread, about
// 3 s a scene, so these run one at a time, with room to wait.
test.describe.configure({ mode: "serial" });
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1")); });

test.describe("the Lab", () => {
  test("opens on the match score and the search tree, then six chapters and Play", async ({ page }) => {
    test.setTimeout(240_000); // /lab builds its seven chapters after load: minutes under software GL
    const errors = errorsOf(page);
    await page.goto("/lab");
    await expect(page.locator(".lab-open")).toContainText("−143.3", { timeout: 60_000 });
    await expect(page.locator(".op-tree line").first()).toBeAttached({ timeout: 60_000 });
    await expect(page.locator(".op-tree .pv")).toBeAttached();
    for (const [n, text] of [[1, "One search,"], [3, "Trained"], [5, "Then the"], [7, "Play"]] as const)
      await expect(ink(page, n).getByRole("heading")).toContainText(text, { timeout: 120_000 });
    await expect(ink(page, 2).getByRole("heading")).toHaveText("20,000,000");
    await expect(page.locator("section.ch")).toHaveCount(7, { timeout: 120_000 });
    expect(errors).toEqual([]);
  });

  test("the seam takes each chapter's share: all white for training, gallery black for what failed", async ({ page }) => {
    test.setTimeout(360_000); // under software GL each chapter's shaders take ~20 s to compile, holding the page
    await page.goto("/lab"); await page.waitForTimeout(2000);
    await to(page, 3); await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
    await expect.poll(() => seam(page), { timeout: 150_000 }).toBeCloseTo(100, 0);
    await to(page, 6); await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
    await expect.poll(() => seam(page), { timeout: 150_000 }).toBeCloseTo(0, 0);
  });

  test.describe("Play", () => {
  // with reduced motion the slide home and the engine's hand land at once: without a GPU each frame of Play's two
  // boards takes seconds, and the 600 ms slide would take minutes of them
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("Start loads the net, and as Black the engine moves first", async ({ page }) => {
    test.setTimeout(300_000);
    const errors = errorsOf(page);
    // the one page's Lab section: the same Play, with only its own board built (/lab builds all seven chapters)
    await page.goto("/#lab");
    await to(page, 7);
    const play = ink(page, 7);
    await expect(play.locator(".moves:not(.ev-ph)")).toHaveText("");
    await expect(play.locator(".status .wide")).toHaveText("Your move. At 50,000 nodes the learned net rates this +0.31 for White, and would play e4.");
    await expect(play.locator(".ev")).toHaveText("+0.31 · 52.9%");
    await play.getByRole("button", { name: "Start the engine" }).click();
    await expect(play.getByRole("button", { name: "Start the engine" })).toHaveCount(0, { timeout: 120_000 });
    await play.getByRole("button", { name: "Black" }).click();
    await expect(play.getByRole("button", { name: "Black" })).toHaveAttribute("aria-pressed", "true");
    await expect(play.locator(".moves:not(.ev-ph)")).toHaveText(/^1\. \S+$/, { timeout: 150_000 });
    await expect(play.locator(".status .wide")).toHaveText(/^Your move\. .* for Black, and would play \S+\.$/, { timeout: 150_000 });
    expect(errors).toEqual([]);
  });
  });

  // the owner, 2026-10-01: start from any named opening. The search finds it by name, the keys pick it, and the board
  // and the moves start from its position.
  test("Play starts from an opening found by name", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/#lab"); // the one page's Play: /lab draws all seven chapters, slowly in a test browser
    await to(page, 7);
    const play = ink(page, 7);
    await play.locator(".opening button").click({ force: true });
    const field = play.getByRole("combobox", { name: "Opening" });
    await expect(field).toBeFocused();
    await field.fill("najdorf");
    // six matches: Lichess files five lines under this one name, each told apart by its last move, the shortest first
    await expect(play.getByRole("option")).toHaveCount(6);
    await expect(play.getByRole("option").first()).toHaveText(/^B90\s*Sicilian Defense: Najdorf Variation 5… a6$/);
    const a11y = await new AxeBuilder({ page }).include('[data-ch="7"]').analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
    await field.press("Enter");
    await expect(play.locator(".opening button")).toHaveText("Sicilian Defense: Najdorf Variation");
    await expect(play.locator(".moves:not(.ev-ph)")).toHaveText("1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6");
    // scored ahead (scripts/openings.ts), so before Start it reads as the start position does, with this position's numbers
    await expect(play.locator(".status .wide")).toHaveText(/^Your move\. At 50,000 nodes the learned net rates this [+−]\d\.\d\d for White, and would play \S+\.$/);
    await expect(play.locator(".status .wide")).not.toContainText("+0.31");
  });

  test("is accessible", async ({ page }) => {
    await page.goto("/lab");
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("every chapter is its key frame, without scrubbing", async ({ page }) => {
      test.setTimeout(240_000);
      await page.goto("/lab"); await page.waitForTimeout(2000);
      await expect(page.locator(".lab-open [data-rise]").first()).toBeVisible();
      await to(page, 5, 0);
      await expect(page.locator('[data-ch="5"]')).toHaveAttribute("data-done", { timeout: 180_000 });
    });
  });
});
