import { expect, test } from "@playwright/test";

test.describe("document mode", () => {
  test.use({ javaScriptEnabled: false });

  test("identity, work, experience, and contact survive without JS", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Anas T. Qumhiyeh" })).toBeVisible();
    await expect(page.getByTestId("masthead-role")).toContainText(/Software engineer/);
    await expect(page.getByTestId("selected-work")).toBeVisible();
    await expect(page.getByTestId("experience-list")).toBeVisible();
    await expect(page.locator("#setel")).toBeVisible();
    await expect(page.getByTestId("contact-email")).toContainText("anasqumhiyeh@gmail.com");
    await expect(page.getByTestId("masthead-contacts").locator('a[href="/print-edition"]')).toBeVisible();
  });
});

test.describe("deep links", () => {
  test("#setel lands on the Setel desk", async ({ page }) => {
    await page.goto("/#setel");
    await expect(page.locator("#setel")).toBeVisible();
    await expect(page.locator("#setel")).toContainText(/Setel/);
  });

  test("homepage flagship #veridian is addressable", async ({ page }) => {
    await page.goto("/#veridian");
    await expect(page.locator("#veridian")).toBeVisible();
  });

  test("exhibit subsection #apparatus is addressable", async ({ page }) => {
    await page.goto("/projects/veridian#apparatus");
    await expect(page.locator("#apparatus")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /Veridian/ })).toBeVisible();
  });
});

test.describe("copy email", () => {
  test("copies the address from Correspondence", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/#contact");
    await page.getByTestId("copy-email").click();
    await expect(page.getByTestId("copy-email")).toContainText(/Copied/);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/anasqumhiyeh@gmail.com/);
  });
});
