// Frame-exact capture of a prototype to WebM. Usage: node design/motion/_capture.cjs <name> [fps] [w] [h] [query]
const { chromium } = require("playwright"); const { spawnSync } = require("child_process"); const fs = require("fs"); const path = require("path"); const os = require("os");
const FF = path.join(os.homedir(), "Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac");
(async () => {
  const [name, fps = 30, w = 1440, h = 900, q = ""] = process.argv.slice(2);
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 }); const errs = [];
  p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(`http://127.0.0.1:4173/design/motion/${name}.html?capture${q ? "&" + q : ""}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const dur = await p.evaluate(() => window.__duration), n = Math.ceil(dur * fps) + 1, tmp = path.join(os.tmpdir(), `${name}.mjpeg`), out = fs.openSync(tmp, "w");
  for (let i = 0; i < n; i++) { await p.evaluate((t) => window.__seek(t), i / fps); fs.writeSync(out, await p.screenshot({ type: "jpeg", quality: 90 })); }
  fs.closeSync(out);
  const dst = path.join(__dirname, "video", `${name}${q ? "-" + q.replace(/[^a-z0-9]+/gi, "") : ""}.webm`);
  const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(fps), "-i", tmp, "-c:v", "libvpx", "-b:v", "6M", "-pix_fmt", "yuv420p", dst]);
  console.log(name, `${n} frames, ${dur.toFixed(2)} s`, r.status === 0 ? "ok" : String(r.stderr), errs.length ? "ERRORS: " + errs.join(" | ") : "");
  await b.close();
})();
