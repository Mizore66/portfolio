/**
 * Club-strength alpha-beta (~2200). Mailbox 64, make/unmake, tapered PeSTO,
 * pawn structure, transposition table, null-move, iterative callers.
 */
import { FILES, initialPieces, squareFile, squareRank, type Color, type Piece, type PieceType } from "@/lib/chess/replay";
import { addPiece, cloneAcc, refreshAcc, removePiece } from "@/lib/chess/nnue/accumulator";
import { evaluateNnue } from "@/lib/chess/nnue/infer";
import type { NnueAcc, NnueNet } from "@/lib/chess/nnue/types";
import type { Ply } from "@/lib/opening/types";

export type EvalMode = "handcrafted" | "learned";

export type SearchOptions = {
  timeMs?: number;
  nodes?: number;
  evalMode?: EvalMode;
  net?: NnueNet | null;
};

const WP = 1,
  WN = 2,
  WB = 3,
  WR = 4,
  WQ = 5,
  WK = 6;
const BP = 9,
  BN = 10,
  BB = 11,
  BR = 12,
  BQ = 13,
  BK = 14;

const VALUE = [0, 100, 320, 330, 500, 900, 20000, 0, 0, 100, 320, 330, 500, 900, 20000];

const N_DELTA: [number, number][] = [
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
];
const K_DELTA: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
const B_DIR: [number, number][] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
const R_DIR: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** PeSTO middlegame / endgame, a1-first, White's perspective. */
const MG_P = [
  0, 0, 0, 0, 0, 0, 0, 0, -35, -1, -20, -23, -15, 24, 38, -22, -26, -4, -4, -10, 3, 3, 33, -12, -27,
  -2, -5, 12, 17, 6, 10, -25, -14, 13, 6, 21, 23, 12, 17, -23, -6, 7, 26, 31, 65, 56, 25, -20, 98,
  134, 61, 95, 68, 126, 34, -11, 0, 0, 0, 0, 0, 0, 0, 0,
];
const EG_P = [
  0, 0, 0, 0, 0, 0, 0, 0, 13, 8, 8, 10, 13, 0, 2, -7, 4, 7, -6, 1, 0, -5, -1, -8, 13, 9, -3, -7, -7,
  -8, 3, -1, 32, 24, 13, 5, -2, 4, 17, 17, 94, 100, 85, 67, 56, 53, 82, 84, 178, 173, 158, 134, 147,
  132, 165, 187, 0, 0, 0, 0, 0, 0, 0, 0,
];
const MG_N = [
  -105, -21, -58, -33, -17, -28, -19, -23, -29, -53, -12, -3, -1, 18, -14, -19, -23, -9, 12, 10, 19,
  17, 25, -16, -13, 4, 16, 13, 28, 19, 21, -8, -9, 17, 19, 53, 37, 69, 18, 22, -47, 60, 37, 65, 84,
  129, 73, 44, -73, -41, 72, 36, 23, 62, 7, -17, -167, -89, -34, -49, 61, -97, -15, -107,
];
const EG_N = [
  -29, -51, -23, -15, -22, -18, -50, -64, -42, -20, -10, -5, -2, -20, -23, -44, -23, -3, -1, 15, 10,
  -3, -20, -22, -18, -6, 16, 25, 16, 17, 4, -18, -17, 3, 22, 22, 22, 11, 8, -18, -24, -20, 10, 9, -1,
  -9, -19, -41, -25, -8, -25, -2, -9, -25, -24, -52, -58, -38, -13, -28, -31, -27, -63, -99,
];
const MG_B = [
  -33, -3, -14, -21, -13, -12, -39, -21, 4, 15, 16, 0, 7, 21, 33, 1, 0, 15, 15, 15, 14, 27, 18, 10,
  -6, 13, 13, 26, 26, 12, 10, 4, -4, 5, 19, 50, 37, 37, 7, -2, -16, 37, 43, 40, 35, 50, 37, -2, -26,
  16, -18, -13, 30, 59, 18, -47, -29, 4, -82, -37, -25, -42, 7, -8,
];
const EG_B = [
  -23, -9, -23, -5, -9, -16, -5, -17, -14, -18, -7, -1, 4, -9, -15, -27, -12, -3, 8, 10, 13, 3, -7,
  -15, -6, 3, 13, 19, 7, 10, -3, -9, -3, 9, 12, 9, 14, 10, 3, 2, 2, -8, 0, -1, -2, 6, 0, 4, -8, -4,
  7, -12, -3, -13, -4, -14, -14, -21, -11, -8, -7, -9, -17, -24,
];
const MG_R = [
  -19, -13, 1, 17, 16, 7, -37, -26, -44, -16, -20, -9, -1, 11, -6, -71, -45, -25, -16, -17, 3, 0, -5,
  -33, -36, -26, -12, -1, 9, -7, 6, -23, -24, -11, 7, 26, 24, 35, -8, -20, -5, 19, 26, 36, 70, 64, 60,
  56, 6, 31, 26, 44, 78, 38, 44, 0, 32, 42, 32, 51, 63, 9, 31, 43,
];
const EG_R = [
  -9, 2, 3, -1, -5, -13, 4, -20, -6, -6, 0, 2, -9, -9, -11, -3, -4, 0, -5, -1, -7, -12, -8, -16, 3, 5,
  8, 4, -5, -6, -8, -11, 4, 3, 13, 1, 2, 1, -1, 2, 7, 7, 7, 5, 4, -3, -5, -3, 11, 13, 13, 11, -3, 3,
  8, 3, 13, 10, 18, 15, 12, 12, 8, 5,
];
const MG_Q = [
  -1, -18, -9, 10, -15, -25, -31, -50, -35, -8, 11, 2, 8, 15, -3, 1, -14, 2, -11, -2, -5, 2, 14, 5,
  -9, -26, -9, -10, -2, -4, 3, -3, -27, -27, -16, -16, -1, 17, -2, 1, -13, -17, 7, 8, 29, 56, 47, 57,
  -24, -39, -5, 1, -16, 57, 28, 54, -28, 0, 29, 12, 59, 44, 43, 45,
];
const EG_Q = [
  -33, -28, -22, -43, -5, -32, -20, -41, -22, -23, -30, -16, -16, -23, -36, -32, -16, -27, 15, 6, 9,
  17, 10, 5, -18, 28, 19, 47, 31, 34, 39, 23, 3, 22, 24, 45, 57, 40, 57, 36, -20, 6, 9, 49, 47, 35,
  19, 9, -17, 20, 32, 41, 58, 25, 30, 0, -9, 22, 22, 27, 27, 19, 10, 20,
];
const MG_K = [
  -15, 36, 12, -54, 8, -28, 24, 14, 1, 7, -8, -64, -43, -16, 9, 8, -14, -14, -22, -46, -44, -30, -15,
  -27, -49, -1, -27, -39, -46, -44, -33, -51, -17, -20, -12, -27, -30, -25, -14, -36, -9, 24, 2, -16,
  -20, 6, 22, -22, 29, -1, -20, -7, -8, -4, -38, -29, -65, 23, 16, -15, -56, -34, 2, 13,
];
const EG_K = [
  -53, -34, -21, -11, -28, -14, -24, -43, -27, -11, 4, 13, 14, 4, -5, -17, -19, -3, 11, 21, 23, 16, 7,
  -9, -18, -4, 21, 24, 27, 23, 9, -11, -8, 22, 24, 27, 26, 33, 26, 3, 10, 17, 23, 15, 20, 45, 44, 13,
  -12, 17, 14, 17, 17, 38, 23, 11, -74, -35, -18, -18, -11, 15, 4, -17,
];
const MG = [MG_P, MG_N, MG_B, MG_R, MG_Q, MG_K];
const EG = [EG_P, EG_N, EG_B, EG_R, EG_Q, EG_K];
const PHASE_WT = [0, 0, 1, 1, 2, 4, 0, 0, 0, 0, 1, 1, 2, 4, 0];

