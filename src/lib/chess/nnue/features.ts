/** 12 piece-types × 64 squares, from a given perspective. No HalfKP. */

const KIND_MASK = 7;

export function featureIndex(piece: number, square: number, perspective: 1 | -1): number {
  const ptype = (piece & KIND_MASK) - 1;
  const white = piece > 0 && piece <= 6;
  const sq = perspective === -1 ? square ^ 56 : square;
  const own = perspective === 1 ? white : !white;
  const plane = (own ? 0 : 6) + ptype;
  return plane * 64 + sq;
}
