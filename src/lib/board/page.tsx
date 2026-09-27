import type { LineMove } from "@/components/board/MoveList";
import type { BoardStop } from "@/components/game/FrontGame";
import { StaticBoard } from "@/components/site/StaticBoard";
import { careerPoints } from "@/content/site/career";
import { LATEST_MOVE } from "@/content/site/game";
import { enginePliesTo, gameNode, mainline, moveLabel, replayPliesTo } from "@/content/site/game-tree";
import { LINE_ECO, LINE_NAME } from "@/content/site/line";

/** Server-side inputs every page with a board pane shares. */
export function boardStops(): Record<string, BoardStop> {
  const stops: Record<string, BoardStop> = {};
  for (const p of careerPoints()) {
    stops[p.nodeId] = { nodeId: p.nodeId, plies: enginePliesTo(p.nodeId), move: p.move, title: gameNode(p.nodeId).title, chapter: p.label };
  }
  return stops;
}

export function mainlineMoves(): LineMove[] {
  const chapters = new Map(careerPoints().map((p) => [p.nodeId, p.label]));
  return mainline()
    .filter((n) => n.uci)
    .map((n) => ({ id: n.id, move: moveLabel(n), chapter: chapters.get(n.id) ?? n.title }));
}

export const LINE_TITLE = `${LINE_NAME} (${LINE_ECO})`;

/** The printed diagram of a move: the board box's poster and its no-WebGL fallback. */
export function BoardDiagram({ node = LATEST_MOVE }: { node?: string }) {
  return <StaticBoard plies={replayPliesTo(node)} label="" />;
}
