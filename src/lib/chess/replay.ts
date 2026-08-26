import type { Ply } from "@/lib/opening/types";

export type Color = "w" | "b";
export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";

export type Piece = {
  id: string;
  type: PieceType;
  color: Color;
  square: string;
  captured: boolean;
};

export type AnimatedPiece = Piece & { delay: number };

export const FILES = "abcdefgh";

const BACK_RANK: PieceType[] = ["R", "N", "B", "Q", "K", "B", "N", "R"];

const WHITE_FIG: Record<PieceType, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
};

const BLACK_FIG: Record<PieceType, string> = {
  K: "♚",
  Q: "♛",
  R: "♜",
  B: "♝",
  N: "♞",
  P: "♟",
};

export function squareFile(sq: string): number {
  return FILES.indexOf(sq[0]);
}

export function squareRank(sq: string): number {
  return Number(sq[1]) - 1;
}

export function figurine(type: PieceType, color: Color): string {
  return color === "w" ? WHITE_FIG[type] : BLACK_FIG[type];
}

export function initialPieces(): Piece[] {
  const pieces: Piece[] = [];
  for (let f = 0; f < 8; f++) {
    const file = FILES[f];
    pieces.push({
      id: `w${BACK_RANK[f]}${file}1`,
      type: BACK_RANK[f],
      color: "w",
      square: `${file}1`,
      captured: false,
    });
    pieces.push({
      id: `wP${file}2`,
      type: "P",
      color: "w",
      square: `${file}2`,
      captured: false,
    });
    pieces.push({
      id: `bP${file}7`,
      type: "P",
      color: "b",
      square: `${file}7`,
      captured: false,
    });
    pieces.push({
      id: `b${BACK_RANK[f]}${file}8`,
      type: BACK_RANK[f],
      color: "b",
      square: `${file}8`,
      captured: false,
    });
  }
  return pieces;
}

export function applyPly(pieces: Piece[], ply: Ply): Piece[] {
  const next = pieces.map((p) => ({ ...p }));
  const mover = next.find((p) => !p.captured && p.square === ply.from);
  if (!mover) {
    throw new Error(`Illegal ply: no piece on ${ply.from} (to ${ply.to})`);
  }
  const victim = next.find((p) => !p.captured && p.square === ply.to);
  if (victim) {
    victim.captured = true;
  } else if (mover.type === "P" && squareFile(ply.from) !== squareFile(ply.to)) {
    const ep = `${ply.to[0]}${ply.from[1]}`;
    const behind = next.find((p) => !p.captured && p.square === ep && p.type === "P");
    if (behind) behind.captured = true;
  }
  mover.square = ply.to;
  if (mover.type === "P") {
    const rank = squareRank(ply.to);
    if (rank === 7 || rank === 0) mover.type = "Q";
  }
  return next;
}

export function positionAfter(plies: readonly Ply[]): Piece[] {
  return plies.reduce(applyPly, initialPieces());
}

export function occupancy(pieces: Piece[]): Record<string, string> {
  const o: Record<string, string> = {};
  for (const p of pieces) {
    if (!p.captured) o[p.square] = `${p.color}${p.type}`;
  }
  return o;
}

function samePly(a: Ply, b: Ply): boolean {
  return a.from === b.from && a.to === b.to;
}

function prefixLength(a: readonly Ply[], b: readonly Ply[]): number {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && samePly(a[i], b[i])) i += 1;
  return i;
}

/**
 * Map each piece to a stagger delay so multi-ply jumps animate in ply order.
 * Rewind first (captures reappear), then forward.
 */
export function animationPlan(
  fromPlies: readonly Ply[],
  toPlies: readonly Ply[],
): AnimatedPiece[] {
  const prefix = prefixLength(fromPlies, toPlies);
  const rewind = fromPlies.slice(prefix).reverse();
  const forward = toPlies.slice(prefix);
  const delays = new Map<string, number>();
  let step = 0;

  let pieces = positionAfter(fromPlies);

  for (const ply of rewind) {
    const mover = pieces.find((p) => !p.captured && p.square === ply.to);
    if (mover) {
      delays.set(mover.id, step * 80);
      mover.square = ply.from;
    }
    const victim = pieces.find((p) => p.captured && p.square === ply.to);
    if (victim) {
      delays.set(victim.id, step * 80);
      victim.captured = false;
    }
    step += 1;
  }

  for (const ply of forward) {
    pieces = applyPly(pieces, ply);
    const mover = pieces.find((p) => !p.captured && p.square === ply.to);
    if (mover) delays.set(mover.id, step * 80);
    const victim = pieces.find((p) => p.captured && p.square === ply.to);
    if (victim) delays.set(victim.id, step * 80);
    step += 1;
  }

  return positionAfter(toPlies).map((p) => ({
    ...p,
    delay: delays.get(p.id) ?? 0,
  }));
}
