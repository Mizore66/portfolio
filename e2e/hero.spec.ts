import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { content } from "../src/content/site";

// design/motion.md §1: the opening plays once per session, then the hero rests on the seam at +0.64.
const SEAM = "55.9"; // share(64 cp), as a percentage
// The nav routes are built in Phase 5 step 4; until then Next's prefetch of them 404s.
const UNBUILT = /\/(roles|work|lab|contact)\?_rsc=/;

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && errors.push(m.text()));
  page.on("response", (r) => r.status() >= 400 && !UNBUILT.test(r.url()) && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}
const seam = (page: Page) => page.locator(".hero").evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue("--seam")).toFixed(1));

test.describe("hero", () => {
  test("plays the opening and comes to rest on the seam", async ({ page }) => {
    test.setTimeout(60_000);
    const errors = watchErrors(page);
    // record every state the hero passes through: CPU-rendered WebGL can stall the page past a short one
    await page.addInitScript(() => {
      const seen: string[] = ((window as unknown as { __intro: string[] }).__intro = []);
      new MutationObserver(() => { const v = document.querySelector(".hero")?.getAttribute("data-intro"); if (v && seen.at(-1) !== v) seen.push(v); })
        .observe(document, { subtree: true, attributes: true, attributeFilter: ["data-intro"], childList: true });
    });
    await page.goto("/");
    await expect(page.locator(".hero")).toHaveAttribute("data-intro", "done", { timeout: 45_000 });
    expect(await page.evaluate(() => (window as unknown as { __intro: string[] }).__intro)).toContain("play");
    expect(await seam(page)).toBe(SEAM);
    expect(await page.evaluate(() => sessionStorage.getItem("hero-opening-seen"))).toBe("1");
    expect(errors).toEqual([]);
  });

  test("plays once per session", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
    await page.goto("/");
    await expect(page.locator(".hero")).toHaveAttribute("data-intro", "done", { timeout: 15_000 });
    expect(await seam(page)).toBe(SEAM);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("shows the end state at once, and is accessible", async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto("/");
      await expect(page.locator(".hero")).toHaveAttribute("data-intro", "done", { timeout: 15_000 });
      expect(await seam(page)).toBe(SEAM);
      // the paper copy of the type is decorative: one heading, one set of links
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(content.identity.displayName);
      await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(1);
      await expect(page.getByRole("banner").getByRole("link", { name: "Résumé", exact: true })).toHaveAttribute("href", "/resume");
      const a11y = await new AxeBuilder({ page }).analyze();
      expect(a11y.violations.map((v) => v.id)).toEqual([]);
      expect(errors).toEqual([]);
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("shows the name, the line and the links", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("[data-layer=ink] h1")).toBeVisible();
      await expect(page.locator("[data-layer=ink] .line")).toBeVisible();
      await expect(page.locator("[data-layer=ink] .nav a")).toHaveCount(4);
      expect(await seam(page)).toBe(SEAM);
    });
  });
});
