import { FILES } from "@/lib/chess/replay";

/** Board space: one unit per square, a1 at (-3.5, +3.5), White at +z. */
export const SQ = 1;
export const BORDER = 0.62;
export const MAT = 8 * SQ + 2 * BORDER;

export function squareXZ(sq: string): [number, number] {
  const f = FILES.indexOf(sq[0]);
  const r = Number(sq[1]) - 1;
  return [(f - 3.5) * SQ, -(r - 3.5) * SQ];
}

/** Squares a piece passes through, in order, excluding the start (brief §4: one square at a time). */
export function squarePath(from: string, to: string, knight: boolean): string[] {
  const f0 = FILES.indexOf(from[0]);
  const r0 = Number(from[1]);
  const f1 = FILES.indexOf(to[0]);
  const r1 = Number(to[1]);
  if (knight) return [to];
  const df = Math.sign(f1 - f0);
  const dr = Math.sign(r1 - r0);
  const n = Math.max(Math.abs(f1 - f0), Math.abs(r1 - r0));
  const out: string[] = [];
  for (let i = 1; i <= n; i++) out.push(`${FILES[f0 + df * i]}${r0 + dr * i}`);
  return out;
}

/** Chebyshev distance in squares: how many steps the travel takes. */
export function squareDistance(from: string, to: string): number {
  return Math.max(Math.abs(FILES.indexOf(from[0]) - FILES.indexOf(to[0])), Math.abs(Number(from[1]) - Number(to[1])));
}
