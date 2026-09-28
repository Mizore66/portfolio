// Gate 5 evidence for page changes: real-time recordings from the production server (next start -p 3100),
// trimmed to the change, plus a strip of frames every 250 ms. Usage: node design/build/_record.cjs
const { chromium } = require("playwright"); const { spawnSync } = require("child_process");
const fs = require("fs"); const path = require("path"); const os = require("os");
const FF = path.join(os.homedir(), "Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac"), OUT = path.join(__dirname, "nav"), BASE = "http://localhost:3100";
const CLIPS = [
  ["hero-work", "/", "Work", 1440, 900], ["work-hero-back", "/", "back:Work", 1440, 900], ["hero-roles", "/", "Roles", 1440, 900],
  ["hero-lab", "/", "Lab", 1440, 900], ["lab-contact", "/lab", "Contact", 1440, 900], ["hero-contact", "/", "Contact", 1440, 900],
  ["hero-work-m", "/", "Work", 390, 844], ["work-hero-back-m", "/", "back:Work", 390, 844], ["hero-lab-m", "/", "Lab", 390, 844], ["hero-roles-m", "/", "Roles", 390, 844],
];
(async () => {
  const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  for (const [name, from, action, w, h] of CLIPS) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rec-"));
    const c = await b.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: tmp, size: { width: w, height: h } } });
    await c.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
    const t0 = Date.now(), p = await c.newPage(), errs = [];
    p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
    await p.goto(BASE + from); await p.waitForTimeout(2500);
    const nav = (t) => p.locator(".chrome [data-layer=ink] .nav a", { hasText: t });
    if (action.startsWith("back:")) { await nav(action.slice(5)).click(); await p.waitForTimeout(2500); }
    const at = (Date.now() - t0) / 1000;
    if (action.startsWith("back:")) await p.goBack(); else await nav(action).click();
    await p.waitForTimeout(2700);
    const v = p.video(); await c.close(); const raw = await v.path();
    const clip = path.join(OUT, `${name}.webm`);
    spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(Math.max(0, at - 0.4)), "-t", "3.1", "-i", raw, "-c:v", "libvpx", "-b:v", "4M", clip]);
    const frames = path.join(tmp, "f%02d.png");
    spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(at), "-t", "2.25", "-i", raw, "-r", "4", frames]);
    fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify({ frames: fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort().map((f) => path.join(tmp, f)), errors: errs }));
    console.log(name, errs.length ? "ERRORS " + errs.join(" | ") : "ok");
  }
  await b.close();
})();
