// Gate 5 evidence for page changes on a machine without a GPU: the dev server (3000) runs the change in slow
// motion (src/lib/motion/slowmo.ts: GSAP and the page-change clocks; WAAPI through CDP), and frames are
// taken at known instants of animation time, so a slow CPU frame cannot distort what is shown.
// Usage: node design/build/_frames.cjs <out dir> <name> <from> <action> [w h] [slow]
//   action: "nav:Work" (a nav item), "piece:CircuitMindAI" (a Work label), "row:MirrorFi" (an Other Projects row), "link:<name regexp>", "back"
//   SCROLL=<screens> scrolls the first page down before acting
//   from may be "a>b": open a, navigate to b by its nav item, then act (for "back")
const { chromium } = require("playwright"); const fs = require("fs"); const path = require("path");
const EXE = process.env.CHROMIUM || "/opt/pw-browsers/chromium";
(async () => {
  const [out, name, from, action, w = 1440, h = 900, slow = 30] = process.argv.slice(2);
  let at = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2, 1.4, 1.7, 2.2]; // seconds of animation time
  // a piece first steps down to its page (1 s) before the page change starts
  if (action.startsWith("piece:") || action.startsWith("row:")) at.push(2.6, 3.1, 3.6);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: fs.existsSync(EXE) ? EXE : undefined, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } }), errs = [];
  p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && errs.push(m.text()));
  await p.addInitScript((n) => { sessionStorage.setItem("hero-opening-seen", "1"); sessionStorage.setItem("slowmo", String(n)); }, +slow);
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Animation.enable"); await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / +slow });
  await p.goto("http://localhost:3000" + from, { waitUntil: "load" });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForTimeout(6000);
  const [kind, arg] = action.split(":");
  if (kind === "back") { await p.locator(".piece a", { hasText: "FaultLine" }).click(); await p.waitForURL(/faultline/, { timeout: 180000 }); await p.waitForTimeout(6000 * (+slow / 10)); }
  if (process.env.SCROLL) { await p.evaluate((y) => window.scrollTo(0, y * innerHeight), +process.env.SCROLL); await p.waitForTimeout(4000); }
  const t0 = Date.now();
  if (kind === "nav") await p.locator(".chrome [data-layer=ink] .nav a", { hasText: arg }).click();
  else if (kind === "piece") await p.locator(".piece a", { hasText: arg }).click();
  else if (kind === "row") await p.locator(".others .sheet a", { hasText: arg }).click();
  else if (kind === "back") await p.goBack();
  else if (kind === "link") await p.getByRole("link", { name: new RegExp(arg) }).first().click();
  const shots = [];
  for (const t of at) {
    const wait = t0 + t * 1000 * slow - Date.now(); if (wait > 0) await p.waitForTimeout(wait);
    const real = (Date.now() - t0) / 1000 / slow, f = `${name}-${t.toFixed(2)}.png`;
    await p.screenshot({ path: path.join(out, f), timeout: 180000 });
    shots.push({ t, real: +real.toFixed(3), file: f });
  }
  const seam = await p.evaluate(() => getComputedStyle(document.querySelector(".site")).getPropertyValue("--seam"));
  fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify({ name, from, action, url: p.url(), seam, shots, errors: errs }, null, 1));
  console.log(name, p.url(), seam, errs.length ? "ERRORS " + errs.join(" | ") : "ok");
  await b.close();
})();
