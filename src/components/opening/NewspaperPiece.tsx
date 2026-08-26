import type { ReactElement } from "react";
import type { Color, PieceType } from "@/lib/chess/replay";

/**
 * Newspaper diagram pieces after Colin M.L. Burnett (Wikipedia, public domain).
 * Paper fill for white, charcoal for black, ink outline on both.
 * Knights are horses.
 */
const INK = "#1a120c";
const PAPER = "#f6eedc";
const CHARCOAL = "#3a322c";

type Paths = { fill: string; stroke: string };

function Pawn({ fill, stroke }: Paths) {
  return (
    <path
      d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5h23c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  );
}

function Rook({ fill, stroke }: Paths) {
  return (
    <g fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5H12.5zM12 36v-4h21v4H12z" strokeLinecap="butt" />
      <path d="M14 29.5v-13h17v13H14z" strokeLinecap="butt" strokeLinejoin="miter" />
      <path d="M14 16.5 11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" strokeLinecap="butt" />
      <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23" fill="none" strokeLinejoin="miter" />
    </g>
  );
}

function Knight({ fill, stroke }: Paths) {
  return (
    <g fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c10.5.5 16.5 8 16 29H15c0-9 10-6.5 8-21" fill={fill} />
      <path
        d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"
        fill={fill}
      />
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill={stroke} stroke={stroke} />
      <path
        d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"
        fill={stroke}
        stroke={stroke}
      />
    </g>
  );
}

function Bishop({ fill, stroke }: Paths) {
  return (
    <g fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <g fill={fill} strokeLinecap="butt">
        <path d="M9 36C12.39 35.03 19.11 36.43 22.5 34C25.89 36.43 32.61 35.03 36 36C36 36 37.65 36.54 39 38C38.32 38.97 37.35 38.99 36 38.5C32.61 37.53 25.89 38.96 22.5 37.54C19.11 38.96 12.39 37.53 9 38.5C7.646 38.97 6.678 38.97 6 38C7.354 36.11 9 36 9 36z" />
        <path d="M15 32C17.5 34.5 27.5 34.5 30 32C30.5 30.5 30 30 30 30C30 27.5 27.5 26 27.5 26C33 24.5 33.5 14.5 22.5 10.5C11.5 14.5 12 24.5 17.5 26C17.5 26 15 27.5 15 30C15 30 14.5 30.5 15 32z" />
        <circle cx={22.5} cy={8} r={2.5} />
      </g>
      <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" strokeLinejoin="miter" />
    </g>
  );
}

function Queen({ fill, stroke }: Paths) {
  return (
    <g fill={fill} fillRule="evenodd" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={6} cy={12} r={2} />
      <circle cx={14} cy={9} r={2} />
      <circle cx={22.5} cy={8} r={2} />
      <circle cx={31} cy={9} r={2} />
      <circle cx={39} cy={12} r={2} />
      <path
        d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"
        strokeLinecap="butt"
      />
      <path
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
        strokeLinecap="butt"
      />
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
    </g>
  );
}

function King({ fill, stroke }: Paths) {
  return (
    <g fill="none" fillRule="evenodd" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
      <path
        d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
        fill={fill}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <path
        d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10v7z"
        fill={fill}
      />
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
    </g>
  );
}

const BODY: Record<PieceType, (props: Paths) => ReactElement> = {
  P: Pawn,
  R: Rook,
  N: Knight,
  B: Bishop,
  Q: Queen,
  K: King,
};

export function NewspaperPiece({
  type,
  color,
}: {
  type: PieceType;
  color: Color;
}) {
  const white = color === "w";
  const Body = BODY[type];
  return (
    <svg
      viewBox="0 0 45 45"
      aria-hidden
      data-piece-type={type}
      data-piece-color={color}
      className="h-[88%] w-[88%] overflow-visible"
    >
      <Body fill={white ? PAPER : CHARCOAL} stroke={INK} />
    </svg>
  );
}
