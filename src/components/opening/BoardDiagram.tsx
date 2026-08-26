"use client";

import { useEffect, useRef, useState } from "react";
import { EvalBar } from "@/components/opening/EvalBar";
import { NewspaperPiece } from "@/components/opening/NewspaperPiece";
import {
  animationPlan,
  FILES,
  positionAfter,
  squareFile,
  squareRank,
  type AnimatedPiece,
} from "@/lib/chess/replay";
import { GLIDE_MS } from "@/lib/opening/motion";
import type { Ply } from "@/lib/opening/types";

export function BoardDiagram({
  plies,
  highlight,
  preview,
  caption,
  evalCp,
  evalLabel,
}: {
  plies: Ply[];
  highlight: [string, string] | null;
  preview?: [string, string] | null;
  caption: string;
  evalCp: number | null;
  evalLabel: string;
}) {
  const prevPlies = useRef<Ply[] | null>(null);
  const [pieces, setPieces] = useState<AnimatedPiece[]>(() =>
    positionAfter(plies).map((p) => ({ ...p, delay: 0 })),
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = prevPlies.current;

    if (reduced || from === null) {
      prevPlies.current = plies;
      setPieces(positionAfter(plies).map((p) => ({ ...p, delay: 0 })));
      return;
    }

    const plan = animationPlan(from, plies);
    prevPlies.current = plies;

    const timer = window.setTimeout(() => {
      setPieces(plan);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [plies]);

  const squares = [];
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const sq = `${FILES[file]}${rank + 1}`;
      const dark = (file + rank) % 2 === 0;
      const committed = highlight && (highlight[0] === sq || highlight[1] === sq);
      const ghost = !committed && preview && (preview[0] === sq || preview[1] === sq);
      squares.push(
        <div
          key={sq}
          data-sq={sq}
          data-hl={committed ? "true" : ghost ? "preview" : undefined}
          className={dark ? "board-sq-dark" : "board-sq-light"}
          style={
            committed
              ? { boxShadow: "inset 0 0 0 100px rgba(139, 36, 28, 0.38)" }
              : ghost
                ? { boxShadow: "inset 0 0 0 100px rgba(30, 58, 114, 0.32)" }
                : undefined
          }
        />,
      );
    }
  }

  return (
    <figure className="px-3 pt-3" data-testid="board-diagram">
      <div className="flex items-stretch gap-0">
        <EvalBar value={evalCp ?? 0} label={evalLabel} />
        <div className="min-w-0 flex-1">
          <div className="flex">
            <div className="flex w-3.5 flex-col-reverse justify-around py-0.5 font-mono text-[9px] text-faded">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="leading-none">
                  {i + 1}
                </span>
              ))}
            </div>
            <div
              role="img"
              aria-label={caption}
              className="newspaper-board relative aspect-square w-full border-2 border-ink"
            >
              <div className="grid h-full w-full grid-cols-8 grid-rows-8">{squares}</div>
              {pieces.map((piece) => {
                const file = squareFile(piece.square);
                const rank = squareRank(piece.square);
                return (
                  <span
                    key={piece.id}
                    data-piece-id={piece.id}
                    className="absolute flex items-center justify-center"
                    style={{
                      left: 0,
                      top: 0,
                      width: "12.5%",
                      height: "12.5%",
                      transform: `translate(${file * 100}%, ${(7 - rank) * 100}%)`,
                      opacity: piece.captured ? 0 : 1,
                      transition: `transform ${GLIDE_MS}ms ease, opacity ${GLIDE_MS}ms ease`,
                      transitionDelay: `${piece.delay}ms`,
                      pointerEvents: "none",
                      zIndex: piece.captured ? 0 : 1,
                    }}
                  >
                    <NewspaperPiece type={piece.type} color={piece.color} />
                  </span>
                );
              })}
            </div>
          </div>
          <div className="ml-3.5 flex justify-around font-mono text-[9px] text-faded">
            {FILES.split("").map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-1.5 px-1 text-center font-display text-[13px] italic text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}