export type SearchInfo = {
  depth: number;
  nodes: number;
  nps: number;
  evalCp: number;
  pv: string[];
  best: Ply | null;
  thinking: boolean;
  evalMode?: EvalMode;
};

export type EnginePos = {
  board: Int8Array;
  side: 1 | -1;
  castle: number;
  ep: number;
  acc?: NnueAcc;
  net?: NnueNet;
};

let evalMode: EvalMode = "handcrafted";
let loadedNet: NnueNet | null = null;

export function configureEngine(opts: { evalMode?: EvalMode; net?: NnueNet | null }) {
  if (opts.evalMode !== undefined) evalMode = opts.evalMode;
  if (opts.net !== undefined) loadedNet = opts.net;
}

export function engineEvalConfig() {
  const learnedReady = loadedNet !== null;
  const using: EvalMode = evalMode === "learned" && learnedReady ? "learned" : "handcrafted";
  return { evalMode, netId: loadedNet?.id ?? null, learnedReady, using };
}

export function attachNnue(pos: EnginePos) {
  const net = loadedNet;
  if (!net) return;
  pos.net = net;
  pos.acc = refreshAcc(pos.board, net);
}

type Move = {
  from: number;
  to: number;
  promo: number;
  captured: number;
  epCap: number;
  castle: number;
  ep: number;
};

function isWhite(p: number) {
  return p >= WP && p <= WK;
}
function isBlack(p: number) {
  return p >= BP && p <= BK;
}
function friendly(p: number, side: 1 | -1) {
  return side === 1 ? isWhite(p) : isBlack(p);
}
function enemy(p: number, side: 1 | -1) {
  return side === 1 ? isBlack(p) : isWhite(p);
}
function kind(p: number) {
  return p & 7;
}
function fileOf(s: number) {
  return s & 7;
}
function rankOf(s: number) {
  return s >> 3;
}
function sq(f: number, r: number) {
  if (f < 0 || f > 7 || r < 0 || r > 7) return -1;
  return f + r * 8;
}

function encode(type: PieceType, color: Color): number {
  const base = { P: 1, N: 2, B: 3, R: 4, Q: 5, K: 6 }[type];
  return color === "w" ? base : base + 8;
}

export function alg(s: number): string {
  return `${FILES[fileOf(s)]}${rankOf(s) + 1}`;
}

