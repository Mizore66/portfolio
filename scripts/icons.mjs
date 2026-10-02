// The site's mark, J1 (phase 6, step 3): "aq" in JetBrains Mono 700 and the prompt's caret drawn as an engine's
// evaluation bar at the hero's rest, White's 55.9% filled from the bottom (10…Bg4, +0.64). Writes the favicon files
// Next picks up from src/app: icon.svg, favicon.ico (16 and 32 px) and apple-icon.png (180 px, full bleed).
// The letters are outlines taken from src/app/fonts/JetBrainsMono.woff2 at 700, so the icon does not need the font.
// Run: node scripts/icons.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const PAPER = "#f3f3f1", INK = "#0d0d0c";
const AQ = ["M7.98 21.65Q6.75 21.65 6.02 20.94Q5.3 20.23 5.3 19.07Q5.3 18.25 5.69 17.65Q6.08 17.05 6.81 16.72Q7.55 16.4 8.58 16.4L10.34 16.4L10.34 15.86Q10.34 15.35 10 15.07Q9.66 14.78 9.02 14.78Q8.41 14.78 8.06 15.01Q7.7 15.25 7.67 15.7L5.66 15.7Q5.7 14.51 6.61 13.81Q7.52 13.1 9.05 13.1Q10.65 13.1 11.55 13.84Q12.45 14.59 12.45 15.94L12.45 21.5L10.41 21.5L10.41 19.88L10.07 19.88L10.44 19.64Q10.44 20.26 10.14 20.71Q9.84 21.16 9.29 21.4Q8.75 21.65 7.98 21.65ZM8.72 19.95Q9.47 19.95 9.9 19.58Q10.34 19.2 10.34 18.61L10.34 17.7L8.64 17.7Q8.03 17.7 7.69 18.01Q7.35 18.32 7.35 18.82Q7.35 19.33 7.71 19.64Q8.07 19.95 8.72 19.95Z", "M18.74 24.2L18.74 21.92L18.81 20.05L18.32 20.05L18.98 18.8Q18.98 20.12 18.32 20.89Q17.67 21.65 16.55 21.65Q15.35 21.65 14.6 20.78Q13.86 19.91 13.86 18.45L13.86 16.3Q13.86 14.84 14.6 13.97Q15.35 13.1 16.55 13.1Q17.67 13.1 18.32 13.87Q18.98 14.63 18.98 15.95L18.32 14.95L18.8 14.95L18.8 13.25L20.85 13.25L20.85 24.2ZM17.34 19.82Q18.02 19.82 18.38 19.43Q18.74 19.04 18.74 18.31L18.74 16.45Q18.74 15.71 18.38 15.32Q18.02 14.93 17.34 14.93Q16.7 14.93 16.34 15.29Q15.98 15.65 15.98 16.36L15.98 18.4Q15.98 19.09 16.34 19.45Q16.7 19.82 17.34 19.82Z"];
const TOP = 8.6, H = 16, X = 22.6, W = 4, AT = 0.559;
const body = `<path fill="${PAPER}" d="${AQ.join("")}"/>` +
  `<rect x="${X + .45}" y="${TOP + .45}" width="${W - .9}" height="${H - .9}" fill="none" stroke="${PAPER}" stroke-width=".9"/>` +
  `<rect x="${X}" y="${+(TOP + H * (1 - AT)).toFixed(3)}" width="${W}" height="${+(H * AT).toFixed(3)}" fill="${PAPER}"/>`;

/** the tab icon: a rounded ink square with a hairline edge */
const icon = (px = 32) => `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 32 32">` +
  `<rect width="32" height="32" rx="6" fill="${INK}"/>${body}` +
  `<rect x=".5" y=".5" width="31" height="31" rx="5.6" fill="none" stroke="${INK}" stroke-opacity=".85" stroke-width="${32 / px}"/></svg>`;
/** the home-screen icon: full bleed and square, since the phone draws its own corners */
const touch = (px) => `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 32 32">` +
  `<rect width="32" height="32" fill="${INK}"/>${body}</svg>`;

const png = (svg, px) => sharp(Buffer.from(svg), { density: 72 * px / 32 * 4 }).resize(px, px).png().toBuffer();

/** an .ico holding PNG images (Vista and later read these) */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(images.length, 4);
  let at = head.length;
  images.forEach(({ px, data }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(px % 256, e); head.writeUInt8(px % 256, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8); head.writeUInt32LE(at, e + 12); at += data.length;
  });
  return Buffer.concat([head, ...images.map((m) => m.data)]);
}

writeFileSync("src/app/icon.svg", icon() + "\n");
writeFileSync("src/app/favicon.ico", ico([{ px: 16, data: await png(icon(16), 16) }, { px: 32, data: await png(icon(32), 32) }]));
writeFileSync("src/app/apple-icon.png", await png(touch(180), 180));
