import { expect, test } from "@playwright/test";

async function stripStyles(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("style, link[rel='stylesheet'], link[rel='preload'][as='style']")) {
      el.remove();
    }
  });
}

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
    await expect(page.locator("#veridian")).toContainText("Veridian — MLOps Tradeoff Engine");
    await expect(page.locator("#setel")).toContainText(/new developer/);
    await expect(page.locator("#petronas")).toContainText(/department leadership/);
    await expect(page.locator('#veridian a[href="/projects/veridian"]')).toHaveAttribute(
      "href",
      "/projects/veridian",
    );
    await expect(page.getByTestId("recruiter-nav").locator('a[href="#work"]')).toHaveAttribute("href", "#work");
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

  test("lab #result is addressable", async ({ page }) => {
    await page.goto("/lab/learned-evaluator#result");
    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("#result")).toContainText(/−143/);
  });
});

test.describe("copy email", () => {
  test("the address is selectable and a copy control exists", async ({ page }) => {
    await page.goto("/#contact");
    await expect(page.getByTestId("contact-email")).toHaveText(/anasqumhiyeh@gmail.com/);
    await expect(page.getByTestId("copy-email")).toBeVisible();
    const text = await page.getByTestId("contact-email").evaluate((el) => el.textContent);
    expect(text).toMatch(/anasqumhiyeh@gmail.com/);
    const select = await page.getByTestId("contact-email").evaluate((el) => getComputedStyle(el).userSelect);
    expect(select).not.toBe("none");
  });
});

test.describe("browser behavior", () => {
  test("Back from a case study returns to the paper", async ({ page }) => {
    await page.goto("/");
    await page.locator('#veridian a[href="/projects/veridian"]').click();
    await expect(page).toHaveURL(/\/projects\/veridian/);
    await page.goBack();
    await expect(page).toHaveURL(/\/(?:$|\?)/);
    await expect(page.locator("#veridian")).toBeVisible();
  });
});

test.describe("css off", () => {
  test("the document still reads as a CV when stylesheets are gone", async ({ page }) => {
    await page.goto("/");
    await stripStyles(page);
    const headings = await page.locator("h1, h2").allTextContents();
    expect(headings[0]).toMatch(/Anas T\. Qumhiyeh/);
    expect(headings.join("\n")).toMatch(/Selected work/);
    expect(headings.join("\n")).toMatch(/Experience/);
    expect(headings.join("\n")).toMatch(/Laboratory/);
    expect(headings.join("\n")).toMatch(/Contact/);
    await expect(page.locator("#setel")).toContainText(/Setel/);
    await expect(page.locator("#veridian")).toContainText(/Veridian —/);
    await expect(page.getByTestId("contact-email")).toContainText("anasqumhiyeh@gmail.com");
  });
});
