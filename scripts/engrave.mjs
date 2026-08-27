#!/usr/bin/env node
/**
 * Desaturate a patent engraving, duotone to ink, flatten onto sheet cream,
 * emit WebP/AVIF ≤200KB at ~1400px.

Prompt (generation-side, for future rasters):
"19th-century US patent drawing, dense technical engraving, fine ink
linework and crosshatched shading, [STAGED MACHINE], side elevation plus
one cross-section, generous clear margins around the machinery,
components separated by open space, plain white background, NO text,
NO numbers, NO labels, no paper texture, no wax seal, no borders."
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const INK = { r: 26, g: 18, b: 12 };
const CREAM = { r: 246, g: 238, b: 220 };
const WIDTH = 1400;
const HEIGHT = 1050;
const MAX_BYTES = 200 * 1024;
const OUT_DIR = path.join(process.cwd(), "public/figures");

const JOBS = [
  ["fig-nc6-tube-raw.png", "fig-nc6"],
  ["fig-e4-foundry-raw.png", "fig-e4"],
  ["fig-nf3-mill-raw.png", "fig-nf3"],
  ["fig-bc4-console-raw.png", "fig-bc4"],
  ["fig-oo-governor-raw.png", "fig-oo"],
  ["fig-d4-press-raw.png", "fig-d4"],
  ["fig-circuitmind-inspection-raw.png", "fig-circuitmind"],
  ["fig-mirrorfi-vault-raw.png", "fig-mirrorfi"],
  ["fig-risk-underwriting-raw.png", "fig-risk"],
  ["fig-leads-sorting-raw.png", "fig-leads"],
  ["fig-veridian-plant-raw.png", "fig-veridian"],
];

function duotone(gray, width, height) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const g = gray[i];
    const t = Math.max(0, Math.min(1, (248 - g) / 248));
    const inkAmt = t <= 0 ? 0 : Math.min(255, Math.round(t ** 0.82 * 255));
    rgba[i * 4] = INK.r;
    rgba[i * 4 + 1] = INK.g;
    rgba[i * 4 + 2] = INK.b;
    rgba[i * 4 + 3] = inkAmt;
  }
  return rgba;
}

async function encodeUnderCap(rgba, width, height, destBase) {
  const inkPng = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
  const flattened = await sharp(inkPng).flatten({ background: CREAM }).png().toBuffer();
  let quality = 78;
  const webpPath = `${destBase}.webp`;
  const avifPath = `${destBase}.avif`;
  let webpSize = Infinity;
  while (quality >= 42) {
    await sharp(flattened).webp({ quality, effort: 5 }).toFile(webpPath);
    webpSize = fs.statSync(webpPath).size;
    if (webpSize <= MAX_BYTES) break;
    quality -= 8;
  }
  let avifSize = 0;
  try {
    await sharp(flattened).avif({ quality: 45, effort: 4 }).toFile(avifPath);
    avifSize = fs.statSync(avifPath).size;
  } catch {
    return { webpPath, webpSize, avifPath: "", avifSize: 0, quality };
  }
  return { webpPath, webpSize, avifPath, avifSize, quality };
}

async function processOne(srcName, destName) {
  const src = path.join("/opt/cursor/artifacts/assets", srcName);
  if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
  const { data, info } = await sharp(src)
    .rotate()
    .resize(WIDTH, HEIGHT, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .greyscale()
    .linear(1.18, -12)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = duotone(data, info.width, info.height);
  const destBase = path.join(OUT_DIR, destName);
  const result = await encodeUnderCap(rgba, info.width, info.height, destBase);
  console.log(
    `${destName}: ${info.width}×${info.height} webp=${result.webpSize} q=${result.quality}` +
      (result.avifPath ? ` avif=${result.avifSize}` : ""),
  );
  if (result.webpSize > MAX_BYTES && result.avifSize > MAX_BYTES) {
    throw new Error(`${destName} exceeds ${MAX_BYTES} (webp ${result.webpSize} avif ${result.avifSize})`);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [src, dest] of JOBS) {
  await processOne(src, dest);
}
