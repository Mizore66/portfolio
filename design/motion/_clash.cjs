// Text clash check: at each time, find visible text blocks that overlap each other or run off screen.
// Usage: node design/motion/_clash.cjs <name> "<t1,t2>" [query] [w] [h]
const { chromium } = require("playwright");
(async () => {
  const [name, times, q = "", w = 390, h = 844] = process.argv.slice(2);
  const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  await p.goto(`http://127.0.0.1:4173/design/motion/${name}.html?capture${q ? "&" + q : ""}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  let bad = 0;
  for (const t of times.split(",").map(Number)) {
    await p.evaluate((t) => window.__seek(t), t);
    const r = await p.evaluate(() => {
      const vis = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === "none" || s.visibility === "hidden" || +s.opacity < .05) return false; } return true; };
      const blocks = [...document.querySelectorAll("#ink *")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && vis(e))
        .map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const rs = [...rg.getClientRects()].filter((x) => x.width > 1 && x.height > 1);
          // clip each line box to its masking ancestors, so type still hidden in a mask does not count
          let clip = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 }; for (let x = e.parentElement; x && x.id !== "ink"; x = x.parentElement) if (getComputedStyle(x).overflow === "hidden") { const c = x.getBoundingClientRect(); clip = { l: Math.max(clip.l, c.left), t: Math.max(clip.t, c.top), r: Math.min(clip.r, c.right), b: Math.min(clip.b, c.bottom) }; }
          const boxes = rs.map((x) => ({ l: Math.max(x.left, clip.l), t: Math.max(x.top, clip.t), r: Math.min(x.right, clip.r), b: Math.min(x.bottom, clip.b) })).filter((x) => x.r - x.l > 1 && x.b - x.t > 1);
          return { e, txt: e.textContent.trim().slice(0, 28), boxes }; }).filter((x) => x.boxes.length);
      const out = [];
      for (const a of blocks) for (const x of a.boxes) if (x.l < -1 || x.r > innerWidth + 1) out.push(`off-screen: "${a.txt}" (${Math.round(x.l)}..${Math.round(x.r)})`);
      for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
        const A = blocks[i], B = blocks[j]; if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
        const hA = A.e.closest(".display, h1"), hB = B.e.closest(".display, h1"); if (hA && hA === hB) continue;
        for (const x of A.boxes) for (const y of B.boxes) { const ow = Math.min(x.r, y.r) - Math.max(x.l, y.l), oh = Math.min(x.b, y.b) - Math.max(x.t, y.t);
          if (ow > 2 && oh > 2) { out.push(`overlap: "${A.txt}" × "${B.txt}"`); break; } }
      }
      return [...new Set(out)];
    });
    bad += r.length; console.log(`${name}${q ? "?" + q : ""} @${t}s ${w}×${h}:`, r.length ? "\n  " + r.join("\n  ") : "clear");
  }
  await b.close(); process.exitCode = bad ? 1 : 0;
})();
