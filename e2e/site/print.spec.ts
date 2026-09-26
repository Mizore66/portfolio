import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("print, colophon, errors", () => {
  test("serves the résumé inline in both paper sizes", async ({ request }) => {
    for (const q of ["", "?paper=a4"]) {
      const res = await request.get(`/print-edition${q}`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toBe("application/pdf");
      expect(res.headers()["content-disposition"]).toBe('inline; filename="Anas-Tarek-Qumhiyeh-resume.pdf"');
      expect(res.headers()["cache-control"]).toBe("no-store");
      expect(res.headers().etag).toMatch(/^"resume-[0-9a-f]{32}"$/);
      expect((await res.body()).subarray(0, 8).toString()).toBe("%PDF-1.7");
    }
  });

  test("the colophon passes its own perft check and has no axe violations", async ({ page }) => {
    await page.goto("/colophon");
    await expect(page.locator(".perft tbody tr")).toHaveCount(3);
    await expect(page.locator(".perft")).not.toContainText("Mismatch");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });

  test("unknown pages are a real 404 with their own title and no canonical", async ({ page }) => {
    const res = await page.goto("/definitely/not/here");
    expect(res?.status()).toBe(404);
    await expect(page).toHaveTitle("Correction · Anas Qumhiyeh");
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    for (const name of ["Back to the front page", "Résumé", "Contact"]) await expect(page.getByRole("link", { name, exact: true }).last()).toBeVisible();
  });

  test("preview images and the icon are PNGs, and the stray favicon is gone", async ({ request, page }) => {
    for (const path of ["/", "/opening-preparation", "/lab/learned-evaluator", "/projects/faultline"]) {
      await page.goto(path);
      const url = await page.locator('meta[property="og:image"]').getAttribute("content");
      const res = await request.get(new URL(url!).pathname + new URL(url!).search);
      expect(res.headers()["content-type"], path).toBe("image/png");
    }
    expect((await request.get("/icon")).headers()["content-type"]).toBe("image/png");
    expect((await request.get("/favicon.ico")).status()).toBe(404);
  });
});
