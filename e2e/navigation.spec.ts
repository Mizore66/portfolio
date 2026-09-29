import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The one page (owner direction, 2026-09-29): the nav glides to each section and the seam follows the scroll; the
// address follows the section in view. Project and role pages still sweep in, and Back returns to the same place.
const REST: Record<string, string> = { top: "55.9", roles: "100.0", work: "1.5", lab: "30.5", contact: "55.9" };
const seam = (page: Page) => page.locator(".site").evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue("--seam")).toFixed(1));
const nav = (page: Page, name: string) => page.locator(".chrome [data-layer=ink] .nav").getByRole("link", { name, exact: true });
const top = (page: Page, id: string) => page.evaluate((id) => Math.round(document.getElementById(id)!.getBoundingClientRect().top), id);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
});

test.describe("the one page", () => {
  test("one main and one h1, and the sections in order", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1, { timeout: 30_000 }); // the hero shows its name once its stage is up
    const ids = await page.locator("main > section[id]").evaluateAll((s) => s.map((x) => x.id));
    expect(ids).toEqual(["top", "roles", "work", "archive", "lab", "contact"]);
  });

  test("each nav item glides to its section: the seam, the address and the underline follow", async ({ page }) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto("/");
    for (const [name, id] of [["Work", "work"], ["Lab", "lab"], ["Contact", "contact"], ["Roles", "roles"]]) {
      await nav(page, name).click();
      await expect(page).toHaveURL(new RegExp(`/#${id}$`));
      await expect.poll(() => top(page, id), { timeout: 60_000 }).toBeLessThan(3);
      await expect.poll(() => seam(page), { timeout: 60_000 }).toBe(REST[id]);
      await expect(nav(page, name)).toHaveAttribute("aria-current", "page");
    }
    expect(errors).toEqual([]);
  });

  test("scrolling moves the seam between the sections' rests, and the address with it", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/");
    const y = await page.evaluate(() => document.getElementById("work")!.getBoundingClientRect().top + scrollY);
    // halfway across the boundary from Roles (100%) to Work (1.5%): the seam is between them
    await page.evaluate((y) => scrollTo(0, y - innerHeight / 2), y);
    await expect.poll(async () => Number(await seam(page)), { timeout: 60_000 }).toBeLessThan(99);
    expect(Number(await seam(page))).toBeGreaterThan(2);
    await page.evaluate((y) => scrollTo(0, y), y);
    await expect.poll(() => seam(page), { timeout: 60_000 }).toBe(REST.work);
    await expect(page).toHaveURL(/\/#work$/);
  });

  test("the old addresses land on their sections, and /lab is still the whole Lab", async ({ page }) => {
    test.setTimeout(180_000);
    for (const [path, id] of [["/roles", "roles"], ["/work", "work"], ["/contact", "contact"]]) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/#${id}$`));
      await expect.poll(() => top(page, id), { timeout: 60_000 }).toBeLessThan(3);
    }
    await page.goto("/lab");
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.locator("[data-ch]")).toHaveCount(8); // the opening and seven chapters
  });

  test("into a project and Back: the same place on the page", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/#work");
    await expect.poll(() => top(page, "work"), { timeout: 60_000 }).toBeLessThan(3);
    const y = await page.evaluate(() => scrollY);
    await page.locator("#work .work-pieces a").first().click();
    await expect(page).toHaveURL(/\/work\/[\w-]+$/, { timeout: 60_000 });
    await page.goBack();
    await expect(page).toHaveURL(/\/#work$/);
    await expect.poll(() => page.evaluate(() => scrollY), { timeout: 60_000 }).toBe(y);
    await expect.poll(() => seam(page), { timeout: 60_000 }).toBe(REST.work);
  });

  test("from a project page, a nav item sweeps to its section", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/work/faultline");
    await nav(page, "Lab").click();
    await expect(page).toHaveURL(/\/#lab$/, { timeout: 60_000 });
    await expect.poll(() => seam(page), { timeout: 60_000 }).toBe(REST.lab);
    await expect.poll(() => top(page, "lab"), { timeout: 60_000 }).toBeLessThan(3);
  });

  test("the nav and the résumé link work from the keyboard", async ({ page }) => {
    test.setTimeout(120_000); // arriving on a section builds the scenes around it at once, slow under software GL
    await page.goto("/lab");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to content");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Roles");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/#work$/, { timeout: 60_000 });
    await expect.poll(() => seam(page), { timeout: 60_000 }).toBe(REST.work);
  });

  test("résumé mode is a plain page: no chrome, no seam", async ({ page }) => {
    await page.goto("/#work");
    await page.locator(".chrome [data-layer=ink] a.resume-link").click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator(".chrome")).toHaveCount(0);
  });

  test("the page, the Lab, a project and a role are accessible", async ({ page }) => {
    test.setTimeout(180_000);
    for (const path of ["/", "/lab", "/work/faultline", "/roles/deriv"]) {
      await page.goto(path);
      const a11y = await new AxeBuilder({ page }).analyze();
      expect(a11y.violations.map((v) => `${path}: ${v.id}`)).toEqual([]);
    }
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("a nav item jumps to its section, and a page change is a cut", async ({ page }) => {
      test.setTimeout(90_000);
      await page.goto("/");
      await page.evaluate(() => {
        const w = window as unknown as { __swept: boolean }; w.__swept = false;
        new MutationObserver(() => { if (document.querySelector(".site[data-seam-moving]")) w.__swept = true; })
          .observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-seam-moving"] });
      });
      await nav(page, "Work").click();
      await expect(page).toHaveURL(/\/#work$/);
      await expect.poll(() => top(page, "work"), { timeout: 30_000 }).toBeLessThan(3);
      await expect.poll(() => seam(page), { timeout: 30_000 }).toBe(REST.work);
      expect(await page.evaluate(() => (window as unknown as { __swept: boolean }).__swept)).toBe(false);
    });
  });

  test.describe("without View Transitions", () => {
    test("a project page's nav still reaches its section", async ({ page }) => {
      test.setTimeout(180_000);
      await page.addInitScript(() => { delete (Document.prototype as { startViewTransition?: unknown }).startViewTransition; });
      await page.goto("/work/faultline");
      await nav(page, "Work").click();
      await expect(page).toHaveURL(/\/#work$/, { timeout: 60_000 });
      await expect.poll(() => seam(page), { timeout: 60_000 }).toBe(REST.work);
    });
  });
});
