import { careerPoints } from "@/content/site/career";
import { CAREER_EVALS } from "@/content/site/career-evals";
import { GAME, LATEST_MOVE } from "@/content/site/game";
import { mainline, moveLabel } from "@/content/site/game-tree";
import type { BoardData, BoardNode } from "./position";

/**
 * The game tree reduced to what the client boards need: ids, parents, one
 * UCI move each, labels and evals. Built on the server from the single source
 * (`game.ts`, `career-evals.ts`) so no content ships twice.
 */
export function boardData(): BoardData {
  const chapters = new Map(careerPoints().map((p) => [p.nodeId, p.label]));
  const evals = CAREER_EVALS as Record<string, number | undefined>;
  const nodes: Record<string, BoardNode> = {};
  for (const n of GAME) {
    nodes[n.id] = {
      id: n.id,
      parent: n.parent,
      uci: n.uci,
      move: moveLabel(n),
      sym: n.sym,
      title: n.title,
      chapter: chapters.get(n.id) ?? n.title,
      evalCp: evals[n.id] ?? null,
      type: n.type,
    };
  }
  return { nodes, latest: LATEST_MOVE, mainline: mainline().map((n) => n.id) };
}
