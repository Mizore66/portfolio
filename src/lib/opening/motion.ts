/** Piece glide. BoardDiagram and Read-the-game share this so play never outruns CSS. */
export const GLIDE_MS = 380;
/** Per extra ply in a multi-ply step (castling). */
export const STAGGER_MS = 80;
/** Pause after the last staggered piece so play does not start the next ply mid-glide. */
export const PLAY_TAIL_MS = 160;

export const INK_MS = 200;
export const STROKE_DIM_MS = 180;
export const VIEW_TURN_MS = 160;
export const STAMP_MS = 150;
export const HOVER_PREVIEW_MS = 50;
/** Time on each depth so d1→d8 is visible, not a single paint at d8. */
export const DEPTH_PAINT_MS = 72;

export function playDelayMs(plyCount: number): number {
  const extra = Math.max(0, plyCount - 1) * STAGGER_MS;
  return GLIDE_MS + extra + PLAY_TAIL_MS;
}

export function depthPaintMs(reducedMotion: boolean): number {
  return reducedMotion ? 0 : DEPTH_PAINT_MS;
}
