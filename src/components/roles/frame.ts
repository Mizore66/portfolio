// The hall's framings, apart from the scene so the Roles section can read them before three.js is loaded.

type V3 = [number, number, number];
/** `sx`, `sy`: where the look point sits on screen (0..1 across and down; .5 is the centre) */
export interface Frame { pos: V3; look: V3; fov: number; sx: number; sy: number }

/** roles-b's eye-level view along the row, Deriv's table in front; on phones the row is seen from higher up. */
export const FRAME = {
  desk: { pos: [9.6, 3.6, 4.8], look: [1.4, 0.1, -3.4], fov: 30, sx: 0.7, sy: 0.5 } as Frame,
  phone: { pos: [10.4, 5.2, 7.4], look: [0.4, 0.2, -2.6], fov: 50, sx: 0.34, sy: 0.42 } as Frame,
};
