"use client";

import Link from "next/link";
import { AnalysisBoard } from "@/components/game/AnalysisBoard";
import { useFrontGame } from "@/components/game/FrontGame";

/** The front page's board pane: the current position until the reader picks another, the engine only on request. */
export function BoardPane({ lineName, moves }: { lineName: string; moves: string[] }) {
  const { stop } = useFrontGame();
  return (
    <aside id="the-game" className="board-pane" aria-labelledby="board-title">
      <h2 id="board-title" className="board-title">
        Analysis board
      </h2>
      <p className="board-caption">
        <span className="claim-value">{stop.move}</span> {stop.chapter}
      </p>
      <AnalysisBoard basePlies={stop.plies} positionKey={stop.nodeId} label={`Position after ${stop.move}: ${stop.chapter}`} />
      <p className="note">{lineName}</p>
      <ol className="moves" aria-label="The mainline">
        {moves.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ol>
      <p className="annotation">The career, annotated move by move. The latest move is FaultLine; the deepest White move is Deriv.</p>
      <Link className="btn" href={`/opening-preparation?move=${stop.nodeId}`}>
        Read this move on the scoresheet
      </Link>
    </aside>
  );
}
