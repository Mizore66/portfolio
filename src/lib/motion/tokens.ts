/**
 * House motion (docs/upgrade/phase-1-visual-system.md §2.4).
 * One curve, one duration scale. site.css mirrors these as custom properties.
 */

/** A strong player placing a piece: lift without hurry, travel, a long soft settle. */
export const PLACE = [0.6, 0, 0.2, 1] as const;
export const PLACE_CSS = `cubic-bezier(${PLACE.join(", ")})`;
/** GSAP CustomEase path for the same curve. */
export const PLACE_PATH = `M0,0 C${PLACE[0]},${PLACE[1]} ${PLACE[2]},${PLACE[3]} 1,1`;

/** Milliseconds, ×1.5 from 120. */
export const T = {
  tap: 120,
  hover: 180,
  lift: 270,
  move: 400,
  reframe: 600,
  push: 900,
} as const;

/** Opening replay: one ply every 135 ms, 120 ms of travel each. 20 plies ≈ 2.9 s. */
export const OPENING = { stagger: 135, travel: T.tap, maxMs: 3000 } as const;

/** Cubic-bezier easing as a plain function, for render loops that cannot use CSS or GSAP. */
export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = sx(t) - x;
      const s = dx(t);
      if (Math.abs(d) < 1e-5 || Math.abs(s) < 1e-6) break;
      t -= d / s;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}

export const place = bezier(...PLACE);

/** True when the visitor asked the system for less motion. Safe on the server (false). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
