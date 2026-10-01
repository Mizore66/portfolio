import { test, expect } from "@playwright/test";

// Chrome keeps 16 WebGL contexts alive in a page and loses the oldest past that, leaving its canvas blank. The one
// page's kept scenes (7 contexts) and the Lab's chapters (14) went past it: back from /lab the hall and the hero were
// blank (the owner's recordings of 1 October). A renderer is now made only with room for it (env.ts).
test("a round trip through the Lab loses no WebGL context", async ({ page }) => {
  test.setTimeout(300_000);
  const lost: string[] = [];
  page.on("console", (m) => { if (/Too many active WebGL contexts|Context Lost/.test(m.text())) lost.push(m.text()); });
  await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
  await page.goto("/");
  for (const id of ["roles", "work", "archive", "lab", "contact"]) {
    await page.evaluate((id) => document.getElementById(id)!.scrollIntoView(), id);
    await page.waitForTimeout(2500);
  }
  await page.locator('a[href="/lab"]:visible').first().click();
  await expect(page).toHaveURL(/\/lab$/);
  // each chapter is built as it comes near
  for (const ch of ["1", "2", "3", "4", "5", "6", "7"]) {
    await page.evaluate((ch) => document.querySelector(`[data-ch="${ch}"]`)!.scrollIntoView(), ch);
    await expect.poll(() => page.locator(`[data-ch="${ch}"] canvas`).first().evaluate((c) => (c as HTMLCanvasElement).width > 300), { timeout: 60_000 }).toBe(true);
  }
  await page.locator(".chrome [data-layer=ink] .nav a", { hasText: "Roles" }).click();
  await expect(page).toHaveURL(/\/#roles$/);
  await expect.poll(() => page.locator("#roles canvas").first().evaluate((c) => (c as HTMLCanvasElement).width > 300), { timeout: 60_000 }).toBe(true);
  await page.waitForTimeout(3000);
  expect(lost).toEqual([]);
});
