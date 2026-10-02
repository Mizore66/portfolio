import { readFileSync } from "node:fs";
import { replayPlies } from "@/lib/game/plies";
import type { Ply } from "@/lib/opening/types";

/** Test fixture: the annotated career game from content/content.json (v2 data, kept for the engine's tests). */
type Node = { id: string; parent: string | null; type: string; uci?: string };

export const GAME: readonly Node[] = JSON.parse(
  readFileSync(new URL("../../../content/content.json", import.meta.url), "utf8"),
).chess.game;

const byId = new Map(GAME.map((n) => [n.id, n]));

function pathTo(id: string): Node[] {
  const out: Node[] = [];
  for (let n = byId.get(id); n; n = n.parent ? byId.get(n.parent) : undefined) out.unshift(n);
  if (!out.length) throw new Error(`Unknown move: ${id}`);
  return out;
}

export function mainline(): Node[] {
  const out: Node[] = [];
  for (let n = byId.get("start"); n; n = GAME.find((c) => c.parent === n!.id && c.type === "mainline")) out.push(n);
  return out;
}

export function replayPliesTo(id: string): Ply[] {
  return replayPlies(pathTo(id).flatMap((n) => (n.uci ? [{ from: n.uci.slice(0, 2), to: n.uci.slice(2, 4) }] : [])));
}
