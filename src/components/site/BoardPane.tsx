import Link from "next/link";
import { LINE_NAME, LINE_PLIES, LINE_SAN } from "@/content/site/line";
import { StaticBoard } from "./StaticBoard";

/** Phase 1: static. Phase 3 replaces the link with an in-place "Start engine". */
export function BoardPane() {
  return (
    <aside id="the-game" className="board-pane" aria-labelledby="board-title">
      <p className="kicker">Analysis board</p>
      <h2 id="board-title" className="sr-only">
        Analysis board
      </h2>
      <StaticBoard plies={LINE_PLIES} label="Position after 10…Bg4: the Deriv chapter, the current move." />
      <p className="note">{LINE_NAME}</p>
      <p className="claim-value">{LINE_SAN}</p>
      <p className="annotation">The career, annotated move by move. The latest move is Deriv.</p>
      <Link className="btn" href="/opening-preparation">
        Play the annotated career
      </Link>
    </aside>
  );
}
