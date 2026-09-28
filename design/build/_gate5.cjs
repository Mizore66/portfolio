// Gate 5 evidence for a built page: the approved key frame, the approved prototype and the build at the same
// instants, a per-frame pixel difference, and a frame-exact WebM of the build.
// Needs the design server (4173) and the dev server (3000). Usage: node design/build/_gate5.cjs hero
const { chromium } = require("playwright"); const { spawnSync } = require("child_process");
const fs = require("fs"); const path = require("path"); const os = require("os");
const FF = path.join(os.homedir(), "Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac");
const PAGES = { hero: { key: "hero-a", proto: "hero-3d", build: "/", times: [0.4, 1.5, 2.7, 3.6, 4.4, 5.5, 7.7] } };
const SIZES = [[1440, 900], [390, 844]];
(async () => {
  const name = process.argv[2] || "hero", cfg = PAGES[name], dir = path.join(__dirname, name), report = { times: cfg.times, sizes: {} };
  const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const open = async (url, w, h) => { const p = await b.newPage({ viewport: { width: w, height: h } }); p.errs = [];
    p.on("pageerror", (x) => p.errs.push(x.message)); p.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && p.errs.push(m.text()));
    await p.goto(url, { waitUntil: "load" }); await p.addStyleTag({ content: "nextjs-portal{display:none!important}" }); return p; };
  for (const [w, h] of SIZES) {
    const m = w < 600 ? "-m" : "", r = (report.sizes[`${w}x${h}`] = { diff: [], errors: {} });
    const k = await open(`http://127.0.0.1:4173/design/keyframes/${cfg.key}${m}.html`, w, h); await k.waitForTimeout(3000);
    await k.screenshot({ path: `${dir}/key${m}.png`, timeout: 180000 }); await k.close();
    for (const [tag, url] of [["proto", `http://127.0.0.1:4173/design/motion/${cfg.proto}.html?capture`], ["build", `http://localhost:3000${cfg.build}?capture`]]) {
      const p = await open(url, w, h); await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
      for (const t of cfg.times) { await p.evaluate((t) => window.__seek(t), t); await p.waitForTimeout(50); await p.screenshot({ path: `${dir}/${tag}${m}-${t}.png`, timeout: 180000 }); }
      if (tag === "build") { // frame-exact video of the build
        const fps = 30, n = Math.ceil((await p.evaluate(() => window.__total)) * fps) + 1, tmp = path.join(os.tmpdir(), `g5-${name}${m}.mjpeg`), out = fs.openSync(tmp, "w");
        for (let i = 0; i < n; i++) { await p.evaluate((t) => window.__seek(t), i / fps); fs.writeSync(out, await p.screenshot({ type: "jpeg", quality: 90, timeout: 180000 })); }
        fs.closeSync(out);
        spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(fps), "-i", tmp, "-c:v", "libvpx", "-b:v", "6M", "-pix_fmt", "yuv420p", `${dir}/build${m}.webm`]);
      }
      r.errors[tag] = p.errs; await p.close();
    }
    // share of pixels whose channels differ by more than 40, prototype vs build
    const d = await b.newPage();
    for (const t of cfg.times) {
      const [a, c] = [`proto${m}-${t}.png`, `build${m}-${t}.png`].map((f) => "data:image/png;base64," + fs.readFileSync(`${dir}/${f}`).toString("base64"));
      r.diff.push(await d.evaluate(async ([a, c]) => {
        const px = async (s) => { const i = new Image(); i.src = s; await i.decode(); const cv = new OffscreenCanvas(i.width, i.height), x = cv.getContext("2d"); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
        const [A, C] = [await px(a), await px(c)]; let n = 0;
        for (let i = 0; i < A.length; i += 4) if (Math.max(Math.abs(A[i] - C[i]), Math.abs(A[i + 1] - C[i + 1]), Math.abs(A[i + 2] - C[i + 2])) > 40) n++;
        return +(100 * n / (A.length / 4)).toFixed(2);
      }, [a, c]));
    }
    await d.close(); console.log(`${w}x${h}`, JSON.stringify(r));
  }
  fs.writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 1)); await b.close();
})();
