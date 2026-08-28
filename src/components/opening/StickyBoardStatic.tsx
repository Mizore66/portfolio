import { EvalBar } from "@/components/opening/EvalBar";
import { NewspaperPiece } from "@/components/opening/NewspaperPiece";
import { PvArrow } from "@/components/opening/PvArrow";
import { BROADSHEET } from "@/content/opening";
import {
  FILES,
  positionAfter,
  squareBox,
  squareFile,
  squareRank,
} from "@/lib/chess/replay";
import { GLIDE_MS } from "@/lib/opening/motion";
import {
  collectPlies,
  FLAGSHIP_ID,
  getNode,
  nextMainlineBook,
  sideToMove,
  stepMainline,
} from "@/lib/opening/tree";
import { cn } from "@/lib/utils";

/** Server HTML for the flagship diagram — OpeningApp does not hydrate this node. */
export function StickyBoardStatic() {
  const node = getNode(FLAGSHIP_ID);
  const plies = collectPlies(FLAGSHIP_ID);
  const pieces = positionAfter(plies).map((p) => ({ ...p, delay: 0 }));
  const arrow = nextMainlineBook(FLAGSHIP_ID)?.plies[0] ?? null;
  const evalLabel = `${node.eval >= 0 ? "+" : ""}${node.eval.toFixed(2)}`;
  const playSide = sideToMove(FLAGSHIP_ID);
  const highlight = node.hl;
  const canStepPrev = stepMainline(FLAGSHIP_ID, -1) !== FLAGSHIP_ID;
  const canStepNext = stepMainline(FLAGSHIP_ID, 1) !== FLAGSHIP_ID;

  const squares = [];
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const sq = `${FILES[file]}${rank + 1}`;
      const dark = (file + rank) % 2 === 0;
      const committed = highlight && (highlight[0] === sq || highlight[1] === sq);
      squares.push(
        <div
          key={sq}
          data-sq={sq}
          data-hl={committed ? "true" : undefined}
          className={cn(dark ? "board-sq-dark" : "board-sq-light")}
          style={
            committed
              ? { boxShadow: "inset 0 0 0 100px rgba(139, 36, 28, 0.38), inset 0 0 0 1px #1a120c" }
              : undefined
          }
        />,
      );
    }
  }

  return (
    <figure data-testid="board-diagram">
      <div className="flex items-stretch gap-2">
        <div className="flex w-10 shrink-0 self-stretch">
          <EvalBar value={node.eval} label={evalLabel} />
        </div>
        <div className="flex min-w-0 flex-1 items-start">
          <div
            className="flex w-4 shrink-0 flex-col-reverse items-end justify-around pr-1 font-mono text-[10px] leading-none text-faded"
            data-testid="board-ranks"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="leading-none">
                {i + 1}
              </span>
            ))}
          </div>
          <div className="board-size-wrap min-w-0 flex-1">
            <div className="flex flex-col" style={{ width: "100%" }}>
              <div className="border-2 border-ink" style={{ width: "100%", aspectRatio: "1" }}>
                <div
                  role="img"
                  aria-label={node.cap}
                  data-testid="board-plane"
                  data-play-side={playSide}
                  className="newspaper-board relative h-full w-full cursor-pointer"
                  tabIndex={0}
                  id="play-board"
                >
                  <div className="grid h-full w-full grid-cols-8 grid-rows-8">{squares}</div>
                  {arrow ? <PvArrow ply={arrow} /> : null}
                  {pieces.map((piece) => {
                    const file = squareFile(piece.square);
                    const rank = squareRank(piece.square);
                    const box = squareBox(file, rank);
                    return (
                      <span
                        key={piece.id}
                        data-piece-id={piece.id}
                        className="absolute flex items-center justify-center"
                        style={{
                          ...box,
                          opacity: 1,
                          transitionProperty: "left, top, opacity",
                          transitionDuration: `${GLIDE_MS}ms`,
                          transitionTimingFunction: "ease",
                          transitionDelay: "0ms",
                          pointerEvents: "none",
                          zIndex: 2,
                        }}
                      >
                        <span className="flex size-[84%] items-center justify-center">
                          <NewspaperPiece type={piece.type} color={piece.color} />
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="board-files" data-testid="board-files">
                {FILES.split("").map((f) => (
                  <span key={f} className="block w-full text-center">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption
        data-testid="board-caption"
        className="flex items-center justify-center gap-2 px-1"
      >
        <button
          type="button"
          data-testid="board-step-prev"
          aria-label={BROADSHEET.stepPrev}
          disabled={!canStepPrev}
          className="hit-target board-step inline-flex min-w-8 items-center justify-center border-2 border-ink px-2 font-mono text-[16px] leading-none text-ink disabled:opacity-40"
        >
          ‹
        </button>
        <span className="min-w-0 text-center font-display text-[12px] italic text-ink">{node.cap}</span>
        <button
          type="button"
          data-testid="board-step-next"
          aria-label={BROADSHEET.stepNext}
          disabled={!canStepNext}
          className="hit-target board-step inline-flex min-w-8 items-center justify-center border-2 border-ink px-2 font-mono text-[16px] leading-none text-ink disabled:opacity-40"
        >
          ›
        </button>
      </figcaption>
    </figure>
  );
}
