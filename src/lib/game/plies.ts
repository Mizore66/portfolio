import { expandIfCastle } from "@/lib/chess/play";
import { positionAfter, type Color } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

/** Kept free of content imports so client components can use it cheaply. */

/** Replay plies for the piece list (castling adds the rook ply). */
export function replayPlies(engine: readonly Ply[]): Ply[] {
  const out: Ply[] = [];
  for (const ply of engine) out.push(...expandIfCastle(positionAfter(out), ply));
  return out;
}

export function sideToMoveAfter(engineCount: number): Color {
  return engineCount % 2 === 0 ? "w" : "b";
}
