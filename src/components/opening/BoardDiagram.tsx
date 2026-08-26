"use client";

import { useEffect, useRef, useState } from "react";
import {
  animationPlan,
  FILES,
  figurine,
  positionAfter,
  squareFile,
  squareRank,
  type AnimatedPiece,
} from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

const DURATION_MS = 380;

export function BoardDiagram({
  plies,
  highlight,
  caption,
}: {
  plies: Ply[];
  highlight: [string, string] | null;
  caption: string;
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

    // Discrete clicks flush React effects before paint, so a same-tick setState
    // never gives CSS a "from" frame. A macrotask applies the destination after
    // the current positions have been painted.
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
      const markedSq = highlight && (highlight[0] === sq || highlight[1] === sq);
      squares.push(
        <div
          key={sq}
          className={dark ? "board-sq-dark" : "board-sq-light"}
          style={markedSq ? { boxShadow: "inset 0 0 0 100px rgba(162, 50, 42, 0.28)" } : undefined}
        />,
      );
    }
  }

  return (
    <figure className="px-4 pt-4">
      <div className="mx-auto max-w-[320px]">
        <div className="flex">
          <div className="flex w-4 flex-col-reverse justify-around py-0.5 font-mono text-[9px] text-faded">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="leading-none">
                {i + 1}
              </span>
            ))}
          </div>
          <div
            role="img"
            aria-label={caption}
            className="relative aspect-square w-full border-2 border-ink"
          >
            <div className="grid h-full w-full grid-cols-8 grid-rows-8">{squares}</div>
            {pieces.map((piece) => {
              const file = squareFile(piece.square);
              const rank = squareRank(piece.square);
              return (
                <span
                  key={piece.id}
                  data-piece-id={piece.id}
                  className="absolute flex items-center justify-center text-[clamp(1.15rem,4.6vw,1.85rem)] leading-none"
                  style={{
                    left: 0,
                    top: 0,
                    width: "12.5%",
                    height: "12.5%",
                    transform: `translate(${file * 100}%, ${(7 - rank) * 100}%)`,
                    color: piece.color === "w" ? "#1e3a72" : "#1a120c",
                    opacity: piece.captured ? 0 : 1,
                    transition: `transform ${DURATION_MS}ms ease, opacity ${DURATION_MS}ms ease`,
                    transitionDelay: `${piece.delay}ms`,
                    pointerEvents: "none",
                    zIndex: piece.captured ? 0 : 1,
                  }}
                >
                  {figurine(piece.type, piece.color)}
                </span>
              );
            })}
          </div>
        </div>
        <div className="ml-4 flex justify-around font-mono text-[9px] text-faded">
          {FILES.split("").map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </div>
      <figcaption className="mt-2 px-1 text-center font-display text-[13px] italic text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}
