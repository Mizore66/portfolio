// The share cards (phase 6, step 3, card B): each page at rest, captured from the site in the card's shape, with the
// chrome hidden and "anasqumhiyeh.dev" set in the top-right corner. One card per page: the home page, the Lab, and
// every project and role page. Writes public/og/<path>.jpg at 1200 × 630; the pages point at them (src/lib/cards.ts).
// Run against a running server: node scripts/cards.mjs [origin] [path ...]   (default http://localhost:3000, all pages)
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const origin = process.argv[2] ?? "http://localhost:3000";
// CARD_OUT writes elsewhere and CARD_FIT=0 leaves the piece where the page puts it (for comparisons)
const OUT = process.env.CARD_OUT ?? "public/og", FIT = process.env.CARD_FIT !== "0";
const W = 1200, H = 630, URL_LABEL = "anasqumhiyeh.dev";
// Project pages are laid out for screens taller than a card, so they are captured on a 1440 × 756 screen (the card's
// shape, where their type sets as on a laptop) and their piece is then set lower, below the name (fitPiece).
const scaleOf = (path) => (path.startsWith("/work/") ? 1.2 : 1);

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const open = async (s) => (await browser.newContext({ viewport: { width: Math.round(W * s), height: Math.round(H * s) }, deviceScaleFactor: 2 / s })).newPage();

let paths = process.argv.slice(3);
if (!paths.length) {
  const page = await open(1);
  await page.goto(`${origin}/`, { waitUntil: "load" });
  const links = await page.$$eval("a[href^='/work/'], a[href^='/roles/']", (as) => as.map((a) => new URL(a.href).pathname));
  paths = ["/", "/lab", "/colophon", ...new Set(links)];
  await page.context().close();
}

/** Lower the piece so it stands near the card's foot (the claim is to its left), then shrink it about its base only as
 *  much as it takes for its top to clear the name's meta line by `gap` px. */
async function fitPiece(page, gap, foot) {
  const hide = await page.addStyleTag({ content: "*, *::before, *::after { background: transparent !important; } .proj-dark, .proj-layer { visibility: hidden !important; }" });
  const alpha = await page.screenshot({ omitBackground: true, type: "png" });
  await hide.evaluate((el) => el.remove());
  const { data, info } = await sharp(alpha).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  let top = info.height, bottom = 0, left = info.width, right = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[y * info.width + x] > 96) {
    top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x);
  }
  const k = info.width / page.viewportSize().width; // image pixels per css pixel
  const meta = await page.evaluate(() => document.querySelector(".proj-layer .proj-meta").getBoundingClientRect().bottom);
  const [t, b, cx] = [top / k, bottom / k, (left + right) / 2 / k];
  const base = Math.max(b, page.viewportSize().height - foot), s = Math.min(1, (base - meta - gap) / (b - t));
  await page.evaluate(({ s, cx, b, dy }) => {
    Object.assign(document.querySelector(".proj-canvas").style, { transformOrigin: `${cx}px ${b}px`, transform: `translateY(${dy}px) scale(${s})` });
  }, { s, cx, b, dy: base - b });
  return s;
}

for (const path of paths) {
  const s = scaleOf(path), page = await open(s);
  await page.goto(`${origin}${path}`, { waitUntil: "load" }); // a first visit: a fresh context has no stored scroll or sound
  await page.waitForSelector(".site[data-seam-bound]");
  // the entrance: the hero's opening, the page's sweep and the Lab's tree all settle within about six seconds
  await page.waitForTimeout(path === "/lab" ? 9000 : 6500);
  await page.addStyleTag({ content: ".chrome, .cursor, .skip-resume, nextjs-portal { visibility: hidden !important; }" });
  const fit = FIT && path.startsWith("/work/") ? await fitPiece(page, 36 * s, 34 * s) : 1;
  await page.evaluate(({ label, s }) => {
    // the address is set in paper on the dark side of the seam and in graphite on the paper side
    const seam = parseFloat(getComputedStyle(document.querySelector(".site")).getPropertyValue("--seam")) / 100 * innerWidth;
    const p = document.createElement("p");
    p.textContent = label;
    Object.assign(p.style, { position: "fixed", right: `${52 * s}px`, top: `${44 * s}px`, margin: "0", zIndex: "99999", font: `${15 * s}px/1 var(--font-jetbrains), monospace` });
    document.body.append(p);
    p.style.color = p.getBoundingClientRect().left >= seam ? "#b9b5ad" : "#6d6860";
  }, { label: URL_LABEL, s });
  await page.waitForTimeout(300);
  const shot = await page.screenshot({ type: "png" });
  const file = `${OUT}${path === "/" ? "/home" : path}.jpg`;
  mkdirSync(dirname(file), { recursive: true });
  await sharp(shot).resize(W, H, { kernel: "lanczos3" }).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  console.log(file, fit < 1 ? `piece at ${fit.toFixed(2)}` : "");
  await page.context().close();
}
await browser.close();
