import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Brief §2.2, §2.6, §4.7, §4.8, §5.5 and the §5.6 launch checklist, checked against the running site. */

const PUBLIC = [
  "/",
  "/?path=ml",
  "/opening-preparation",
  "/opening-preparation?move=deriv",
  "/lab/learned-evaluator",
  "/colophon",
  "/projects/faultline",
  "/projects/gemini-teleportal",
  "/projects/circuitmindai",
  "/projects/veridian",
  "/projects/multi-agent-graphrag",
  "/projects/mirrorfi",
  "/projects/financial-risk-predictor",
  "/projects/distributed-lead-scorer",
  "/projects/slm-distillation-engine",
];

test.describe("redirects and removed routes", () => {
  test("static redirects land where the brief says", async ({ request }) => {
    for (const [from, to] of [["/about", "/#about"], ["/archive", "/#work"]]) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(res.headers().location, from).toBe(to);
    }
    const move = await request.get("/?move=re1", { maxRedirects: 0 });
    expect(move.status()).toBe(307);
    expect(move.headers().location).toBe("/opening-preparation?move=re1");
  });

  test("www and the production alias move to the apex; previews stay", async ({ request }) => {
    for (const host of ["www.anasqumhiyeh.dev", "anas-tarek-qumhiyeh.vercel.app"]) {
      const res = await request.get("/projects/veridian?path=ml", { headers: { host }, maxRedirects: 0 });
      expect(res.status(), host).toBe(308);
      expect(res.headers().location, host).toBe("https://anasqumhiyeh.dev/projects/veridian?path=ml");
    }
    const preview = await request.get("/", { headers: { host: "portfolio-abc123-mizore66s-projects.vercel.app" }, maxRedirects: 0 });
    expect(preview.status()).toBe(200);
  });

  test("the CMS is gone", async ({ request }) => {
    for (const path of ["/admin", "/admin/login", "/admin/export", "/api/cms-health"]) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(404);
    }
  });
});

test.describe("headers and caching", () => {
  test("every page carries the security headers and a fresh nonce", async ({ request }) => {
    const a = await request.get("/");
    const b = await request.get("/");
    for (const res of [a, b]) {
      const h = res.headers();
      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(h["x-frame-options"]).toBe("DENY");
      expect(h["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=(), payment=()");
      expect(h["strict-transport-security"]).toBe("max-age=31536000; includeSubDomains");
      expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+' 'wasm-unsafe-eval' https:\/\/va\.vercel-scripts\.com/);
      expect(h["content-security-policy"]).toMatch(/worker-src 'self' blob:/);
      expect(h["content-security-policy"]).not.toMatch(/(^|\s)'unsafe-eval'/);
      expect(h["content-security-policy"]).not.toMatch(/script-src[^;]*'unsafe-inline'/);
      expect(h["cache-control"]).toMatch(/private/);
      expect(h["cache-control"]).not.toMatch(/s-maxage|public/);
    }
    const nonce = (h: Record<string, string>) => h["content-security-policy"].match(/'nonce-([^']+)'/)![1];
    expect(nonce(a.headers())).not.toBe(nonce(b.headers()));
  });
});

test.describe("sitemap and robots", () => {
  test("the sitemap lists every public page with the brief's priorities", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const [path, priority] of [["", "1"], ["/opening-preparation", "0.8"], ["/lab/learned-evaluator", "0.7"], ["/projects/faultline", "0.6"], ["/colophon", "0.3"]]) {
      expect(xml, path).toContain(`<loc>https://anasqumhiyeh.dev${path}</loc>`);
      expect(xml, path).toMatch(new RegExp(`<loc>https://anasqumhiyeh.dev${path.replace(/\//g, "\\/")}</loc>[\\s\\S]*?<priority>${priority}</priority>`));
    }
    expect(xml.match(/\/projects\//g)).toHaveLength(10);
    expect(xml).not.toContain("/admin");
  });

  test("robots allows everything and points at the sitemap", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    expect(txt).toContain("Allow: /");
    expect(txt).not.toContain("Disallow");
    expect(txt).toContain("Sitemap: https://anasqumhiyeh.dev/sitemap.xml");
  });
});

test.describe("accessibility bar (§5.5)", () => {
  for (const path of PUBLIC) {
    test(`${path}: axe, landmarks, heading order`, async ({ page }) => {
      await page.goto(path);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await expect(page.locator("header.site-header")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
      await expect(page.locator(".skip-link")).toHaveCount(1);
      const levels = await page.locator("h1, h2, h3, h4").evaluateAll((els) => els.map((e) => Number(e.tagName[1])));
      expect(levels[0], "first heading is the h1").toBe(1);
      expect(levels.filter((l) => l === 1)).toHaveLength(1);
      for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading jump at ${i}`).toBeLessThanOrEqual(1);
    });
  }

  test("no sideways scrolling at any listed viewport", async ({ page }) => {
    const sizes = [[320, 800], [375, 812], [768, 1024], [1280, 800], [1920, 1080], [640, 400], [320, 200], [844, 390]];
    for (const path of PUBLIC) {
      for (const [w, h] of sizes) {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} at ${w}×${h}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("the front page stays under 14,000 px tall at 390 px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(14_000);
  });

  test("sticky chrome takes at most 12% of a 375×812 screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 2000));
    const sticky = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((el) => ["sticky", "fixed"].includes(getComputedStyle(el).position) && el.getBoundingClientRect().top <= 1)
        .reduce((sum, el) => sum + el.getBoundingClientRect().height, 0),
    );
    expect(sticky / 812).toBeLessThanOrEqual(0.12);
  });

  test("touch targets are at least 44 px on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/", "/projects/faultline", "/opening-preparation", "/colophon"]) {
      await page.goto(path);
      const small = await page.$$eval("a, button, summary", (els) =>
        els
          .filter((e) => {
            const r = e.getBoundingClientRect();
            if (!r.width || !r.height || r.height >= 44) return false;
            if (e.closest(".gb-board, .cg-mark, .skip-link")) return false; // the board grid and graph marks are sized by the board
            const inline = getComputedStyle(e).display === "inline" && e.closest("p, li, td, dd, figcaption");
            return !inline;
          })
          .map((e) => `${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 40)} ${Math.round(e.getBoundingClientRect().height)}px`),
      );
      expect(small, path).toEqual([]);
    }
  });

  test("forced colours keep the page readable", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });

  test("Save-Data skips the decorative thumbnails", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".card-thumb").first()).toBeAttached();
    await page.setExtraHTTPHeaders({ "Save-Data": "on" });
    await page.goto("/");
    await expect(page.locator(".card").first()).toBeVisible();
    await expect(page.locator(".card-thumb")).toHaveCount(0);
  });

  test("with reduced motion nothing animates on its own", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
    expect(running).toBe(0);
  });
});

test.describe("readable without help (§4.8)", () => {
  test("every fact is readable with JavaScript off", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("I like systems that have to survive measurement.");
    await expect(page.locator("#deriv")).toContainText("AI Engineer");
    await expect(page.locator("#contact")).toContainText("anasqumhiyeh@gmail.com");
    await page.goto("/projects/faultline");
    await expect(page.locator("#measurement")).toContainText("PASS→FAIL");
    await context.close();
  });

  test("the front page still reads as a CV with stylesheets gone", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.querySelectorAll("style, link[rel='stylesheet']").forEach((el) => el.remove()));
    const text = await page.locator("main").innerText();
    for (const s of ["I like systems", "Deriv", "Skribble Lab", "Monash University", "anasqumhiyeh@gmail.com"]) expect(text).toContain(s);
  });
});
