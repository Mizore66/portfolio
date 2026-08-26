import { NewspaperPiece } from "@/components/opening/NewspaperPiece";
import {
  FILES,
  positionAfter,
  squareBox,
  squareFile,
  squareRank,
} from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

/** Static 160px diagram for the scoresheet — never interactive. */
export function MiniBoard({
  plies,
  highlight,
  caption,
}: {
  plies: Ply[];
  highlight: [string, string] | null;
  caption: string;
}) {
  const pieces = positionAfter(plies).filter((p) => !p.captured);
  const squares = [];
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const sq = `${FILES[file]}${rank + 1}`;
      const dark = (file + rank) % 2 === 0;
      const committed = highlight && (highlight[0] === sq || highlight[1] === sq);
      squares.push(
        <div
          key={sq}
          className={cn(dark ? "board-sq-dark" : "board-sq-light")}
          style={
            committed ? { boxShadow: "inset 0 0 0 100px rgba(139, 36, 28, 0.38)" } : undefined
          }
        />,
      );
    }
  }

  return (
    <figure
      data-testid="inline-diagram"
      className="my-4 w-[160px] border-2 border-ink bg-paper p-2"
    >
      <div
        role="img"
        aria-label={caption}
        className="newspaper-board relative mx-auto h-[144px] w-[144px] border border-ink"
      >
        <div className="grid h-full w-full grid-cols-8 grid-rows-8">{squares}</div>
        {pieces.map((piece) => {
          const file = squareFile(piece.square);
          const rank = squareRank(piece.square);
          const box = squareBox(file, rank);
          return (
            <span
              key={piece.id}
              className="absolute flex items-center justify-center"
              style={{
                ...box,
                pointerEvents: "none",
              }}
            >
              <NewspaperPiece type={piece.type} color={piece.color} />
            </span>
          );
        })}
      </div>
      <figcaption className="mt-1 text-center font-display text-[10px] italic leading-tight text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}
