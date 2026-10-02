// Round 4 of the mark (phase 6, step 3): J kept ("I like J, but it's not relating to the theme of the site"), with one tie
// to the site's theme. The site's seam is an engine's evaluation bar, White's share of it rising from the bottom, so
// the prompt's caret becomes that bar at the hero's 55.9% (10…Bg4, +0.64). Each returns an SVG string, 32-unit grid.
import { markJ } from "./mark3.js";
const PAPER = "#f3f3f1", INK = "#0d0d0c", MOVE = "#e8a33d", WALNUT = "#352820";
const box = (px, body, bg = INK) => `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 32 32">
  <defs><clipPath id="v${px}${bg.slice(1)}"><rect width="32" height="32" rx="6"/></clipPath></defs>
  <g clip-path="url(#v${px}${bg.slice(1)})"><rect width="32" height="32" fill="${bg}"/>${body}</g>
  <rect x=".5" y=".5" width="31" height="31" rx="5.6" fill="none" stroke="${INK}" stroke-opacity=".85" stroke-width="${32 / px}"/></svg>`;
const aq = (fill = PAPER) => `<text x="4.5" y="21.5" font-family="JetBrains Mono" font-weight="700" font-size="15" letter-spacing="-.6" fill="${fill}">aq</text>`;
const TOP = 8.6, H = 16, X = 22.6, W = 4, AT = 0.559;
/** the caret as an evaluation bar: the dark share above, White's 55.9% below */
// drawn as a gauge (an outline, White's share filled from the bottom), so it does not read as a letter
const bar = () => `<rect x="${X + .45}" y="${TOP + .45}" width="${W - .9}" height="${H - .9}" fill="none" stroke="${PAPER}" stroke-width=".9"/><rect x="${X}" y="${TOP + H * (1 - AT)}" width="${W}" height="${H * AT}" fill="${PAPER}"/>`;

export const markJ0 = markJ;
/** J1: the caret is the eval bar at +0.64. */
export const markJ1 = (px) => box(px, aq() + bar());
/** J2: the eval bar, and the move's amber tick where it splits. */
export const markJ2 = (px) => box(px, aq() + bar() + `<rect x="${X}" y="${TOP + H * (1 - AT) - .8}" width="${W}" height="1.6" fill="${MOVE}"/>`);
/** J3: J's amber caret, on a dark square of the gallery's walnut board. */
export const markJ3 = (px) => box(px, aq() + `<rect x="23.4" y="9.2" width="2.4" height="15" fill="${MOVE}"/>`, WALNUT);

export const MARKS4 = { j: markJ0, j1: markJ1, j2: markJ2, j3: markJ3 };
