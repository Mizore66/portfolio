import type { Color, PieceType } from "@/lib/chess/replay";

/** Linocut silhouettes — original paths, ink on paper. */
const PATH: Record<PieceType, string> = {
  P: "M20 8c-3.4 0-6 2.8-6 6.2 0 2 1 3.7 2.6 4.8C13.4 21 11 24.2 11 28.2V31h18v-2.8c0-4-2.4-7.2-5.6-9.2 1.6-1.1 2.6-2.8 2.6-4.8C26 10.8 23.4 8 20 8z",
  N: "M8 33h24v-3.2c0-1.2-.4-2.4-1.4-3.2-2.2-1.8-4-3.8-4.2-7.2-.1-1.8.4-3.4 1.3-4.8 1.2 1 2.6 1.4 4.3.8-.8-2.6-1.2-5.2-3.6-7.2-1.2-1-2.8-1.5-4.6-1.2-2.4.4-4.2 1.8-5.8 3.6-1.8 2-3.8 3.2-6.2 3.4v3.4c2.2-.2 3.8-1 5.2-2.4.2 2.2-.6 4.2-2 6.2-1.6 2.2-2.8 4.4-2.8 7.2V33z",
  B: "M20 6c-1.8 0-3.2 1.2-3.8 2.8-2.8 1.6-4.7 4.6-4.7 8 0 3.2 1.6 5.8 3.8 7.6-.8.6-1.3 1.6-1.3 2.6 0 1.4.8 2.4 2 3v3h8v-3c1.2-.6 2-1.6 2-3 0-1-.5-2-1.3-2.6 2.2-1.8 3.8-4.4 3.8-7.6 0-3.4-1.9-6.4-4.7-8C23.2 7.2 21.8 6 20 6zm0 5.2c1.6 0 2.8 1.6 2.8 3.4S21.6 18 20 18s-2.8-1.6-2.8-3.4S18.4 11.2 20 11.2z",
  R: "M9 8v6h3v3H9v4h22v-4h-3v-3h3V8h-5v4h-4V8h-6v4h-4V8H9zm1 22v3h20v-3H10zM11 33h18v3H11v-3z",
  Q: "M8.5 12.5 7 10l4.2-.6L13 6l2.6 3.6L20 5.5l4.4 4.1L27 6l1.8 3.4L33 10l-1.5 2.5c.4 1.2.7 2.5.7 3.8 0 5.4-3.4 8.6-8.2 10.2V30h-8v-3.5C12.2 25 8.8 21.7 8.8 16.3c0-1.3.3-2.6.7-3.8zM12 33h16v3H12v-3z",
  K: "M18 5h4v3h3v3h-3v3h-4v-3h-3V8h3V5zm-7.5 12c0-3.2 2.2-5.8 5.4-7.2.6 1.4 1.8 2.4 4.1 2.4s3.5-1 4.1-2.4c3.2 1.4 5.4 4 5.4 7.2 0 4.6-3 7.8-7.5 9.4V31h-8v-4.6C13.5 24.8 10.5 21.6 10.5 17zM12 33h16v3H12v-3z",
};

export function NewspaperPiece({
  type,
  color,
}: {
  type: PieceType;
  color: Color;
}) {
  const white = color === "w";
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className="h-[86%] w-[86%] overflow-visible"
    >
      <path
        d={PATH[type]}
        fill={white ? "#f6eedc" : "#1a120c"}
        stroke="#1a120c"
        strokeWidth={white ? 1.7 : 1.15}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {white ? null : (
        <path
          d={PATH[type]}
          fill="none"
          stroke="#f6eedc"
          strokeWidth={0.45}
          strokeLinejoin="round"
          opacity={0.55}
          transform="translate(0 0.4)"
        />
      )}
    </svg>
  );
}
