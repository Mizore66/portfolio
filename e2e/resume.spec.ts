import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { content, prose } from "../src/content/site";

// Brief §2: résumé mode is complete, plain and fast, with no WebGL and no animation.
test.describe("résumé mode", () => {
  test("shows every role, project, number, qualifier and link", async ({ page }) => {
    await page.goto("/resume");
    const text = await page.locator("main").innerText();
    for (const r of content.roles) expect(text).toContain(r.employer);
    for (const p of content.projects.list) expect(text).toContain(p.name);
    const used = new Set([...content.roles.flatMap((r) => r.claimIds), ...content.projects.list.flatMap((p) => [p.result.claimId, ...(p.caseStudy?.evidence ?? [])])]);
    for (const c of content.claims.filter((c) => used.has(c.id))) {
      expect(text).toContain(prose(c.display));
      expect(text).toContain(c.qualifier);
    }
    for (const c of content.resume.contact) await expect(page.locator(`a[href="${c.href}"]`)).toHaveCount(1);
    for (const p of content.projects.list.filter((p) => p.repo)) await expect(page.locator(`a[href="${p.repo}"]`)).toHaveCount(1);
    expect(text).toContain(`WAM ${content.education.wam}, CGPA ${content.education.cgpa}`);
  });

  test("is plain: no canvas, no CSP errors, accessible", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto("/resume");
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(errors).toEqual([]);
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.map((v) => v.id)).toEqual([]);
  });

  test("prints without the screen controls", async ({ page }) => {
    await page.goto("/resume");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".bar")).toBeHidden();
  });

  test("the v2 print edition redirects here", async ({ page }) => {
    await page.goto("/print-edition");
    await expect(page).toHaveURL(/\/resume$/);
  });

  test("every page links to it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a.resume-link[href="/resume"]')).toBeVisible();
  });
});
