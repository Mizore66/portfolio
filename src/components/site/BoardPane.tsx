"use client";

import Link from "next/link";
import { BoardBox } from "@/components/board/BoardBox";
import { MoveList, type LineMove } from "@/components/board/MoveList";
import { AnalysisBoard } from "@/components/game/AnalysisBoard";
import { useFrontGame } from "@/components/game/FrontGame";

/**
 * The board pane: the 3D board (its printed diagram until the 3D is ready),
 * the move list (← → step, Home and End jump), and the analysis board with
 * the engine, only on request.
 */
export function BoardPane({
  lineName,
  boxId,
  initialNode,
  opening = false,
  framing = "pane",
  diagram,
  line,
}: {
  lineName: string;
  boxId: string;
  initialNode: string;
  opening?: boolean;
  framing?: "pane" | "hero";
  /** The server-rendered diagram of `initialNode`: poster and no-WebGL fallback. */
  diagram: React.ReactNode;
  /** The mainline, from the server, so the move list is in the HTML before any JS. */
  line: LineMove[];
}) {
  const { stop } = useFrontGame();
  return (
    <aside id="the-game" className="board-pane" aria-labelledby="board-title">
      {/* The 3D board stays out of the pane's own scroll: a drei View is not clipped by scroll containers. */}
      <div className="board-pane-head">
        <h2 id="board-title" className="board-title">
          Analysis board
        </h2>
        <p className="board-caption">
          <span className="claim-value">{stop.move}</span> {stop.chapter}
        </p>
        <BoardBox id={boxId} framing={framing} opening={opening} initialNode={initialNode}>
          {diagram}
        </BoardBox>
      </div>
      <div className="board-pane-body" data-lenis-prevent>
      <AnalysisBoard basePlies={stop.plies} positionKey={stop.nodeId} label={`Position after ${stop.move}: ${stop.chapter}`} linked />
      <p className="note">{lineName}</p>
      <MoveList line={line} />
      <p className="annotation">The career, annotated move by move. The latest move is FaultLine; the deepest White move is Deriv.</p>
      <Link className="btn" href={`/opening-preparation?move=${stop.nodeId}`}>
        Read this move on the scoresheet
      </Link>
      </div>
    </aside>
  );
}
