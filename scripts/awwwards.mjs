// The Awwwards submission images (phase 6, step 6): 1600 × 1200 px, the size Awwwards asks for, for the main
// thumbnail and every extra image. Each is the live site at that window size, drawn at 2× and scaled down, with the
// custom cursor and the frame readout hidden and the nav left as a visitor sees it. The last one sets three phone
// screens side by side on the seam. Writes design/submission/awwwards/NN-name.jpg.
// Run against a running production server: node scripts/awwwards.mjs [origin] [NN ...]   (default http://localhost:3100,
// every image; NN picks images by number, e.g. 12)
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const origin = process.argv[2] ?? "http://localhost:3100", ONLY = process.argv.slice(3), want = (n) => !ONLY.length || ONLY.includes(n), OUT = "design/submission/awwwards", W = 1600, H = 1200;
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const HIDE = ".cursor, .frame-meter, nextjs-portal { visibility: hidden !important; }";

async function open(size = { width: W, height: H }, scale = 2, seen = true) {
  const page = await (await browser.newContext({ viewport: size, deviceScaleFactor: scale })).newPage();
  if (seen) await page.addInitScript(() => sessionStorage.setItem("hero-opening-seen", "1"));
  return page;
}
async function go(page, path, wait) {
  await page.goto(`${origin}${path}`, { waitUntil: "load" });
  await page.waitForSelector(".site[data-seam-bound]");
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(wait);
}
/** a scroll that the page's own scroll handlers see, then time to settle */
async function scrollTo(page, y, wait = 3500) {
  await page.evaluate((y) => { window.scrollTo(0, y); window.dispatchEvent(new Event("scroll")); }, y);
  await page.waitForTimeout(wait);
}
const topOf = (page, sel, at = 0) => page.evaluate(([sel, at]) => { const s = document.querySelector(sel); return s.getBoundingClientRect().top + scrollY + Math.max(0, s.offsetHeight - innerHeight) * at; }, [sel, at]);
async function save(page, name) {
  await sharp(await page.screenshot()).resize(W, H).jpeg({ quality: 92, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
  console.log(name);
}

// 1. the thumbnail: the hero at rest, the opening's last frame
if (want("01")) { const p = await open(undefined, 2, false); await go(p, "/", 11000); await save(p, "01-hero"); await p.context().close(); }
// 2. the opening under way: the game on the board, the seam moving
if (want("02")) { const p = await open(undefined, 2, false); await go(p, "/", 0);
  await p.waitForFunction(() => document.querySelector(".hero")?.dataset.intro === "play"); await p.waitForTimeout(3600); await save(p, "02-opening"); await p.context().close(); }
// 3-5. the one page's sections, each at rest after its entrance
if (want("03")) { const p = await open(); await go(p, "/", 1500);
  for (const [id, name] of [["roles", "03-roles"], ["work", "04-work"], ["archive", "05-other-projects"]]) { await scrollTo(p, await topOf(p, `#${id}`)); await save(p, name); }
  await p.context().close(); }
// 6-8. the Lab: its opening (the match and the search tree), a chapter, and Play
if (want("06")) { const p = await open(); await go(p, "/lab", 10000); await save(p, "06-lab");
  await scrollTo(p, await topOf(p, '[data-ch="4"]', 0.7), 6000); await save(p, "07-lab-referee");
  await scrollTo(p, await topOf(p, '[data-ch="7"]'), 4000); await save(p, "08-play");
  await p.context().close(); }
// 9-11. a project, a role, the colophon
if (want("09")) for (const [path, name, wait] of [["/work/faultline", "09-project", 7000], ["/roles/deriv", "10-role", 7000], ["/colophon", "11-colophon", 5000]]) {
  const p = await open(); await go(p, path, wait); await save(p, name); await p.context().close();
}
// 12. phones: the hero, a project and Play, three screens on the seam (paper to its left, the gallery's black to its right), at 55.9%
if (want("12")) {
  const shots = [];
  for (const [path, sel] of [["/", null], ["/work/faultline", null], ["/lab", '[data-ch="7"]']]) {
    const p = await open({ width: 390, height: 844 }, 3, sel !== null || path !== "/");
    await go(p, path, path === "/" && !sel ? 11000 : 9000);
    if (sel) await scrollTo(p, await topOf(p, sel), 4000);
    const w = 400, h = Math.round(844 * w / 390), r = 44;
    const round = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
    // a hairline edge, mid grey, so a paper screen reads on the paper side and a black one on the black
    const edge = Buffer.from(`<svg width="${w}" height="${h}"><rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="${r - 0.75}" ry="${r - 0.75}" fill="none" stroke="#8c877e" stroke-opacity="0.55" stroke-width="1.5"/></svg>`);
    shots.push(await sharp(await p.screenshot()).resize(w, h).composite([{ input: round, blend: "dest-in" }, { input: edge }]).png().toBuffer());
    await p.context().close();
  }
  const seam = Math.round(W * 0.559), h = Math.round(844 * 400 / 390), top = Math.round((H - h) / 2), gap = 72, x0 = Math.round((W - 3 * 400 - 2 * gap) / 2);
  const bg = Buffer.from(`<svg width="${W}" height="${H}"><rect width="${seam}" height="${H}" fill="#f3f3f1"/><rect x="${seam}" width="${W - seam}" height="${H}" fill="#09090a"/></svg>`);
  await sharp(bg).composite(shots.map((input, i) => ({ input, left: x0 + i * (400 + gap), top }))).jpeg({ quality: 92, mozjpeg: true }).toFile(`${OUT}/12-phones.jpg`);
  console.log("12-phones");
}
await browser.close();
