import Link from "next/link";
import { LINE_NAME, LINE_PLIES, LINE_SAN } from "@/content/site/line";
import { StaticBoard } from "./StaticBoard";

/** "1. e4 e5 2. Nf3 Nc6" → ["1. e4 e5", "2. Nf3 Nc6"], so a move never breaks across lines. */
const MOVES = LINE_SAN.split(/ (?=\d+\. )/);

/** Phase 1: static. Phase 3 replaces the link with an in-place "Start engine". */
export function BoardPane() {
  return (
    <aside id="the-game" className="board-pane" aria-labelledby="board-title">
      <h2 id="board-title" className="board-title">
        Analysis board
      </h2>
      <StaticBoard plies={LINE_PLIES} label="Position after 10…Bg4: the Deriv chapter, the current move." />
      <p className="note">{LINE_NAME}</p>
      <ol className="moves" aria-label="Moves">
        {MOVES.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ol>
      <p className="annotation">The career, annotated move by move. The latest move is Deriv.</p>
      <Link className="btn" href="/opening-preparation">
        Play the annotated career
      </Link>
    </aside>
  );
}