export function parseAlg(s: string): number {
  return squareFile(s) + squareRank(s) * 8;
}

export function castleFromPieces(pieces: readonly Piece[]): number {
  let c = 0;
  const at = (square: string, type: PieceType, color: Color) =>
    pieces.some((p) => !p.captured && p.square === square && p.type === type && p.color === color);
  if (at("e1", "K", "w") && at("h1", "R", "w")) c |= 1;
  if (at("e1", "K", "w") && at("a1", "R", "w")) c |= 2;
  if (at("e8", "K", "b") && at("h8", "R", "b")) c |= 4;
  if (at("e8", "K", "b") && at("a8", "R", "b")) c |= 8;
  return c;
}

export function epFromLastPly(ply: Ply | null | undefined, pieces: readonly Piece[]): number {
  if (!ply) return -1;
  const from = parseAlg(ply.from);
  const to = parseAlg(ply.to);
  if (fileOf(to) !== fileOf(from) || Math.abs(rankOf(to) - rankOf(from)) !== 2) return -1;
  const piece = pieces.find((p) => !p.captured && p.square === ply.to);
  if (!piece || piece.type !== "P") return -1;
  return (from + to) >> 1;
}

export function fromPieces(pieces: readonly Piece[], side: Color, lastPly?: Ply | null): EnginePos {
  const board = new Int8Array(64);
  for (const p of pieces) {
    if (p.captured) continue;
    board[parseAlg(p.square)] = encode(p.type, p.color);
  }
  return {
    board,
    side: side === "w" ? 1 : -1,
    castle: castleFromPieces(pieces),
    ep: epFromLastPly(lastPly, pieces),
  };
}

function kingSq(pos: EnginePos, side: 1 | -1): number {
  const k = side === 1 ? WK : BK;
  for (let i = 0; i < 64; i++) if (pos.board[i] === k) return i;
  return -1;
}

