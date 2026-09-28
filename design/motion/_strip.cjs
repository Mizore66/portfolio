// Film strip: stills of a prototype at given times. Usage: node design/motion/_strip.cjs <name> "<t1,t2,...>" [query] [w] [h]
const { chromium } = require("playwright"); const path = require("path");
(async () => {
  const [name, times, q = "", w = 1440, h = 900] = process.argv.slice(2);
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  await p.goto(`http://127.0.0.1:4173/design/motion/${name}.html?capture${q ? "&" + q : ""}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const tag = q ? "-" + q.replace(/[^a-z0-9]+/gi, "") : "";
  for (const t of times.split(",").map(Number)) { await p.evaluate((t) => window.__seek(t), t); await p.screenshot({ path: path.join(__dirname, "strip", `${name}${tag}-${t.toFixed(2)}.png`) }); }
  console.log(name, "ok"); await b.close();
})();
