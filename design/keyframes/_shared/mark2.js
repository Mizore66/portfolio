// Round 2 of the mark (phase 6, step 3; the owner turned down the seam squares A-C). Each returns an SVG string for a
// square icon of `px` pixels, drawn on a 32-unit grid.
const PAPER = "#f3f3f1", INK = "#0d0d0c", MOVE = "#e8a33d";
const box = (px, body, bg = PAPER, edge = true) => `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 32 32">
  <defs><clipPath id="r${px}${bg.slice(1)}"><rect width="32" height="32" rx="6"/></clipPath></defs>
  <g clip-path="url(#r${px}${bg.slice(1)})"><rect width="32" height="32" fill="${bg}"/>${body}</g>
  ${edge ? `<rect x=".5" y=".5" width="31" height="31" rx="5.6" fill="none" stroke="${INK}" stroke-opacity=".85" stroke-width="${32 / px}"/>` : ""}</svg>`;

/** D: ⩲, the annotation for "White is slightly better", which is what the hero's +0.64 means. */
export const markD = (px) => box(px, `<rect x="14.4" y="4.5" width="3.2" height="13" fill="${INK}"/><rect x="9.5" y="9.4" width="13" height="3.2" fill="${INK}"/>
  <rect x="7" y="20" width="18" height="3" fill="${INK}"/><rect x="7" y="25.5" width="18" height="3" fill="${INK}"/>`);

// the site's knight: its head in profile (src/lib/three/pieces.ts, knightShape) on its base (PROFILES.N), facing +x
const HEAD = [["M", .22, .20], ["C", .24, .28, .14, .36, .16, .44], ["C", .18, .52, .24, .54, .30, .56], ["C", .36, .57, .44, .58, .44, .64],
  ["C", .46, .68, .46, .73, .42, .76], ["C", .36, .82, .28, .88, .22, .96], ["C", .18, 1.02, .16, 1.08, .14, 1.12], ["L", .10, 1.24],
  ["C", .06, 1.18, .03, 1.14, .02, 1.10], ["C", -.06, 1.10, -.16, 1.06, -.22, .98], ["C", -.28, .88, -.32, .74, -.30, .62],
  ["C", -.28, .46, -.30, .30, -.27, .20], ["Z"]];
const BASE = [[0, 0], [.33, 0], [.33, .06], [.29, .10], [.29, .13], [.24, .17], [.22, .22], [0, .22]];
function knight(fill) {
  const s = 27 / 1.24, cx = 15.6, b = 29.5; // 27 units tall, standing on 29.5, facing left as a diagram's knights do
  const X = (x) => (cx - x * s).toFixed(2), Y = (y) => (b - y * s).toFixed(2);
  const head = HEAD.map(([c, ...v]) => c + (v.length ? " " + v.map((n, i) => (i % 2 ? Y(n) : X(n))).join(" ") : "")).join(" ");
  const base = [...BASE.map(([r, y]) => `${X(-r)},${Y(y)}`), ...BASE.slice().reverse().map(([r, y]) => `${X(r)},${Y(y)}`)].join(" ");
  return `<path d="${head}" fill="${fill}"/><polygon points="${base}" fill="${fill}"/>`;
}
/** E: the site's knight, mirrored to face left, paper on ink: the piece every chess reader knows at a glance. */
export const markE = (px) => box(px, knight(PAPER), INK);

/** F: a corner of the board, the square the move landed on lit in the move's amber. */
export const markF = (px) => box(px, `<rect width="16" height="16" fill="${PAPER}"/><rect x="16" width="16" height="16" fill="${INK}"/>
  <rect y="16" width="16" height="16" fill="${INK}"/><rect x="16" y="16" width="16" height="16" fill="${MOVE}"/>`);

/** G: !!, the annotation for a brilliant move, in the display face. */
export const markG = (px) => box(px, `<text x="16" y="27" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="30" letter-spacing="-1.5" fill="${INK}">!!</text>`, MOVE);

export const MARKS2 = { d: markD, e: markE, f: markF, g: markG };