function attacked(pos: EnginePos, target: number, by: 1 | -1): boolean {
  const tf = fileOf(target);
  const tr = rankOf(target);
  const pawn = by === 1 ? WP : BP;
  const pr = tr + (by === 1 ? -1 : 1);
  for (const df of [-1, 1]) {
    const s = sq(tf + df, pr);
    if (s >= 0 && pos.board[s] === pawn) return true;
  }
  const n = by === 1 ? WN : BN;
  for (const [df, dr] of N_DELTA) {
    const s = sq(tf + df, tr + dr);
    if (s >= 0 && pos.board[s] === n) return true;
  }
  const k = by === 1 ? WK : BK;
  for (const [df, dr] of K_DELTA) {
    const s = sq(tf + df, tr + dr);
    if (s >= 0 && pos.board[s] === k) return true;
  }
  const b = by === 1 ? WB : BB;
  const q = by === 1 ? WQ : BQ;
  for (const [df, dr] of B_DIR) {
    let f = tf + df;
    let r = tr + dr;
    while (true) {
      const s = sq(f, r);
      if (s < 0) break;
      const p = pos.board[s];
      if (p) {
        if (p === b || p === q) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }
  const rook = by === 1 ? WR : BR;
  for (const [df, dr] of R_DIR) {
    let f = tf + df;
    let r = tr + dr;
    while (true) {
      const s = sq(f, r);
      if (s < 0) break;
      const p = pos.board[s];
      if (p) {
        if (p === rook || p === q) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }
  return false;
}

function inCheck(pos: EnginePos, side: 1 | -1): boolean {
  const k = kingSq(pos, side);
  if (k < 0) return true;
  return attacked(pos, k, side === 1 ? -1 : 1);
}

function add(moves: Move[], pos: EnginePos, from: number, to: number, promo = 0, epCap = -1) {
  moves.push({
    from,
    to,
    promo,
    captured: pos.board[to],
    epCap,
    castle: pos.castle,
    ep: pos.ep,
  });
}

function slide(pos: EnginePos, from: number, dirs: [number, number][], moves: Move[]) {
  const ff = fileOf(from);
  const fr = rankOf(from);
  for (const [df, dr] of dirs) {
    let f = ff + df;
    let r = fr + dr;
    while (true) {
      const to = sq(f, r);
      if (to < 0) break;
      const p = pos.board[to];
      if (friendly(p, pos.side)) break;
      add(moves, pos, from, to);
      if (p) break;
      f += df;
      r += dr;
    }
  }
}

function genPseudo(pos: EnginePos): Move[] {
  const moves: Move[] = [];
  const side = pos.side;
  for (let from = 0; from < 64; from++) {
    const p = pos.board[from];
    if (!friendly(p, side)) continue;
    const t = kind(p);
    const f = fileOf(from);
    const r = rankOf(from);
    if (t === 1) {
      const dir = side === 1 ? 1 : -1;
      const start = side === 1 ? 1 : 6;
      const last = side === 1 ? 7 : 0;
      const one = sq(f, r + dir);
      if (one >= 0 && !pos.board[one]) {
        if (r + dir === last) add(moves, pos, from, one, side === 1 ? WQ : BQ);
        else {
          add(moves, pos, from, one);
          const two = sq(f, r + dir * 2);
          if (r === start && two >= 0 && !pos.board[two]) add(moves, pos, from, two);
        }
      }
      for (const df of [-1, 1]) {
        const cap = sq(f + df, r + dir);
        if (cap < 0) continue;
        if (enemy(pos.board[cap], side)) {
          if (r + dir === last) add(moves, pos, from, cap, side === 1 ? WQ : BQ);
          else add(moves, pos, from, cap);
        } else if (cap === pos.ep) {
          add(moves, pos, from, cap, 0, cap + (side === 1 ? -8 : 8));
        }
      }
    } else if (t === 2) {
      for (const [df, dr] of N_DELTA) {
        const to = sq(f + df, r + dr);
        if (to >= 0 && !friendly(pos.board[to], side)) add(moves, pos, from, to);
      }
    } else if (t === 3) slide(pos, from, B_DIR, moves);
    else if (t === 4) slide(pos, from, R_DIR, moves);
    else if (t === 5) {
      slide(pos, from, B_DIR, moves);
      slide(pos, from, R_DIR, moves);
    } else if (t === 6) {
      for (const [df, dr] of K_DELTA) {
        const to = sq(f + df, r + dr);
        if (to >= 0 && !friendly(pos.board[to], side)) add(moves, pos, from, to);
      }
      if (side === 1 && from === 4) {
        if (pos.castle & 1 && !pos.board[5] && !pos.board[6]) add(moves, pos, 4, 6);
        if (pos.castle & 2 && !pos.board[3] && !pos.board[2] && !pos.board[1]) add(moves, pos, 4, 2);
      }
      if (side === -1 && from === 60) {
        if (pos.castle & 4 && !pos.board[61] && !pos.board[62]) add(moves, pos, 60, 62);
        if (pos.castle & 8 && !pos.board[59] && !pos.board[58] && !pos.board[57]) add(moves, pos, 60, 58);
      }
    }
  }
  return moves;
}

function accMake(pos: EnginePos, m: Move, p: number) {
  const net = pos.net;
  if (!net || !pos.acc) return;
  removePiece(pos.acc, net, p, m.from);
  if (m.epCap >= 0) {
    const cap = pos.board[m.epCap];
    if (cap) removePiece(pos.acc, net, cap, m.epCap);
  } else if (m.captured) {
    removePiece(pos.acc, net, m.captured, m.to);
  }
  if (kind(p) === 6 && Math.abs(m.to - m.from) === 2) {
    if (m.to === 6) {
      removePiece(pos.acc, net, WR, 7);
      addPiece(pos.acc, net, WR, 5);
    } else if (m.to === 2) {
      removePiece(pos.acc, net, WR, 0);
      addPiece(pos.acc, net, WR, 3);
    } else if (m.to === 62) {
      removePiece(pos.acc, net, BR, 63);
      addPiece(pos.acc, net, BR, 61);
    } else if (m.to === 58) {
      removePiece(pos.acc, net, BR, 56);
      addPiece(pos.acc, net, BR, 59);
    }
  }
  addPiece(pos.acc, net, m.promo || p, m.to);
}

function accUnmake(pos: EnginePos, m: Move, mover: number) {
  const net = pos.net;
  if (!net || !pos.acc) return;
  removePiece(pos.acc, net, m.promo || mover, m.to);
  if (kind(mover) === 6 && Math.abs(m.to - m.from) === 2) {
    if (m.to === 6) {
      removePiece(pos.acc, net, WR, 5);
      addPiece(pos.acc, net, WR, 7);
    } else if (m.to === 2) {
      removePiece(pos.acc, net, WR, 3);
      addPiece(pos.acc, net, WR, 0);
    } else if (m.to === 62) {
      removePiece(pos.acc, net, BR, 61);
      addPiece(pos.acc, net, BR, 63);
    } else if (m.to === 58) {
      removePiece(pos.acc, net, BR, 59);
      addPiece(pos.acc, net, BR, 56);
    }
  }
  addPiece(pos.acc, net, mover, m.from);
  if (m.epCap >= 0) {
    addPiece(pos.acc, net, m.captured || (pos.side === 1 ? BP : WP), m.epCap);
  } else if (m.captured) {
    addPiece(pos.acc, net, m.captured, m.to);
  }
}

function make(pos: EnginePos, m: Move) {
  const p = pos.board[m.from];
  accMake(pos, m, p);
  pos.board[m.from] = 0;
  pos.board[m.to] = m.promo || p;
  if (m.epCap >= 0) pos.board[m.epCap] = 0;
  if (kind(p) === 6 && Math.abs(m.to - m.from) === 2) {
    if (m.to === 6) {
      pos.board[7] = 0;
      pos.board[5] = WR;
    } else if (m.to === 2) {
      pos.board[0] = 0;
      pos.board[3] = WR;
    } else if (m.to === 62) {
      pos.board[63] = 0;
      pos.board[61] = BR;
    } else if (m.to === 58) {
      pos.board[56] = 0;
      pos.board[59] = BR;
    }
  }
  if (p === WK) pos.castle &= ~3;
  if (p === BK) pos.castle &= ~12;
  if (m.from === 0 || m.to === 0) pos.castle &= ~2;
  if (m.from === 7 || m.to === 7) pos.castle &= ~1;
  if (m.from === 56 || m.to === 56) pos.castle &= ~8;
  if (m.from === 63 || m.to === 63) pos.castle &= ~4;
  pos.ep = kind(p) === 1 && Math.abs(m.to - m.from) === 16 ? (m.from + m.to) >> 1 : -1;
  pos.side = (pos.side === 1 ? -1 : 1) as 1 | -1;
}

function unmake(pos: EnginePos, m: Move) {
  pos.side = (pos.side === 1 ? -1 : 1) as 1 | -1;
  const mover = m.promo ? (pos.side === 1 ? WP : BP) : pos.board[m.to];
  accUnmake(pos, m, mover);
  pos.board[m.to] = 0;
  pos.board[m.from] = mover;
  if (kind(mover) === 6 && Math.abs(m.to - m.from) === 2) {
    if (m.to === 6) {
      pos.board[5] = 0;
      pos.board[7] = WR;
    } else if (m.to === 2) {
      pos.board[3] = 0;
      pos.board[0] = WR;
    } else if (m.to === 62) {
      pos.board[61] = 0;
      pos.board[63] = BR;
    } else if (m.to === 58) {
      pos.board[59] = 0;
      pos.board[56] = BR;
    }
  }
  if (m.epCap >= 0) pos.board[m.epCap] = m.captured || (pos.side === 1 ? BP : WP);
  else if (m.captured) pos.board[m.to] = m.captured;
  pos.castle = m.castle;
  pos.ep = m.ep;
}

function legalMoves(pos: EnginePos): Move[] {
  const out: Move[] = [];
  for (const m of genPseudo(pos)) {
    const side = pos.side;
    if (kind(pos.board[m.from]) === 6 && Math.abs(m.to - m.from) === 2) {
      const through = m.from + (m.to > m.from ? 1 : -1);
      const opp = (side === 1 ? -1 : 1) as 1 | -1;
      if (inCheck(pos, side) || attacked(pos, through, opp) || attacked(pos, m.to, opp)) continue;
    }
    make(pos, m);
    const ok = !inCheck(pos, side);
    unmake(pos, m);
    if (ok) out.push(m);
  }
  return out;
}

export function legalPlies(pos: EnginePos): Ply[] {
  return legalMoves(pos).map((m) => ({ from: alg(m.from), to: alg(m.to) }));
}

export function isLegalPly(pos: EnginePos, ply: Ply): boolean {
  return legalMoves(pos).some((m) => alg(m.from) === ply.from && alg(m.to) === ply.to);
}

/** Start-position node counts — the generator's receipt, shown in the colophon. */
export const START_PERFT = [
  { depth: 1, nodes: 20 },
  { depth: 2, nodes: 400 },
  { depth: 3, nodes: 8902 },
] as const;

export function perft(pos: EnginePos, depth: number): number {
  if (depth === 0) return 1;
  const moves = legalMoves(pos);
  if (depth === 1) return moves.length;
  let n = 0;
  for (const m of moves) {
    make(pos, m);
    n += perft(pos, depth - 1);
    unmake(pos, m);
  }
  return n;
}

export function evaluateHandcrafted(pos: EnginePos): number {
  let mg = 0;
  let eg = 0;
  let phase = 0;
  let wB = 0;
  let bB = 0;
  const wPawns = new Int8Array(8);
  const bPawns = new Int8Array(8);
  let wKing = 4;
  let bKing = 60;

  for (let i = 0; i < 64; i++) {
    const p = pos.board[i];
    if (!p) continue;
    const t = kind(p);
    const white = isWhite(p);
    const idx = white ? i : i ^ 56;
    const mat = VALUE[p];
    const mgp = MG[t - 1][idx];
    const egp = EG[t - 1][idx];
    if (white) {
      mg += mat + mgp;
      eg += mat + egp;
    } else {
      mg -= mat + mgp;
      eg -= mat + egp;
    }
    phase += PHASE_WT[p];
    if (t === 1) {
      if (white) wPawns[fileOf(i)] += 1;
      else bPawns[fileOf(i)] += 1;
    } else if (t === 3) {
      if (white) wB += 1;
      else bB += 1;
    } else if (t === 6) {
      if (white) wKing = i;
      else bKing = i;
    }
  }

  if (wB >= 2) {
    mg += 35;
    eg += 52;
  }
  if (bB >= 2) {
    mg -= 35;
    eg -= 52;
  }

  for (let f = 0; f < 8; f++) {
    if (wPawns[f] > 1) {
      mg -= 12 * (wPawns[f] - 1);
      eg -= 22 * (wPawns[f] - 1);
    }
    if (bPawns[f] > 1) {
      mg += 12 * (bPawns[f] - 1);
      eg += 22 * (bPawns[f] - 1);
    }
    const wIso = wPawns[f] && (f === 0 || !wPawns[f - 1]) && (f === 7 || !wPawns[f + 1]);
    const bIso = bPawns[f] && (f === 0 || !bPawns[f - 1]) && (f === 7 || !bPawns[f + 1]);
    if (wIso) {
      mg -= 8;
      eg -= 14;
    }
    if (bIso) {
      mg += 8;
      eg += 14;
    }
  }

  function shield(king: number, pawns: Int8Array, white: boolean) {
    const kf = fileOf(king);
    const kr = rankOf(king);
    let s = 0;
    for (const df of [-1, 0, 1]) {
      const f = kf + df;
      if (f < 0 || f > 7) continue;
      const ahead = white ? kr + 1 : kr - 1;
      if (ahead >= 0 && ahead <= 7 && pawns[f]) s += 12;
    }
    return s;
  }
  mg += shield(wKing, wPawns, true) - shield(bKing, bPawns, false);

  if (phase > 24) phase = 24;
  return ((mg * phase + eg * (24 - phase)) / 24) | 0;
}

function evaluate(pos: EnginePos, mode: EvalMode): number {
  if (mode === "learned" && pos.net && pos.acc) {
    return evaluateNnue(pos.net, pos.acc, pos.side);
  }
  return evaluateHandcrafted(pos);
}

function uci(m: Move): string {
  return `${alg(m.from)}${alg(m.to)}${m.promo ? "q" : ""}`;
}

const SAN_LETTER: Record<number, string> = { 2: "N", 3: "B", 4: "R", 5: "Q", 6: "K" };

function toSan(pos: EnginePos, m: Move, moves: Move[]): string {
  const p = pos.board[m.from];
  const t = kind(p);
  if (t === 6 && Math.abs(m.to - m.from) === 2) {
    return m.to > m.from ? "O-O" : "O-O-O";
  }
  const dest = alg(m.to);
  const capture = Boolean(m.captured) || m.epCap >= 0;
  let san: string;
  if (t === 1) {
    san = capture ? `${FILES[fileOf(m.from)]}x${dest}` : dest;
    if (m.promo) san += "=Q";
  } else {
    const others = moves.filter(
      (o) => o.from !== m.from && o.to === m.to && kind(pos.board[o.from]) === t,
    );
    let dis = "";
    if (others.length > 0) {
      const sameFile = others.some((o) => fileOf(o.from) === fileOf(m.from));
      const sameRank = others.some((o) => rankOf(o.from) === rankOf(m.from));
      if (!sameFile) dis = FILES[fileOf(m.from)];
      else if (!sameRank) dis = String(rankOf(m.from) + 1);
      else dis = `${FILES[fileOf(m.from)]}${rankOf(m.from) + 1}`;
    }
    san = `${SAN_LETTER[t]}${dis}${capture ? "x" : ""}${dest}`;
  }
  make(pos, m);
  const check = inCheck(pos, pos.side);
  const mate = check && legalMoves(pos).length === 0;
  unmake(pos, m);
  if (mate) san += "#";
  else if (check) san += "+";
  return san;
}

function formatPv(pos: EnginePos, uciList: string[]): string[] {
  const work = clonePos(pos);
  const out: string[] = [];
  for (const u of uciList) {
    const moves = legalMoves(work);
    const m = moves.find((mv) => uci(mv) === u);
    if (!m) break;
    out.push(toSan(work, m, moves));
    make(work, m);
  }
  return out;
}

export function numberPv(pv: string[], side: Color, moveNumber: number): string {
  const parts: string[] = [];
  let s = side;
  let n = moveNumber;
  for (const san of pv) {
    if (s === "w") parts.push(`${n}. ${san}`);
    else parts.push(parts.length === 0 ? `${n}…${san}` : san);
    if (s === "b") n += 1;
    s = s === "w" ? "b" : "w";
  }
  return parts.join(" ");
}

const TT_SIZE = 1 << 18;
const TT_MASK = TT_SIZE - 1;
type TTEntry = { key: number; depth: number; score: number; flag: 0 | 1 | 2; move: string };
const tt: (TTEntry | undefined)[] = new Array(TT_SIZE);
let killers: string[][] = [];
let history: Int16Array = new Int16Array(64 * 64);

function key32(pos: EnginePos): number {
  let h = pos.side === 1 ? 0x9e3779b9 : 0x7f4a7c15;
  h ^= pos.castle * 0x85ebca6b;
  h ^= (pos.ep + 1) * 0xc2b2ae35;
  for (let i = 0; i < 64; i++) {
    const p = pos.board[i];
    if (!p) continue;
    h = Math.imul(h ^ (p * 131 + i), 0x27d4eb2d);
    h ^= h >>> 15;
  }
  return h >>> 0;
}

export function prepareSearch() {
  tt.fill(undefined);
  killers = Array.from({ length: 64 }, () => ["", ""]);
  history = new Int16Array(64 * 64);
}

function order(moves: Move[], ply: number, hashMove: string): Move[] {
  return moves.sort((a, b) => {
    const ua = uci(a);
    const ub = uci(b);
    const sa =
      (ua === hashMove ? 1_000_000 : 0) +
      VALUE[a.captured] * 16 +
      VALUE[a.promo] +
      (killers[ply]?.[0] === ua ? 9000 : 0) +
      (killers[ply]?.[1] === ua ? 7000 : 0) +
      history[a.from * 64 + a.to];
    const sb =
      (ub === hashMove ? 1_000_000 : 0) +
      VALUE[b.captured] * 16 +
      VALUE[b.promo] +
      (killers[ply]?.[0] === ub ? 9000 : 0) +
      (killers[ply]?.[1] === ub ? 7000 : 0) +
      history[b.from * 64 + b.to];
    return sb - sa;
  });
}

type Stats = { nodes: number; deadline: number; nodeLimit: number; timedOut: boolean; evalMode: EvalMode };

function hitLimit(stats: Stats): boolean {
  if ((stats.nodes & 15) !== 0) return false;
  if (performance.now() >= stats.deadline || stats.nodes >= stats.nodeLimit) {
    stats.timedOut = true;
    return true;
  }
  return false;
}

function quiesce(pos: EnginePos, alpha: number, beta: number, stats: Stats): number {
  stats.nodes += 1;
  if (hitLimit(stats)) return alpha;
  const stand = pos.side === 1 ? evaluate(pos, stats.evalMode) : -evaluate(pos, stats.evalMode);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  const captures = order(
    legalMoves(pos).filter((m) => m.captured || m.promo || m.epCap >= 0),
    0,
    "",
  );
  for (const m of captures) {
    if (stand + VALUE[m.captured] + 90 < alpha) continue;
    make(pos, m);
    const sc = -quiesce(pos, -beta, -alpha, stats);
    unmake(pos, m);
    if (stats.timedOut) return alpha;
    if (sc >= beta) return beta;
    if (sc > alpha) alpha = sc;
  }
  return alpha;
}

function alphabeta(
  pos: EnginePos,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  stats: Stats,
  pv: string[],
  allowNull: boolean,
): number {
  stats.nodes += 1;
  if (hitLimit(stats)) {
    return alpha;
  }

  const checked = inCheck(pos, pos.side);
  if (checked) depth += 1;

  const key = key32(pos);
  const slot = key & TT_MASK;
  const hit = tt[slot];
  let hashMove = "";
  if (hit && hit.key === key) {
    hashMove = hit.move;
    if (hit.depth >= depth) {
      if (hit.flag === 0) return hit.score;
      if (hit.flag === 1 && hit.score <= alpha) return hit.score;
      if (hit.flag === 2 && hit.score >= beta) return hit.score;
    }
  }

  if (depth <= 0) return quiesce(pos, alpha, beta, stats);

  const moves = legalMoves(pos);
  if (moves.length === 0) {
    return checked ? -19999 + ply : 0;
  }

  if (allowNull && !checked && depth >= 3) {
    let nonPawn = 0;
    for (let i = 0; i < 64; i++) {
      const p = pos.board[i];
      if (p && kind(p) !== 1 && kind(p) !== 6 && friendly(p, pos.side)) nonPawn += 1;
    }
    if (nonPawn >= 2) {
      const ep = pos.ep;
      pos.ep = -1;
      pos.side = (pos.side === 1 ? -1 : 1) as 1 | -1;
      const sc = -alphabeta(pos, depth - 3, ply + 1, -beta, -beta + 1, stats, [], false);
      pos.side = (pos.side === 1 ? -1 : 1) as 1 | -1;
      pos.ep = ep;
      if (stats.timedOut) return alpha;
      if (sc >= beta) return beta;
    }
  }

  order(moves, ply, hashMove);
  let best: string[] = [];
  let bestUci = "";
  const alpha0 = alpha;
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    const child: string[] = [];
    const u = uci(m);
    make(pos, m);
    let sc: number;
    if (i > 3 && depth >= 3 && !m.captured && !m.promo && !checked) {
      sc = -alphabeta(pos, depth - 2, ply + 1, -alpha - 1, -alpha, stats, child, true);
      if (sc > alpha) sc = -alphabeta(pos, depth - 1, ply + 1, -beta, -alpha, stats, child, true);
    } else {
      sc = -alphabeta(pos, depth - 1, ply + 1, -beta, -alpha, stats, child, true);
    }
    unmake(pos, m);
    if (stats.timedOut) return alpha0;
    if (sc >= beta) {
      if (!m.captured && killers[ply]) {
        if (killers[ply][0] !== u) {
          killers[ply][1] = killers[ply][0];
          killers[ply][0] = u;
        }
      }
      history[m.from * 64 + m.to] = Math.min(30000, history[m.from * 64 + m.to] + depth * depth);
      tt[slot] = { key, depth, score: sc, flag: 2, move: u };
      return beta;
    }
    if (sc > alpha) {
      alpha = sc;
      bestUci = u;
      best = [u, ...child];
    }
  }
  pv.length = 0;
  pv.push(...best);
  tt[slot] = {
    key,
    depth,
    score: alpha,
    flag: alpha > alpha0 ? 0 : 1,
    move: bestUci || (moves[0] ? uci(moves[0]) : ""),
  };
  return alpha;
}

type SearchResult = {
  score: number;
  nodes: number;
  pv: string[];
  best: Ply | null;
  depth: number;
  timedOut: boolean;
};

const REPLY_MAX_DEPTH = 6;
const REPLY_BUDGET_MS = 400;

/**
 * A move the annotator can play. Iterative deepening so a tight clock still
 * leaves a legal ply — a single deep search can time out with an empty PV.
 */
export function replyMove(pos: EnginePos): Ply | null {
  const fallback = legalPlies(pos)[0] ?? null;
  if (!fallback) return null;
  prepareSearch();
  const t0 = performance.now();
  let best = fallback;
  for (let depth = 1; depth <= REPLY_MAX_DEPTH; depth++) {
    const remain = REPLY_BUDGET_MS - (performance.now() - t0);
    if (depth > 1 && remain < 16) break;
    const result = search(clonePos(pos), depth, { timeMs: Math.max(remain, 24) });
    if (result.best && isLegalPly(pos, result.best)) best = result.best;
    if (result.timedOut && depth > 1) break;
  }
  return best;
}

export function playUci(pos: EnginePos, u: string): boolean {
  const m = legalMoves(pos).find((mv) => uci(mv) === u);
  if (!m) return false;
  make(pos, m);
  return true;
}

export function playPly(pos: EnginePos, ply: Ply): boolean {
  const m = legalMoves(pos).find((mv) => alg(mv.from) === ply.from && alg(mv.to) === ply.to);
  if (!m) return false;
  make(pos, m);
  return true;
}

export function positionKey(pos: EnginePos): number {
  return key32(pos);
}

export function gameOutcome(pos: EnginePos): "1-0" | "0-1" | "1/2-1/2" | null {
  if (legalMoves(pos).length > 0) return null;
  if (inCheck(pos, pos.side)) return pos.side === 1 ? "0-1" : "1-0";
  return "1/2-1/2";
}

/** Quiet iff not in check and qsearch stays within `margin` of the static eval. */
export function isQuietPosition(pos: EnginePos, margin = 40): boolean {
  if (inCheck(pos, pos.side)) return false;
  const stand = pos.side === 1 ? evaluateHandcrafted(pos) : -evaluateHandcrafted(pos);
  const stats: Stats = {
    nodes: 0,
    deadline: performance.now() + 1e9,
    nodeLimit: 1_000_000,
    timedOut: false,
    evalMode: "handcrafted",
  };
  const qs = quiesce(clonePos(pos), -30000, 30000, stats);
  return Math.abs(qs - stand) <= margin;
}

export function searchMove(pos: EnginePos, opts: SearchOptions & { nodes: number }): SearchResult {
  prepareSearch();
  const fallback = legalPlies(pos)[0] ?? null;
  const mode = opts.evalMode ?? evalMode;
  let used = 0;
  let last: SearchResult | null = null;
  for (let depth = 1; depth <= 32; depth++) {
    const remain = opts.nodes - used;
    if (remain <= 8) break;
    const result = search(clonePos(pos), depth, {
      timeMs: opts.timeMs ?? 1e9,
      nodes: remain,
      evalMode: mode,
      ...("net" in opts ? { net: opts.net } : {}),
    });
    used += result.nodes;
    if (result.best) last = { ...result, nodes: used };
    if (result.timedOut && depth > 1) break;
    if (used >= opts.nodes) break;
  }
  return (
    last ?? {
      score: 0,
      nodes: used,
      pv: [],
      best: fallback,
      depth: 0,
      timedOut: true,
    }
  );
}

/** Score is always from White's point of view, in centipawns. */
export function search(
  pos: EnginePos,
  depth: number,
  opts?: SearchOptions,
): SearchResult {
  if (killers.length === 0) {
    killers = Array.from({ length: 64 }, () => ["", ""]);
    history = new Int16Array(64 * 64);
  }
  const mode = opts?.evalMode ?? evalMode;
  const net = mode === "learned" ? (opts && "net" in opts ? opts.net : loadedNet) : null;
  if (net) {
    pos.net = net;
    pos.acc = refreshAcc(pos.board, net);
  } else {
    pos.net = undefined;
    pos.acc = undefined;
  }
  const stats: Stats = {
    nodes: 0,
    deadline: performance.now() + (opts?.timeMs ?? 1e9),
    nodeLimit: opts?.nodes ?? 2_000_000_000,
    timedOut: false,
    evalMode: mode,
  };
  const pv: string[] = [];
  const raw = alphabeta(pos, depth, 0, -30000, 30000, stats, pv, true);
  if (stats.timedOut && pv.length === 0) {
    return { score: 0, nodes: stats.nodes, pv: [], best: null, depth: 0, timedOut: true };
  }
  const evalCp = pos.side === 1 ? raw : -raw;
  const clamped = Math.max(-1500, Math.min(1500, evalCp));
  const best: Ply | null = pv[0]
    ? { from: pv[0].slice(0, 2), to: pv[0].slice(2, 4) }
    : null;
  return {
    score: clamped,
    nodes: stats.nodes,
    pv: formatPv(pos, pv),
    best,
    depth,
    timedOut: stats.timedOut,
  };
}

export function clonePos(pos: EnginePos): EnginePos {
  return {
    board: Int8Array.from(pos.board),
    side: pos.side,
    castle: pos.castle,
    ep: pos.ep,
    acc: pos.acc ? cloneAcc(pos.acc) : undefined,
    net: pos.net,
  };
}

export function startPos(): EnginePos {
  return fromPieces(initialPieces(), "w", null);
}
