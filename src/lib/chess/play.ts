import { applyPly, positionAfter, squareFile, type Color, type Piece } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

export function opposite(side: Color): Color {
  return side === "w" ? "b" : "w";
}

export function sideAfter(start: Color, extraCount: number): Color {
  return extraCount % 2 === 0 ? start : opposite(start);
}

/** Castling is one king ply in the generator; the scoresheet animates the rook too. */
export function expandIfCastle(pieces: readonly Piece[], ply: Ply): Ply[] {
  const mover = pieces.find((p) => !p.captured && p.square === ply.from);
  if (!mover || mover.type !== "K") return [ply];
  const df = squareFile(ply.to) - squareFile(ply.from);
  if (Math.abs(df) !== 2) return [ply];
  const rank = ply.from[1];
  if (df > 0) return [ply, { from: `h${rank}`, to: `f${rank}` }];
  return [ply, { from: `a${rank}`, to: `d${rank}` }];
}

export function expandPlayLine(book: Ply[], extra: Ply[]): Ply[] {
  let pieces = positionAfter(book);
  const out = [...book];
  for (const ply of extra) {
    const exp = expandIfCastle(pieces, ply);
    for (const step of exp) {
      pieces = applyPly(pieces, step);
      out.push(step);
    }
  }
  return out;
}

