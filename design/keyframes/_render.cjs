// Renders key frames to PNG. Usage: node design/keyframes/_render.cjs [name-substring ...]
// Needs the "keyframes" static server (.claude/launch.json) on :4173.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const OUT = path.join(DIR, "png");
const SIZES = { d: [1440, 900], m: [390, 844] };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const filters = process.argv.slice(2);
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".html") && f !== "index.html" && (!filters.length || filters.some((s) => f.includes(s))));
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  for (const f of files) {
    const mobile = /-m\.html$/.test(f);
    const [w, h] = SIZES[mobile ? "m" : "d"];
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`http://127.0.0.1:4173/design/keyframes/${f}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const has3d = await page.evaluate(() => !!document.querySelector("canvas"));
    if (has3d) await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 }).catch(() => errors.push("3D never signalled ready"));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(OUT, f.replace(/\.html$/, ".png")) });
    console.log(f.padEnd(34), errors.length ? "ERRORS: " + errors.join(" | ") : "ok");
    await page.close();
  }
  await browser.close();
})();
