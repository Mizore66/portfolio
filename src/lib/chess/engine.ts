/**
 * A small alpha-beta search over the displayed position.
 * Mailbox 64, make/unmake, quiescence. Not Stockfish — honest and live.
 */
import { FILES, initialPieces, squareFile, squareRank, type Color, type Piece, type PieceType } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

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

const PST_P = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10,
  25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10,
  10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];
const PST_N = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0,
  -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5,
  -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
];

export type SearchInfo = {
  depth: number;
  nodes: number;
  nps: number;
  evalCp: number;
  pv: string[];
  thinking: boolean;
};

export type EnginePos = {
  board: Int8Array;
  side: 1 | -1;
  castle: number;
  ep: number;
};

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

function make(pos: EnginePos, m: Move) {
  const p = pos.board[m.from];
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

function pst(p: number, s: number): number {
  const t = kind(p);
  const idx = isWhite(p) ? s : s ^ 56;
  if (t === 1) return PST_P[idx];
  if (t === 2) return PST_N[idx];
  return 0;
}

function evaluate(pos: EnginePos): number {
  let s = 0;
  for (let i = 0; i < 64; i++) {
    const p = pos.board[i];
    if (!p) continue;
    const v = VALUE[p] + pst(p, i);
    s += isWhite(p) ? v : -v;
  }
  return s;
}

function uci(m: Move): string {
  return `${alg(m.from)}${alg(m.to)}${m.promo ? "q" : ""}`;
}

function order(moves: Move[]): Move[] {
  return moves.sort((a, b) => VALUE[b.captured] - VALUE[a.captured] || VALUE[b.promo] - VALUE[a.promo]);
}

type SearchResult = { score: number; nodes: number; pv: string[] };

function quiesce(pos: EnginePos, alpha: number, beta: number, stats: { nodes: number }): number {
  stats.nodes += 1;
  const stand = pos.side === 1 ? evaluate(pos) : -evaluate(pos);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  const captures = order(legalMoves(pos).filter((m) => m.captured || m.promo || m.epCap >= 0));
  for (const m of captures) {
    make(pos, m);
    const sc = -quiesce(pos, -beta, -alpha, stats);
    unmake(pos, m);
    if (sc >= beta) return beta;
    if (sc > alpha) alpha = sc;
  }
  return alpha;
}

function alphabeta(
  pos: EnginePos,
  depth: number,
  alpha: number,
  beta: number,
  stats: { nodes: number },
  pv: string[],
): number {
  stats.nodes += 1;
  const moves = order(legalMoves(pos));
  if (moves.length === 0) {
    return inCheck(pos, pos.side) ? -19999 + (8 - depth) : 0;
  }
  if (depth <= 0) return quiesce(pos, alpha, beta, stats);
  let best: string[] = [];
  for (const m of moves) {
    const child: string[] = [];
    make(pos, m);
    const sc = -alphabeta(pos, depth - 1, -beta, -alpha, stats, child);
    unmake(pos, m);
    if (sc >= beta) return beta;
    if (sc > alpha) {
      alpha = sc;
      best = [uci(m), ...child];
    }
  }
  pv.length = 0;
  pv.push(...best);
  return alpha;
}

/** Score is always from White's point of view, in centipawns. */
export function search(pos: EnginePos, depth: number): SearchResult {
  const stats = { nodes: 0 };
  const pv: string[] = [];
  const raw = alphabeta(pos, depth, -30000, 30000, stats, pv);
  const evalCp = pos.side === 1 ? raw : -raw;
  return { score: evalCp, nodes: stats.nodes, pv };
}

export function clonePos(pos: EnginePos): EnginePos {
  return { board: Int8Array.from(pos.board), side: pos.side, castle: pos.castle, ep: pos.ep };
}

export function startPos(): EnginePos {
  return fromPieces(initialPieces(), "w", null);
}
