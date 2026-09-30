// Round 3 of the mark (phase 6, step 3). The owner turned down the seam (round 1) and the chess icons (round 2: "a regular
// chess-themed icon rather than an icon one would use for their portfolio"), so these start from him: his initials, in
// the site's own faces, with chess at most a detail. Each returns an SVG string for a square icon, on a 32-unit grid.
const PAPER = "#f3f3f1", INK = "#0d0d0c", MOVE = "#e8a33d";
const box = (px, body, bg = PAPER) => `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 32 32">
  <defs><clipPath id="q${px}${bg.slice(1)}"><rect width="32" height="32" rx="6"/></clipPath></defs>
  <g clip-path="url(#q${px}${bg.slice(1)})"><rect width="32" height="32" fill="${bg}"/>${body}</g>
  <rect x=".5" y=".5" width="31" height="31" rx="5.6" fill="none" stroke="${INK}" stroke-opacity=".85" stroke-width="${32 / px}"/></svg>`;
const T = (s, { x = 16, y = 24, size = 20, fam = "Archivo", w = 900, ls = 0, fill = INK, anchor = "middle" } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${fam}" font-weight="${w}" font-size="${size}" letter-spacing="${ls}" fill="${fill}">${s}</text>`;

/** H: his initials, set tight in the display face, as the hero sets his name. */
export const markH = (px) => box(px, T("AQ", { y: 23.2, size: 19.5, ls: -1.4 }));
/** I: his initial and a full stop, in the voice of Contact's "11.", the stop in the move's amber. */
export const markI = (px) => box(px, T("A", { x: 13.4, y: 25, size: 25, ls: 0 }) + `<rect x="23" y="20.2" width="4.8" height="4.8" fill="${MOVE}"/>`);
/** J: his initials in the mono face with Contact's caret: an engineer's prompt, paper on ink. */
export const markJ = (px) => box(px, T("aq", { x: 4.5, y: 21.5, size: 15, fam: "JetBrains Mono", w: 700, ls: -.6, fill: PAPER, anchor: "start" }) + `<rect x="23.4" y="9.2" width="2.4" height="15" fill="${MOVE}"/>`, INK);
/** K: Q, his surname's initial, which a chess player also reads as the queen. */
export const markK = (px) => box(px, T("Q", { y: 25.4, size: 27 }));

export const MARKS3 = { h: markH, i: markI, j: markJ, k: markK };
