/**
 * The Advantage seam, shared by every page (design/motion.md: "every change of page is the seam moving").
 * The live position is two CSS variables on `.site`: --seam (the white share, as a percentage of the
 * viewport) and --seam-o (half the tilt's run, in px). Layers clip themselves with them (shell.css).
 * On phones the seam is horizontal: white on top.
 */

export interface Room {
  /** White share of the viewport at rest, 0..1: desktop, and phone (horizontal seam). */
  at: number;
  atPhone: number;
  /** The dark side's colour. */
  dark: string;
}

const HERO = 0.5 + 0.5 * Math.tanh((0.00368208 * 64) / 2); // share(+0.64), 55.9%

/** Each route's resting seam, from its approved key frame. `null`: résumé mode, which has no seam. */
export function roomFor(path: string): Room | null {
  if (path === "/resume") return null;
  if (path === "/work") return { at: 0.015, atPhone: 0, dark: "var(--gallery)" }; // work-c: a 22 px paper edge
  if (path === "/roles") return { at: 1, atPhone: 1, dark: "var(--gallery)" }; // the paper floods: the day hall
  if (path === "/lab") return { at: 0.305, atPhone: 0.305, dark: "var(--search)" }; // lab-a: the match score
  return { at: HERO, atPhone: HERO, dark: "var(--gallery)" }; // hero, contact, project and role pages
}

export const PHONE = "(max-width: 600px)";
export const isPhone = () => typeof window !== "undefined" && window.matchMedia(PHONE).matches;
export const restFor = (path: string) => { const r = roomFor(path); return r ? (isPhone() ? r.atPhone : r.at) : null; };

let el: HTMLElement | null = null;
export const seam = { at: HERO, tilt: 0 };

export function bindSeam(node: HTMLElement | null, at: number) { el = node; seam.at = at; seam.tilt = 0; }

export function setSeam(at: number, tilt = 0) {
  seam.at = at; seam.tilt = tilt;
  if (!el) return;
  const phone = isPhone(), run = phone ? innerWidth : innerHeight;
  el.style.setProperty("--seam", `${at * 100}%`);
  el.style.setProperty("--seam-o", `${Math.tan((tilt * Math.PI) / 180) * (run / 2)}px`);
}

type Pt = [number, number];

/** The two sides as polygons in viewport px (as design/motion/_kit.js liveSeam). */
export function sides(at: number, tilt: number, W: number, H: number, phone: boolean): { light: Pt[]; dark: Pt[] } {
  if (phone) {
    const y = at * H, o = Math.tan((tilt * Math.PI) / 180) * (W / 2);
    return {
      light: [[0, -400], [W, -400], [W, y + o], [0, y - o]],
      dark: [[0, y - o], [W, y + o], [W, H + 400], [0, H + 400]],
    };
  }
  const x = at * W, o = Math.tan((tilt * Math.PI) / 180) * (H / 2);
  return {
    light: [[-400, 0], [x - o, 0], [x + o, H], [-400, H]],
    dark: [[x - o, 0], [W + 400, 0], [W + 400, H], [x + o, H]],
  };
}

/** The intersection of two convex polygons (Sutherland-Hodgman). */
export function intersect(subject: Pt[], clip: Pt[]): Pt[] {
  let out = subject;
  // orientation of the clip polygon, so "inside" works for either winding
  let area = 0;
  for (let i = 0; i < clip.length; i++) { const a = clip[i], b = clip[(i + 1) % clip.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sgn = Math.sign(area) || 1;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length], input = out;
    const side = (p: Pt) => sgn * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
    out = [];
    for (let j = 0; j < input.length; j++) {
      const p = input[j], q = input[(j + 1) % input.length], sp = side(p), sq = side(q);
      if (sp >= 0) out.push(p);
      if ((sp >= 0) !== (sq >= 0)) { const k = sp / (sp - sq); out.push([p[0] + k * (q[0] - p[0]), p[1] + k * (q[1] - p[1])]); }
    }
  }
  return out;
}

export const css = (poly: Pt[], dx = 0, dy = 0) =>
  poly.length < 3 ? "polygon(0 0, 0 0, 0 0)" : `polygon(${poly.map(([x, y]) => `${(x - dx).toFixed(1)}px ${(y - dy).toFixed(1)}px`).join(", ")})`;

/**
 * Every line of type is drawn twice: in ink, and in paper clipped to the dark side. The ink copy is the
 * accessible one, so where a line rests wholly on the dark side its ink copy takes its paper twin's
 * colour: what assistive tech and audits read is what is seen. Undone (`on` false) whenever the seam is
 * about to move over the type, and reapplied where it comes to rest.
 */
export function restColours(on: boolean) {
  if (on && document.querySelector(".site[data-seam-moving]")) return;
  const phone = isPhone(), cut = seam.at * (phone ? innerHeight : innerWidth);
  document.querySelectorAll<HTMLElement>("[data-layer=ink]").forEach((ink) => {
    const inv = ink.parentElement?.querySelector<HTMLElement>(":scope > [data-layer=inv]");
    if (!inv) return;
    const a = ink.querySelectorAll<HTMLElement>("[data-vt-line]"), b = inv.querySelectorAll<HTMLElement>("[data-vt-line]");
    a.forEach((e, i) => {
      e.style.color = "";
      if (!on || !b[i]) return;
      const r = e.getBoundingClientRect();
      if (r.width && (phone ? r.top >= cut : r.left >= cut)) e.style.color = getComputedStyle(b[i]).color;
    });
  });
}
