"use client";

import { useMemo, useState } from "react";
import { NewspaperPiece } from "@/components/opening/NewspaperPiece";
import { FILES, occupancyFen, positionAfter, squareBox, squareFile, squareRank } from "@/lib/chess/replay";
import { collectPlies, getNode } from "@/lib/opening/tree";
import { cn } from "@/lib/utils";

export function ChessLinePreview({ nodeIds }: { nodeIds: string[] }) {
  const [id, setId] = useState(nodeIds.includes("d4") ? "d4" : (nodeIds[0] ?? "start"));
  const node = getNode(id);
  const plies = useMemo(() => collectPlies(id), [id]);
  const pieces = useMemo(() => positionAfter(plies).map((piece) => ({ ...piece, delay: 0 })), [plies]);
  const highlight = node.hl;

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
    <div className="border-2 border-ink p-4">
      <label>
        Preview position
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {nodeIds.map((nodeId) => (
            <option key={nodeId} value={nodeId}>
              {nodeId}
            </option>
          ))}
        </select>
      </label>
      <figure className="mt-3" aria-describedby="admin-chess-occ">
        <p className="sr-only" id="admin-chess-occ">
          Occupancy {occupancyFen(pieces)}. {node.cap}.
        </p>
        <div className="board-size-wrap max-w-xs">
          <div className="border-2 border-ink" style={{ width: "100%", aspectRatio: "1" }}>
            <div role="img" aria-label={node.cap} className="newspaper-board relative h-full w-full" id="admin-chess-board">
              <div className="grid h-full w-full grid-cols-8 grid-rows-8">{squares}</div>
              {pieces.map((piece) => {
                const file = squareFile(piece.square);
                const rank = squareRank(piece.square);
                const box = squareBox(file, rank);
                return (
                  <span
                    key={piece.id}
                    className="absolute flex items-center justify-center"
                    style={{ ...box, pointerEvents: "none", zIndex: 2 }}
                  >
                    <span className="flex size-[84%] items-center justify-center">
                      <NewspaperPiece type={piece.type} color={piece.color} />
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <figcaption className="mt-2 font-display text-[14px] italic text-ink">{node.cap}</figcaption>
      </figure>
    </div>
  );
}
