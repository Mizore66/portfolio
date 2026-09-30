import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tables } from "../src/content/roles";

// Phase 5, step 4b: the Roles hall (roles-b) and the role pages (role-a). design/motion.md §4, §9 and §10.
const seam = (page: Page) => page.locator(".site").evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue("--seam")));
const errorsOf = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1")); });

test.describe("the Roles hall", () => {
  test("names the seven tables in career order, each a link to its page, with now on Deriv", async ({ page }) => {
    test.setTimeout(120_000); // the hall's seven sets are slow to draw under software GL
    const errors = errorsOf(page);
    await page.goto("/roles"); // the one page's Roles section (/#roles)
    await expect(page).toHaveURL(/\/#roles$/);
    await expect(page.locator("#roles").getByRole("heading", { level: 2 })).toHaveText("Roles");
    const names = page.getByRole("list", { name: "Roles, in career order" }).getByRole("link");
    await expect(names).toHaveCount(7);
    for (const [i, t] of tables.entries()) {
      await expect(names.nth(i)).toHaveAttribute("href", `/roles/${t.slug}`);
      await expect(names.nth(i)).toContainText(t.name);
    }
    await expect(names.last()).toContainText("now");
    await expect.poll(() => seam(page), { timeout: 40_000 }).toBeCloseTo(100, 1);
    expect(errors).toEqual([]);
  });

  test("is accessible", async ({ page }) => {
    await page.goto("/roles");
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("sitting down is a cut to the table's page", async ({ page }) => {
      await page.goto("/roles");
      await page.getByRole("link", { name: /^Deriv/ }).click();
      await expect(page).toHaveURL(/\/roles\/deriv$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Deriv");
    });
  });
});

test.describe("a role page", () => {
  for (const t of tables) {
    test(`${t.name}: the facts and the game`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = errorsOf(page);
      const res = await page.goto(`/roles/${t.slug}`);
      expect(res!.headers()["content-security-policy"]).toMatch(/'nonce-[^']+'/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.title);
      const main = page.locator("main");
      await expect(main).toContainText(t.sub);
      for (const f of t.facts) { await expect(main).toContainText(f.text); if (f.big) await expect(main).toContainText(f.big); }
      await expect(main).toContainText(t.game.title);
      await expect.poll(() => seam(page)).toBeCloseTo(100, 1);
      await expect(page.getByRole("link", { name: "Back to all roles" })).toHaveAttribute("href", "/#roles");
      expect(errors).toEqual([]);
    });
  }

  test("replays the game as the page scrolls, to the famous position", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/roles/deriv");
    const mv = page.locator(".scrub .mv");
    await expect(mv).toHaveText("Start");
    await page.evaluate(() => window.scrollTo(0, innerHeight * 4.02)); // 80% of the pinned scroll: the famous position
    // each move is played whole, one after another (slow here under software GL), so the board is on its way
    await expect(mv).not.toHaveText("Start", { timeout: 30_000 });
    await expect(page.locator(".count")).toHaveText("6 / 6");
  });

  test("is accessible, at the start and at the famous position", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/roles/deriv");
    let a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, innerHeight * 4.02));
    await page.waitForTimeout(1500);
    a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("shows the famous position still, and every fact", async ({ page }) => {
      await page.goto("/roles/deriv");
      await expect(page.locator(".scrub .mv")).toHaveText("16. Nd5");
      for (const f of await page.locator(".fact").all()) await expect(f).toBeVisible();
      // the scrubber steps the board, without animation
      await page.getByRole("button", { name: "3…cxd4" }).click(); // a tick is a whole move: it ends on Black's
      await expect(page.locator(".scrub .mv")).toHaveText("3…cxd4");
    });
  });

  test("the degree and every role have a page, and nothing else does", async ({ page }) => {
    expect((await page.goto("/roles/education"))!.status()).toBe(200);
    expect((await page.goto("/roles/not-a-role"))!.status()).toBe(404);
  });

  test("the scrubber is one tab stop, stepped with the arrow keys", async ({ page }) => {
    await page.goto("/roles/deriv");
    const ticks = page.locator(".scrub .ticks button");
    await expect(ticks.first()).toHaveAttribute("tabindex", "0");
    expect(await page.locator('.scrub .ticks button[tabindex="0"]').count()).toBe(1);
    await ticks.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(ticks.nth(1)).toBeFocused();
    await expect(page.locator(".scrub .mv")).toHaveText("2…Nc6", { timeout: 30_000 });
    await expect(ticks.nth(1)).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("Home");
    await expect(ticks.first()).toBeFocused();
  });

  test("no sideways scrolling at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const u of ["/roles", ...tables.map((t) => `/roles/${t.slug}`)]) {
      await page.goto(u);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    }
  });
});
