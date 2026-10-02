// The site's mark, three ways (phase 6 comps: design/keyframes/mark-{a,b,c}.html). Each returns an SVG string for a
// square icon of `px` pixels. The seam stands at 55.9%, the hero's rest (10…Bg4, +0.64).
const PAPER = "#f3f3f1", INK = "#0d0d0c", AT = 0.559;

/** A: the seam itself, a square split paper and ink. */
export function markA(px) {
  const r = px * 0.18, x = px * AT;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">
    <defs><clipPath id="a${px}"><rect width="${px}" height="${px}" rx="${r}"/></clipPath></defs>
    <g clip-path="url(#a${px})"><rect width="${px}" height="${px}" fill="${PAPER}"/><rect x="${x}" width="${px - x}" height="${px}" fill="${INK}"/></g>
    <rect x=".5" y=".5" width="${px - 1}" height="${px - 1}" rx="${r}" fill="none" stroke="${INK}" stroke-opacity=".9"/></svg>`;
}

/** B: the monogram, AQ in the display face, inverting across the seam as the name does. */
export function markB(px) {
  const r = px * 0.18, x = px * AT, fs = px * 0.62;
  const text = (fill) => `<text x="${px * 0.5}" y="${px * 0.73}" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="${fs}" letter-spacing="${-fs * 0.06}" fill="${fill}">AQ</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">
    <defs><clipPath id="b${px}"><rect width="${px}" height="${px}" rx="${r}"/></clipPath><clipPath id="bd${px}"><rect x="${x}" width="${px - x}" height="${px}"/></clipPath></defs>
    <g clip-path="url(#b${px})"><rect width="${px}" height="${px}" fill="${PAPER}"/>${text(INK)}
      <g clip-path="url(#bd${px})"><rect width="${px}" height="${px}" fill="${INK}"/>${text(PAPER)}</g></g>
    <rect x=".5" y=".5" width="${px - 1}" height="${px - 1}" rx="${r}" fill="none" stroke="${INK}" stroke-opacity=".9"/></svg>`;
}

// the site's pawn: its lathe profile (src/lib/three/pieces.ts, PROFILES.P) and its head, a sphere of radius .16 at .68
const PAWN = [[0, 0], [.30, 0], [.30, .05], [.27, .08], [.27, .11], [.22, .14], [.13, .40], [.20, .46], [.20, .50], [.10, .54], [0, .54]];
function pawn(px, fill) {
  const h = 0.84, s = (px * 0.8) / h, cx = px / 2, base = px * 0.9; // 80% of the square tall, standing on 90%
  const pt = ([r, y], side) => `${(cx + side * r * s).toFixed(2)},${(base - y * s).toFixed(2)}`;
  const body = [...PAWN.map((p) => pt(p, -1)), ...PAWN.slice().reverse().map((p) => pt(p, 1))].join(" ");
  return `<polygon points="${body}" fill="${fill}"/><circle cx="${cx}" cy="${(base - 0.68 * s).toFixed(2)}" r="${(0.16 * s).toFixed(2)}" fill="${fill}"/>`;
}

/** C: the piece, the site's pawn standing on the seam, half of it inverted. */
export function markC(px) {
  const r = px * 0.18, x = px * AT;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">
    <defs><clipPath id="c${px}"><rect width="${px}" height="${px}" rx="${r}"/></clipPath><clipPath id="cd${px}"><rect x="${x}" width="${px - x}" height="${px}"/></clipPath></defs>
    <g clip-path="url(#c${px})"><rect width="${px}" height="${px}" fill="${PAPER}"/>${pawn(px, INK)}
      <g clip-path="url(#cd${px})"><rect width="${px}" height="${px}" fill="${INK}"/>${pawn(px, PAPER)}</g></g>
    <rect x=".5" y=".5" width="${px - 1}" height="${px - 1}" rx="${r}" fill="none" stroke="${INK}" stroke-opacity=".9"/></svg>`;
}

export const MARKS = { a: markA, b: markB, c: markC };
