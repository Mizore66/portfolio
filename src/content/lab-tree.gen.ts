/**
 * The Lab's opening tree (motion.md §5): the kept engine's search from the Play position (1. e4 e5 2. Nf3 Nc6
 * 3. Bc4 Bc5). The principal variation is the engine's own, from a six-ply search (handcrafted PeSTO). Around it,
 * at every node, the engine's other candidates: each legal reply scored by a one-ply search with quiescence, kept
 * within 60 cp of the best (three near the root, two deeper). Regenerate by writing labTree() to lab-tree.json.
 */
import { clonePos, legalPlies, playPly, playUci, search, startPos, type EnginePos } from "@/lib/chess/engine";

export interface TreeNode { move: string; cp: number; children: TreeNode[] }
const LINE = ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5"];
const DEPTH = 9, NEAR = 60;

function grow(pos: EnginePos, d: number, pv: string[]): TreeNode[] {
  if (d >= DEPTH) return [];
  const scored = legalPlies(pos).map((p) => {
    const q = clonePos(pos); playPly(q, p);
    return { u: p.from + p.to, p, q, cp: search(clonePos(q), 1).score * pos.side }; // scores are White's; this is the mover's
  }).sort((a, b) => b.cp - a.cp);
  const main = scored.find((s) => s.u === pv[0]) ?? scored[0];
  const rest = scored.filter((s) => s !== main && s.cp >= main.cp - NEAR).slice(0, (d < 3 ? 3 : 2) - 1);
  return [main, ...rest].map((s, i) => ({ move: s.u, cp: s.cp, children: grow(s.q, d + 1, i === 0 ? pv.slice(1) : []) }));
}

export function labTree(): TreeNode {
  const pos = startPos();
  for (const u of LINE) playUci(pos, u);
  const pv = search(clonePos(pos), 6).pv;
  return { move: "", cp: 0, children: grow(pos, 0, pv) };
}
