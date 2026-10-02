// The Awwwards submission film (phase 6, step 6): 1600 × 1200, 30 fps. The development server runs the site in slow
// motion (slowmo.ts: GSAP, the page-change clocks, and WAAPI through CDP), every painted frame is taken with its time,
// and the film is put back together at the site's own speed, one frame per 1/30 s of animation time, so a busy
// machine cannot make it stutter. The scroll is driven on the same slowed clock.
// node scripts/awwwards-video.mjs [origin] [slow]   (default http://localhost:3000, 4) → design/submission/awwwards/film.mp4
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const origin = process.argv[2] ?? "http://localhost:3000", N = +(process.argv[3] ?? 4), FPS = 30, W = 1600, H = 1200;
const OUT = "design/submission/awwwards", TMP = "/tmp/aw-film";
rmSync(TMP, { recursive: true, force: true }); mkdirSync(`${TMP}/raw`, { recursive: true }); mkdirSync(`${TMP}/out`, { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.addInitScript((n) => { sessionStorage.setItem("slowmo", String(n)); }, N);
const cdp = await ctx.newCDPSession(p);
await cdp.send("Animation.enable"); await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / N });

const frames = []; let rec = false, t0 = 0;
cdp.on("Page.screencastFrame", async (f) => {
  cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  if (!rec) return;
  const file = `${TMP}/raw/${String(frames.length).padStart(6, "0")}.jpg`;
  writeFileSync(file, Buffer.from(f.data, "base64")); frames.push({ t: (f.metadata.timestamp * 1000 - t0) / N / 1000, file });
});
const wait = (s) => p.waitForTimeout(s * 1000 * N); // seconds of the site's own time
// a glide to a section on the slowed clock: the seam's ease, 1.2 s of site time
const glide = (sel, s = 1.4) => p.evaluate(([sel, s, n]) => new Promise((done) => {
  const e = document.querySelector(sel), a = scrollY, z = e.getBoundingClientRect().top + scrollY, t = performance.now();
  const ease = (u) => 1 - Math.pow(1 - u, 4);
  const step = () => { const u = Math.min(1, (performance.now() - t) / (s * 1000 * n)); scrollTo(0, a + (z - a) * ease(u)); dispatchEvent(new Event("scroll")); if (u < 1) requestAnimationFrame(step); else done(); };
  requestAnimationFrame(step);
}), [sel, s, N]);

await p.goto(`${origin}/`, { waitUntil: "load" });
await p.addStyleTag({ content: ".cursor, .frame-meter, nextjs-portal { visibility: hidden !important; display: none !important; }" });
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
await p.waitForFunction(() => document.querySelector(".hero")?.dataset.intro === "play", null, { timeout: 120000 });
rec = true; t0 = Date.now();
await wait(10);                                     // the opening, to the name at rest
await glide("#roles"); await wait(2.6);             // Roles: the hall
await glide("#work"); await wait(2.6);              // Work: the gallery
await glide("#archive"); await wait(2.2);           // Other Projects
await glide('#lab [data-ch="7"]'); await wait(2.4); // Play
await glide("#work", 1.6); await wait(1.2);
await p.locator(".piece a", { hasText: "FaultLine" }).click(); // into FaultLine: the camera steps down, the seam sweeps
await wait(4.2);
rec = false; await cdp.send("Page.stopScreencast"); await b.close();

// one frame per 1/30 s of site time: the latest frame painted by then
const end = frames.at(-1).t; let j = 0, n = 0;
for (let t = 0; t <= end; t += 1 / FPS) { while (j + 1 < frames.length && frames[j + 1].t <= t) j++; copyFileSync(frames[j].file, `${TMP}/out/${String(n++).padStart(6, "0")}.jpg`); }
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${TMP}/out/%06d.jpg`, "-vf", `scale=${W}:${H}:flags=lanczos,format=yuv420p`, "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-movflags", "+faststart", `${OUT}/film.mp4`]);
console.log(`${frames.length} frames painted over ${end.toFixed(1)} s of site time (${(frames.length / end).toFixed(1)} a second); film: ${n} frames at ${FPS} fps`);
