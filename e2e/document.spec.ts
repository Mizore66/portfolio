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
    await expect(page.getByTestId("masthead-contacts").locator('a[href="/print-edition"]')).toHaveCount(0);
    await expect(page.getByTestId("recruiter-nav").locator('a[href="/print-edition"]')).toBeVisible();
    await expect(page.locator("#veridian")).toContainText("Veridian — MLOps Tradeoff Engine");
    await expect(page.locator("#setel")).toContainText(/new developer/);
    await expect(page.locator("#petronas")).toContainText(/department leadership/);
    await expect(page.getByRole("link", { name: "Read the Veridian case study" })).toHaveAttribute(
      "href",
      "/projects/veridian",
    );
    await expect(page.getByTestId("recruiter-nav").locator('a[href="/#work"]')).toHaveAttribute("href", "/#work");
    await expect(page.getByTestId("hero-engine")).toBeVisible();
    await expect(page.getByTestId("hero-engine-chip")).toContainText(/−143/);
    await expect(page.getByTestId("teaser-line")).toHaveCount(0);
    await expect(page.getByTestId("notation-view")).toHaveCount(0);
    await expect(page.getByTestId("home-footer")).toBeVisible();
    await expect(page.getByTestId("closer")).toHaveCount(0);
    await expect(page.getByTestId("colophon")).toHaveCount(0);
    await expect(page.getByTestId("career-trajectory")).toContainText(/Petronas/);
    await expect(page.getByTestId("career-trajectory")).toContainText(/through-line/);
    await expect(page.getByTestId("career-trajectory")).not.toContainText(/The desks compound/);
    await expect(page.getByTestId("about-band")).toContainText(/played chess since I was a teenager/);
    await expect(page.getByTestId("about-band")).toContainText(/Built production payment/);
    await expect(page.getByTestId("retrieval-split")).toContainText(/different corpus/);
    await expect(page.getByTestId("masthead-availability")).toContainText(/Seeking software engineering roles/);
    await expect(page.getByTestId("contact-band")).not.toContainText(/Seeking software engineering roles/);
    await expect(page.getByTestId("path-filter")).toContainText(/ML \/ data systems/);
    await expect(page.getByTestId("path-filter")).toContainText(/Product \/ backend/);
    await expect(page.getByRole("link", { name: /Skip to selected work/i })).toHaveCount(1);
    await expect(page.getByTestId("lab-teaser")).toContainText(/learned evaluator lost/i);
    await expect(page.getByTestId("masthead-proof")).toContainText(/−40% production defects/);
    await expect(page.getByTestId("masthead-proof")).toContainText(/100M-event capacity/);
    await expect(page.getByTestId("masthead-proof").locator(".metric-row").nth(2)).toHaveText(
      "100M-event capacity benchmark",
    );
    await expect(page.getByTestId("masthead-how")).toContainText(/constraint to measurement/);
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
    await page.getByRole("link", { name: "Read the Veridian case study" }).click();
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
    await expect(page.getByTestId("hero-engine")).toBeVisible();
    await expect(page.locator("#setel")).toContainText(/Setel/);
    await expect(page.locator("#veridian")).toContainText(/Veridian —/);
    await expect(page.getByTestId("contact-email")).toContainText("anasqumhiyeh@gmail.com");
  });
});

test.describe("opening paper", () => {
  test("the analysis board shares the first desktop screen", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    const engine = page.getByTestId("hero-engine");
    await expect(engine).toBeVisible();
    const box = await engine.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.y).toBeLessThan(640);
    await expect(page.locator("#hero-board")).not.toHaveAttribute("tabindex");
  });
  test("/?move= redirects onto the scoresheet plate", async ({ page }) => {
    await page.goto("/?move=e4");
    await expect(page).toHaveURL(/\/opening-preparation/);
    await expect(page.locator("[data-hydrated='true']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "The University Opening" })).toBeVisible();
  });

  test("the front page is shorter than the scoresheet plate", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const home = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.goto("/opening-preparation");
    const paper = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(home).toBeLessThan(paper);
    expect(home).toBeLessThan(14000);
  });
});

test.describe("selected work paths", () => {
  test("product path keeps CircuitMind and drops Veridian", async ({ page }) => {
    await page.goto("/?path=product#work");
    await expect(page.getByTestId("selected-work")).toBeVisible();
    await expect(page.locator("#circuitmindai")).toBeVisible();
    await expect(page.locator("#veridian")).toHaveCount(0);
  });
});

test.describe("plates", () => {
  test("internal routes and the print edition respond", async ({ request }) => {
    for (const path of [
      "/",
      "/opening-preparation",
      "/projects/veridian",
      "/lab/learned-evaluator",
      "/colophon",
      "/print-edition",
      "/admin/login",
    ]) {
      const res = await request.get(path);
      expect(res.ok(), path).toBe(true);
    }
    const missing = await request.get("/page-that-never-made-the-plate");
    expect(missing.status()).toBe(404);
  });
});

test.describe("exhibit evidence", () => {
  test("GraphRAG names the +35/+45 split and a public-source state", async ({ page }) => {
    await page.goto("/projects/multi-agent-graphrag");
    await expect(page.getByTestId("retrieval-split")).toContainText(/different corpus/);
    await expect(page.getByTestId("evidence-card")).toContainText(/\+35%/);
    await expect(page.getByTestId("evidence-card")).toContainText(/Vector-only/);
    await expect(page.getByTestId("evidence-card")).toContainText(/Evidence gap/);
    await expect(page.getByTestId("exhibit-rail")).toContainText(/Sole builder/);
    await expect(page.getByTestId("exhibit-rail")).toContainText(/Private project archive/);
    await expect(page.locator("#limitations")).toBeVisible();
    await expect(page.getByTestId("illustration-date")).toContainText(/later illustration/);
    await expect(page.getByTestId("exhibit-dates")).toContainText(/Published Oct 2025/);
    await expect(page.getByTestId("evidence-card")).not.toContainText(/Evaluation · evaluation/i);
  });
});

test.describe("narrow exhibits", () => {
  test("Veridian and the homepage do not scroll sideways at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ["/", "/projects/veridian"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, path).toBe(false);
    }
  });
});

test.describe("work filters", () => {
  test("the ML path survives a trip through Veridian", async ({ page }) => {
    await page.goto("/?path=ml#work");
    await expect(page.getByTestId("path-filter").locator(".path-chip-current")).toContainText(/ML \/ data systems/);
    await page.getByRole("link", { name: "Read the Veridian case study" }).click();
    await expect(page).toHaveURL(/path=ml/);
    await page.getByRole("link", { name: "Back to selected work" }).first().click();
    await expect(page).toHaveURL(/path=ml/);
    await expect(page.getByTestId("path-filter").locator(".path-chip-current")).toContainText(/ML \/ data systems/);
  });
});
