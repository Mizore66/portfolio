import { replayPlies } from "@/lib/game/plies";
import type { Ply } from "@/lib/opening/types";
import { DEFAULT_MOVE, GAME, type GameNode } from "./game";

export { replayPlies, sideToMoveAfter } from "@/lib/game/plies";

const BY_ID = new Map(GAME.map((n) => [n.id, n]));

export function isGameId(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

export function gameNode(id: string): GameNode {
  const n = BY_ID.get(id);
  if (!n) throw new Error(`Unknown move: ${id}`);
  return n;
}

/** Resolves ?move= to a node id; unknown or missing values fall back to the default (brief §2.4). */
export function resolveMove(v: unknown): string {
  return isGameId(v) ? v : DEFAULT_MOVE;
}

export function children(id: string): GameNode[] {
  return GAME.filter((n) => n.parent === id);
}

/** Root first. */
export function pathTo(id: string): GameNode[] {
  const out: GameNode[] = [];
  for (let n: GameNode | undefined = gameNode(id); n; n = n.parent ? gameNode(n.parent) : undefined) out.unshift(n);
  return out;
}

export function mainline(): GameNode[] {
  const out: GameNode[] = [];
  for (let n: GameNode | undefined = gameNode("start"); n; n = children(n.id).find((c) => c.type === "mainline")) {
    out.push(n);
  }
  return out;
}

export function uciToPly(uci: string): Ply {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4) };
}

/** Engine plies (castling is one king ply). */
export function enginePliesTo(id: string): Ply[] {
  return pathTo(id).flatMap((n) => (n.uci ? [uciToPly(n.uci)] : []));
}

export function replayPliesTo(id: string): Ply[] {
  return replayPlies(enginePliesTo(id));
}

/** "1. e4", "1…e5", "10. Nbxd2". */
export function moveLabel(n: GameNode): string {
  if (!n.color) return n.san;
  return n.color === "w" ? `${n.moveNumber}. ${n.san}` : `${n.moveNumber}…${n.san}`;
}

/** The mainline as a PGN-style string, e.g. "1. e4 e5 2. Nf3 …". */
export function mainlineSan(): string {
  return mainline()
    .filter((n) => n.uci)
    .map((n) => (n.color === "w" ? `${n.moveNumber}. ${n.san}` : n.san))
    .join(" ");
}
