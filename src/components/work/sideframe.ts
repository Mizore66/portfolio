// The second board's framings, apart from the scene so the section can read them before three.js is loaded.

type V3 = [number, number, number];
/** A framing: `sx`, `sy` place the look point on screen (0..1 across and down; .5 is the centre). */
export interface Frame { pos: V3; look: V3; fov: number; sx: number; sy: number }

/** side-a's framing; on phones the board sits at the top and the scoresheet runs below it (side-a-m). */
export const FRAME = {
  desk: { pos: [3.6, 9.2, 8.6], look: [-1.3, 0.3, -0.9], fov: 30, sx: 0.715, sy: 0.52 } as Frame,
  phone: { pos: [0, 13.6, 6.6], look: [-0.8, 0, -2.3], fov: 52, sx: 0.5, sy: 0.441 } as Frame,
};
