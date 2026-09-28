import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { claim, prose } from "../src/content/site";
import { featured } from "../src/content/work";

// Phase 5, step 4: the Work room (work-c) and the project pages (proj-a). design/motion.md §7 and §8.
const seam = (page: Page) => page.locator(".site").evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue("--seam")));
const share = (cp: number) => 100 * (0.5 + 0.5 * Math.tanh((0.00368208 * cp) / 2));
const errorsOf = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
});

test.describe("the Work room", () => {
  test("stands each project on its move's square, as a real link with its one number", async ({ page }) => {
    const errors = errorsOf(page);
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work");
    const list = page.getByRole("list", { name: "Selected work" });
    for (const f of featured) {
      const link = list.getByRole("link", { name: new RegExp(`^${f.name}`) });
      await expect(link).toHaveAttribute("href", `/work/${f.slug}`);
      await expect(link).toContainText(f.result);
      await expect(link).toContainText(f.claim.qualifier);
      await expect(link).toContainText(`${f.square}, where ${f.move} landed`);
    }
    expect(featured.map((f) => f.square)).toEqual(["g4", "e4", "c5"]); // 10…Bg4, 7…Ne4, 3…Bc5
    // the labels are placed on their pieces once the room is built
    await expect(page.locator(".piece[data-placed]")).toHaveCount(3, { timeout: 30_000 });
    expect(errors).toEqual([]);
  });

  test("is accessible", async ({ page }) => {
    await page.goto("/work");
    await expect(page.locator(".piece[data-placed]")).toHaveCount(3, { timeout: 30_000 });
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("opening a piece is a cut to its page", async ({ page }) => {
      await page.goto("/work");
      await page.getByRole("link", { name: /^CircuitMindAI/ }).click();
      await expect(page).toHaveURL(/\/work\/circuitmindai$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("CircuitMindAI");
      await expect.poll(() => seam(page), { timeout: 5_000 }).toBeCloseTo(share(49), 1);
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("lists the three projects", async ({ page }) => {
      await page.goto("/work");
      for (const f of featured) await expect(page.getByRole("link", { name: new RegExp(`^${f.name}`) })).toBeVisible();
    });
  });
});

test.describe("a project page", () => {
  for (const f of featured) {
    test(`${f.name}: the piece on the seam at ${f.move}, then the case study`, async ({ page }) => {
      test.setTimeout(60_000);
      const errors = errorsOf(page);
      const res = await page.goto(`/work/${f.slug}`);
      // every page under /work/ carries its own CSP nonce (the proxy used to skip the folder)
      expect(res!.headers()["content-security-policy"]).toMatch(/'nonce-[^']+'/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(f.name);
      await expect.poll(() => seam(page)).toBeCloseTo(share(f.cp), 1);
      const main = page.locator("main");
      await expect(main).toContainText(prose(f.claim.display));
      await expect(main).toContainText(f.claim.qualifier);
      for (const id of f.project.caseStudy?.evidence ?? []) {
        await expect(main).toContainText(prose(claim(id).display));
        await expect(main).toContainText(claim(id).qualifier);
      }
      for (const b of f.project.caseStudy?.built ?? []) await expect(main).toContainText(prose(b));
      if (f.project.repo) await expect(page.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute("href", f.project.repo);
      await expect(page.getByRole("link", { name: "Back to all work" })).toHaveAttribute("href", "/work");
      // scrolled into the case study, the seam is a hairline at the edge
      await page.evaluate(() => window.scrollTo(0, innerHeight * 1.6));
      await expect.poll(() => seam(page)).toBeLessThan(0.5);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => seam(page)).toBeCloseTo(share(f.cp), 1);
      expect(errors).toEqual([]);
    });
  }

  test("is accessible, at rest and in the case study", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/work/faultline");
    let a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, innerHeight * 3));
    await page.waitForTimeout(500);
    a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test("only the three featured projects have pages", async ({ page }) => {
    const res = await page.goto("/work/rexcheck");
    expect(res!.status()).toBe(404);
  });

  test("no sideways scrolling at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const f of featured) {
      await page.goto(`/work/${f.slug}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    }
  });
});
