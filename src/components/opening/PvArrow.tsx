import { squareFile, squareRank } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

export function PvArrow({ ply }: { ply: Ply }) {
  const x1 = (squareFile(ply.from) + 0.5) * 12.5;
  const y1 = (7 - squareRank(ply.from) + 0.5) * 12.5;
  const x2 = (squareFile(ply.to) + 0.5) * 12.5;
  const y2 = (7 - squareRank(ply.to) + 0.5) * 12.5;
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      data-testid="pv-arrow"
    >
      <defs>
        <marker id="pv-head" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0 0 L5 2.5 L0 5 z" fill="#8b241c" />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#8b241c"
        strokeWidth={1.6}
        strokeLinecap="round"
        markerEnd="url(#pv-head)"
        opacity={0.92}
      />
    </svg>
  );
}
