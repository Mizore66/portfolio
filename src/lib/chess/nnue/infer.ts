import { CRELU_MAX, QA, QB, type NnueAcc, type NnueNet } from "./types";

const HIDDEN_SCRATCH = new Int32Array(32);

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
  const l1b = net.l1B;
  for (let i = 0; i < 32; i++) {
    let s = l1b[i];
    const row = i * (2 * n);
    for (let j = 0; j < n; j++) {
      const a = stm[j];
      if (a > 0) s += (a > CRELU_MAX ? CRELU_MAX : a) * l1[row + j];
    }
    for (let j = 0; j < n; j++) {
      const a = nstm[j];
      if (a > 0) s += (a > CRELU_MAX ? CRELU_MAX : a) * l1[row + n + j];
    }
    hidden[i] = s;
  }
  let out = net.l2B[0];
  const l2 = net.l2W;
  for (let i = 0; i < 32; i++) {
    const h = (hidden[i] / QA) | 0;
    if (h > 0) out += (h > CRELU_MAX ? CRELU_MAX : h) * l2[i];
  }
  const cp = ((out * net.scale) / (QA * QB)) | 0;
  return side === 1 ? cp : -cp;
}

/**
 * Same topology without the integer truncations. §9 float-vs-int parity:
 * a scale bug shows up here as a tens-of-pawns gap, not a rounding error.
 */
export function evaluateNnueFloat(net: NnueNet, acc: NnueAcc, side: 1 | -1): number {
  const stm = side === 1 ? acc.w : acc.b;
  const nstm = side === 1 ? acc.b : acc.w;
  const n = net.accSize;
  const hidden = new Float64Array(32);
  const l1 = net.l1W;
  const l1b = net.l1B;
  for (let i = 0; i < 32; i++) {
    let s = l1b[i];
    const row = i * (2 * n);
    for (let j = 0; j < n; j++) {
      const a = stm[j];
      if (a > 0) s += (a > CRELU_MAX ? CRELU_MAX : a) * l1[row + j];
    }
    for (let j = 0; j < n; j++) {
      const a = nstm[j];
      if (a > 0) s += (a > CRELU_MAX ? CRELU_MAX : a) * l1[row + n + j];
    }
    hidden[i] = s;
  }
  let out = net.l2B[0];
  const l2 = net.l2W;
  for (let i = 0; i < 32; i++) {
    let h = hidden[i] / QA;
    if (h < 0) h = 0;
    else if (h > CRELU_MAX) h = CRELU_MAX;
    out += h * l2[i];
  }
  const cp = (out * net.scale) / (QA * QB);
  return side === 1 ? cp : -cp;
}
