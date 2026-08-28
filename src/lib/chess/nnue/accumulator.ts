import { featureIndex } from "./features";
import type { NnueAcc, NnueNet } from "./types";

export function newAcc(net: NnueNet): NnueAcc {
  return { w: Int16Array.from(net.ftB), b: Int16Array.from(net.ftB) };
}

function addColumn(acc: Int16Array, net: NnueNet, feat: number, sign: 1 | -1) {
  const n = net.accSize;
  const base = feat * n;
  const w = net.ftW;
  for (let i = 0; i < n; i++) {
    acc[i] = (acc[i] + sign * w[base + i]) | 0;
  }
}

export function addPiece(acc: NnueAcc, net: NnueNet, piece: number, square: number) {
  addColumn(acc.w, net, featureIndex(piece, square, 1), 1);
  addColumn(acc.b, net, featureIndex(piece, square, -1), 1);
}

export function removePiece(acc: NnueAcc, net: NnueNet, piece: number, square: number) {
  addColumn(acc.w, net, featureIndex(piece, square, 1), -1);
  addColumn(acc.b, net, featureIndex(piece, square, -1), -1);
}

export function refreshAcc(board: Int8Array, net: NnueNet): NnueAcc {
  const acc = newAcc(net);
  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (p) addPiece(acc, net, p, sq);
  }
  return acc;
}

export function accEqual(a: NnueAcc, b: NnueAcc): boolean {
  if (a.w.length !== b.w.length || a.b.length !== b.b.length) return false;
  for (let i = 0; i < a.w.length; i++) if (a.w[i] !== b.w[i]) return false;
  for (let i = 0; i < a.b.length; i++) if (a.b[i] !== b.b[i]) return false;
  return true;
}

export function cloneAcc(acc: NnueAcc): NnueAcc {
  return { w: Int16Array.from(acc.w), b: Int16Array.from(acc.b) };
}
