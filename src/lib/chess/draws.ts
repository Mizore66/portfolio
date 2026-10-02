/**
 * The draws Play ends a game on besides stalemate (the owner, 2026-10-01): the same position a third time, fifty moves
 * by each side with no pawn moved and nothing taken, and material neither side can mate with. All end the game at
 * once, as on Lichess and Chess.com, rather than waiting for a claim. A mate on the move that would draw still wins
 * (FIDE 9.3), so callers check `gameOutcome` first.
 *
 * Game rules only: the engine's search is unchanged (its play is the measured, published one).
 */
import { legalPlies, playPly, rowsOf, startPos, type EnginePos } from "./engine";
import type { Ply } from "@/lib/opening/types";

export type DrawBy = "repetition" | "fifty" | "material";

const at = (rows: string[], sq: string) => rows[8 - +sq[1]]["abcdefgh".indexOf(sq[0])];
const alg = (i: number) => "abcdefgh"[i % 8] + (Math.floor(i / 8) + 1);

/**
 * The same position: the same pieces on the same squares, the same side to move, the same castling rights, and the
 * same en passant capture, counted only when one can be made (FIDE 9.2.3).
 */
function key(pos: EnginePos): string {
  const rows = rowsOf(pos);
  let ep = "-";
  if (pos.ep >= 0) {
    const sq = alg(pos.ep), r = rows.split("/");
    if (legalPlies(pos).some((p) => p.to === sq && at(r, p.from).toUpperCase() === "P")) ep = sq;
  }
  return `${rows} ${pos.side} ${pos.castle} ${ep}`;
}

/**
 * Neither side can mate by any series of legal moves (FIDE 5.2.2), the cases Lichess ends a game on: king against
 * king, a lone bishop or knight against a king, and bishops only, every one on squares of one colour. Two knights
 * against a king can still mate if the defender helps, so play goes on.
 */
export function deadMaterial(pos: EnginePos): boolean {
  const rows = rowsOf(pos).split("/"), minors: { piece: string; dark: boolean }[] = [];
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const c = rows[r][f], t = c.toUpperCase();
    if (c === "." || t === "K") continue;
    if (t !== "B" && t !== "N") return false; // a pawn, rook or queen can mate
    minors.push({ piece: t, dark: (f + (7 - r)) % 2 === 0 });
  }
  if (minors.length <= 1) return true;
  return minors.every((m) => m.piece === "B" && m.dark === minors[0].dark);
}

/** The game from the start position: drawn by repetition, the fifty-move rule or dead material after its last ply, or null. */
export function drawBy(plies: readonly Ply[]): DrawBy | null {
  const pos = startPos(), seen = new Map<string, number>();
  let quiet = 0, k = key(pos);
  seen.set(k, 1);
  for (const p of plies) {
    const rows = rowsOf(pos).split("/"), mover = at(rows, p.from).toUpperCase(), taken = at(rows, p.to) !== ".";
    if (!playPly(pos, p)) break;
    quiet = mover === "P" || taken ? 0 : quiet + 1; // an en passant capture is a pawn move
    k = key(pos);
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  if ((seen.get(k) ?? 0) >= 3) return "repetition";
  if (quiet >= 100) return "fifty";
  if (deadMaterial(pos)) return "material";
  return null;
}
