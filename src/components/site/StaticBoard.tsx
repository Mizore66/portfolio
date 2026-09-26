import { FILES, figurine, occupancy, positionAfter, type Color, type PieceType } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

/** Server-rendered board. No engine, no client JS. */
export function StaticBoard({ plies, label }: { plies: readonly Ply[]; label: string }) {
  const occ = occupancy(positionAfter(plies));
  const cells = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = `${FILES[file]}${rank}`;
      const x = file;
      const y = 8 - rank;
      const dark = (file + rank) % 2 === 1;
      cells.push(
        <rect key={square} data-square={square} className={dark ? "sq-dark" : "sq-light"} x={x} y={y} width={1} height={1} />,
      );
      const code = occ[square];
      if (code) {
        const color = code[0] as Color;
        const type = code[1] as PieceType;
        cells.push(
          <text key={`${square}-piece`} className={color === "w" ? "pc-white" : "pc-black"} x={x + 0.5} y={y + 0.8} textAnchor="middle">
            {`${figurine(type, color)}\uFE0E`}
          </text>,
        );
      }
    }
  }
  return (
    <svg className="board" viewBox="0 0 8 8" role="img" aria-label={label}>
      {cells}
    </svg>
  );
}
