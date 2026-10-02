// Renders asset stills. Usage: node design/assets/_render.cjs <name> [w] [h]
const { chromium } = require("playwright"); const path = require("path");
(async () => { const [name, w = 1440, h = 900] = process.argv.slice(2);
  const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 }); const e = [];
  p.on("pageerror", (x) => e.push(x.message)); p.on("console", (m) => m.type() === "error" && e.push(m.text()));
  await p.goto(`http://127.0.0.1:4173/design/assets/${name.split("?")[0]}.html${name.includes("?") ? "?" + name.split("?")[1] : ""}`, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 }).catch(() => e.push("not ready")); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(__dirname, "renders", `${name.replace(/[?=]/g, "-").replace("-p-", "-")}${+w < 600 ? "-m" : ""}.png`) }); console.log(name, e.join(" | ") || "ok"); await b.close(); })();
