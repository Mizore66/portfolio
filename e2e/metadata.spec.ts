import { test, expect } from "@playwright/test";

// The favicon and the share cards (phase 6, step 3): every page links the mark, and names its own card, which exists.
const PAGES: [string, string][] = [
  ["/", "/og/home.jpg"], ["/lab", "/og/lab.jpg"], ["/resume", "/og/home.jpg"], ["/colophon", "/og/colophon.jpg"],
  ["/work/faultline", "/og/work/faultline.jpg"], ["/work/rexcheck", "/og/work/rexcheck.jpg"],
  ["/roles/deriv", "/og/roles/deriv.jpg"], ["/roles/education", "/og/roles/education.jpg"],
];

test("each page names its own share card, and the card and the icons are served", async ({ request }) => {
  for (const [path, image] of PAGES) {
    const html = await (await request.get(path)).text();
    const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    expect(og, path).toBeDefined();
    expect(new URL(og!).pathname, path).toBe(image);
    expect(html, path).toContain('<meta name="twitter:card" content="summary_large_image"/>');
    const res = await request.get(image);
    expect(res.status(), image).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/jpeg");
  }
  const html = await (await request.get("/")).text();
  for (const rel of ['rel="icon" href="/favicon.ico', 'rel="icon" href="/icon.svg', 'rel="apple-touch-icon" href="/apple-icon.png']) expect(html).toContain(rel);
  for (const file of ["/favicon.ico", "/icon.svg", "/apple-icon.png"]) expect((await request.get(file)).status(), file).toBe(200);
});

// A phone's forced dark mode (Samsung Internet, Chrome) turned the Roles hall's type white over its white 3D floor. The page
// declares "only light", and answers a dark preference with it too (Samsung Internet's test), so the browser leaves its
// colours alone; with the phone in dark mode the type stays ink.
test("in dark mode the page keeps its own colours: ink type on the paper hall", async ({ browser }) => {
  const page = await (await browser.newContext({ colorScheme: "dark", viewport: { width: 390, height: 844 } })).newPage();
  await page.goto("/roles/deriv");
  expect(await page.locator('meta[name="color-scheme"]').getAttribute("content")).toBe("only light");
  const ink = await page.getByRole("heading", { level: 1 }).evaluate((e) => getComputedStyle(e).color);
  expect(ink).toBe("rgb(13, 13, 12)");
  await page.context().close();
});
