// Gate 5 stills for step 4 (Work and project pages): the build at rest and scrolled, at 2x like the key frames.
// Needs the dev server (3000). Usage: node design/build/_stills.cjs  →  design/build/work/*.webp
const { chromium } = require("playwright"); const sharp = require("sharp"); const fs = require("fs"); const path = require("path");
const EXE = process.env.CHROMIUM || "/opt/pw-browsers/chromium", OUT = path.join(__dirname, "work");
const SHOTS = [
  ["work", "/work", 1440, 900, [0]], ["work-m", "/work", 390, 844, [0]],
  ["faultline", "/work/faultline", 1440, 900, [0, 0.55, 0.75, 1.2, 2, 3.2, 4.4]],
  ["gemini-teleportal", "/work/gemini-teleportal", 1440, 900, [0, 2]], ["circuitmindai", "/work/circuitmindai", 1440, 900, [0, 2]],
  ["faultline-m", "/work/faultline", 390, 844, [0, 0.75, 1.5, 3]], ["gemini-teleportal-m", "/work/gemini-teleportal", 390, 844, [0]], ["circuitmindai-m", "/work/circuitmindai", 390, 844, [0]],
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: fs.existsSync(EXE) ? EXE : undefined, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, url, w, h, at] of SHOTS) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }), errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
    await p.goto("http://localhost:3000" + url, { waitUntil: "load" });
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.waitForTimeout(6000);
    for (const s of at) {
      await p.evaluate((y) => window.scrollTo(0, y * innerHeight), s); await p.waitForTimeout(2500);
      const f = path.join(OUT, `${name}-${s}.webp`);
      await sharp(await p.screenshot({ timeout: 180000 })).webp({ quality: 82 }).toFile(f);
    }
    console.log(name, errs.length ? errs : "ok"); await p.close();
  }
  await b.close();
})();
