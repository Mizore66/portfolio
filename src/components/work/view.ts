// The Work room's views, apart from the scene so the section can read them before three.js is loaded.

type V3 = [number, number, number];
export interface View { pos: V3; look: V3; fov: number; /** where on screen the look point sits (0..1 across, or down on phones); .5 is the centre */ shift?: number }

/** work-c's framing; on phones (and upright tablets) the camera looks along the floor from the g-file side, so the pieces stack. */
export const VIEW = {
  desk: { pos: [1.5, 15.5, 13.5], look: [-0.4, 0, -0.2], fov: 38 } as View,
  phone: { pos: [17, 12.5, 3.2], look: [0.6, 0.4, -1.4], fov: 44 } as View,
  /** a tablet held upright: the phone's view, nearer, so the pieces fill a screen that is wider for its height */
  tablet: { pos: [14.6, 10.7, 2.5], look: [0.6, 0.4, -1.4], fov: 32 } as View,
};
