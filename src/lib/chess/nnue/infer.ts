import { CRELU_MAX, QA, QB, type NnueAcc, type NnueNet } from "./types";

const HIDDEN_SCRATCH = new Int32Array(32);

function crelu(x: number): number {
  if (x < 0) return 0;
  if (x > CRELU_MAX) return CRELU_MAX;
  return x;
}

/**
 * Integer forward pass. Accumulators are white/black perspective, not STM-flipped.
 * Returns centipawns from White's point of view, same as PeSTO.
 */
export function evaluateNnue(net: NnueNet, acc: NnueAcc, side: 1 | -1): number {
  const stm = side === 1 ? acc.w : acc.b;
  const nstm = side === 1 ? acc.b : acc.w;
  const n = net.accSize;
  const hidden = HIDDEN_SCRATCH;
  const l1 = net.l1W;
  for (let i = 0; i < 32; i++) {
    let s = net.l1B[i];
    const row = i * (2 * n);
    for (let j = 0; j < n; j++) s += crelu(stm[j]) * l1[row + j];
    for (let j = 0; j < n; j++) s += crelu(nstm[j]) * l1[row + n + j];
    hidden[i] = s;
  }
  let out = net.l2B[0];
  for (let i = 0; i < 32; i++) out += crelu((hidden[i] / QA) | 0) * net.l2W[i];
  const cp = ((out * net.scale) / (QA * QB)) | 0;
  return side === 1 ? cp : -cp;
}
