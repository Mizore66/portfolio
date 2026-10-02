import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The one page (owner direction, 2026-09-29): the nav glides to each section and the seam follows the scroll; the
// address follows the section in view. Project and role pages still sweep in, and Back returns to the same place.
const REST: Record<string, string> = { top: "55.9", roles: "100.0", work: "0.0", lab: "30.5", contact: "55.9" };
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
    // halfway across the boundary from Roles (100%) to Work (0%): the seam is between them
    await page.evaluate((y) => scrollTo(0, y - innerHeight / 2), y);
    await expect.poll(async () => Number(await seam(page)), { timeout: 60_000 }).toBeLessThan(99);
    expect(Number(await seam(page))).toBeGreaterThan(1);
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
    // the labels are placed once the room is drawn, then rise. Clicked before it is still, a label is "not stable", and
    // each of Playwright's retries scrolls the page to it: the page was left on Other Projects, and Back went there
    const piece = page.locator("#work .work-pieces li").first();
    await expect(piece).toHaveAttribute("data-placed", "", { timeout: 60_000 });
    await expect(piece).toHaveCSS("opacity", "1", { timeout: 60_000 }); // drawn in software, the rise can take seconds
    await piece.locator("a").click();
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

  test("the nav and the résumé link work from the keyboard", async ({ page, browserName }) => {
    test.setTimeout(120_000); // arriving on a section builds the scenes around it at once, slow under software GL
    const tab = browserName === "webkit" ? "Alt+Tab" : "Tab"; // Safari's Tab skips links unless the user asks; Option-Tab reaches them
    await page.goto("/lab");
    await page.keyboard.press(tab);
    await expect(page.locator(":focus")).toHaveText("Skip to content");
    await page.keyboard.press(tab);
    await expect(page.locator(":focus")).toHaveText("Roles");
    await page.keyboard.press(tab);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/#work$/, { timeout: 60_000 });
    await expect.poll(() => seam(page), { timeout: 60_000 }).toBe(REST.work);
  });

  // on a phone a tapped nav link kept its focus, and the ink copy of the nav stayed, dark over the dark sections, while
  // the paper copy stepped away; keyboard focus brings both back
  test("on a phone the nav steps away as one, a tapped link or not, and keyboard focus brings it back", async ({ browser }) => {
    test.setTimeout(120_000);
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
    const page = await ctx.newPage();
    const op = (layer: string) => page.locator(`.chrome [data-layer=${layer}] .nav`).evaluate((e) => getComputedStyle(e).opacity);
    await page.goto("/#roles");
    const bb = (await nav(page, "Work").boundingBox())!;
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); // a tap leaves the link focused, not focus-visible
    await expect(page).toHaveURL(/\/#work$/, { timeout: 60_000 });
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(150); }
    await expect(page.locator(".site")).toHaveAttribute("data-nav-away", "");
    await expect.poll(() => op("ink")).toBe("0");
    await expect.poll(() => op("inv")).toBe("0");
    await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); // focus from the keyboard
    await expect.poll(() => op("ink")).toBe("1");
    await expect.poll(() => op("inv")).toBe("1");
    await ctx.close();
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
      // each section makes its entrance the first time it is seen, and axe skips what has not come in yet: bring them all in
      if (path === "/") for (const id of ["roles", "work", "archive", "lab", "contact"]) { await page.evaluate((i) => document.getElementById(i)!.scrollIntoView(), id); await page.waitForTimeout(1800); }
      else await page.waitForTimeout(2500);
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
