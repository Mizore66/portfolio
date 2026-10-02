// Full-page render of a long key frame. Usage: node design/keyframes/_render-long.cjs lab-long
const { chromium } = require("playwright"); const path = require("path");
(async () => { const name = process.argv[2]; const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }); const errs = [];
  p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(`http://127.0.0.1:4173/design/keyframes/${name}.html`, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 }).catch(() => errs.push("3D never ready")); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(__dirname, "png", name + ".png"), fullPage: true }); console.log(name, errs.length ? errs.join(" | ") : "ok"); await b.close(); })();
