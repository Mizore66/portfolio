import { replayPlies } from "@/lib/game/plies";
import { positionAfter, type Piece } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

/** Client-safe: no content imports. The server builds `BoardData` in `data.ts`. */

export type BoardNode = {
  id: string;
  parent: string | null;
  uci?: string;
  /** "10…Bg4" */
  move: string;
  sym: string;
  title: string;
  /** Who or what the move stands for, e.g. "FaultLine". */
  chapter: string;
  evalCp: number | null;
  type: "mainline" | "variation" | "not-taken";
};

export type BoardData = {
  nodes: Record<string, BoardNode>;
  latest: string;
  /** Mainline ids, root first. The order ← → steps through. */
  mainline: string[];
};

const uciPly = (uci: string): Ply => ({ from: uci.slice(0, 2), to: uci.slice(2, 4) });

/** Engine plies from the start to `id` (castling is one king ply). */
export function enginePlies(data: BoardData, id: string): Ply[] {
  const out: Ply[] = [];
  for (let n: BoardNode | undefined = data.nodes[id]; n; n = n.parent ? data.nodes[n.parent] : undefined) {
    if (n.uci) out.unshift(uciPly(n.uci));
  }
  return out;
}

const posCache = new Map<string, Piece[]>();

/** Pieces after `id`, with stable ids across positions so moves can be animated. */
export function piecesAt(data: BoardData, id: string): Piece[] {
  let p = posCache.get(id);
  if (!p) {
    p = positionAfter(replayPlies(enginePlies(data, id)));
    posCache.set(id, p);
  }
  return p;
}

/** Positions after each engine ply from the start to `id`: the opening replay. */
export function replayTo(data: BoardData, id: string): Piece[][] {
  const plies = replayPlies(enginePlies(data, id));
  const out: Piece[][] = [positionAfter([])];
  // Castling adds a rook ply; fold it into the king's step so each engine ply is one frame.
  let acc: Ply[] = [];
  for (const ply of plies) {
    acc = [...acc, ply];
    const last = out[out.length - 1];
    const next = positionAfter(acc);
    const moved = next.filter((q, i) => q.square !== last[i].square || q.captured !== last[i].captured);
    const rookOnly = moved.length === 1 && moved[0].type === "R" && acc.length > 1 && isCastleRook(acc[acc.length - 2], ply);
    if (rookOnly) out[out.length - 1] = next;
    else out.push(next);
  }
  return out;
}

function isCastleRook(prev: Ply, ply: Ply): boolean {
  return (prev.from === "e1" || prev.from === "e8") && ply.from[1] === prev.from[1] && (ply.from[0] === "h" || ply.from[0] === "a");
}

/** Sibling moves at the parent of `id`: the alternatives that were on the board when this move was chosen. */
export function candidates(data: BoardData, id: string): BoardNode[] {
  const n = data.nodes[id];
  if (!n?.parent) return [];
  return Object.values(data.nodes).filter((c) => c.parent === n.parent && c.uci);
}

/** Side to move after `id`. */
export function sideToMove(data: BoardData, id: string): "w" | "b" {
  return enginePlies(data, id).length % 2 === 0 ? "w" : "b";
}
