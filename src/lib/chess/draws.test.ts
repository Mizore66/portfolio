import { describe, it, expect } from "vitest";
import { deadMaterial, drawBy } from "./draws";
import { fromPieces } from "./engine";
import type { Piece } from "./replay";
import { legalPlies, playPly, rowsOf, startPos } from "./engine";
import type { Ply } from "@/lib/opening/types";

const line = (s: string): Ply[] => s.split(" ").map((m) => ({ from: m.slice(0, 2), to: m.slice(2, 4) }));

describe("draw by repetition", () => {
  const shuffle = "g1f3 g8f6 f3g1 f6g8";
  it("is the same position a third time, not a second", () => {
    expect(drawBy(line(shuffle))).toBeNull();
    expect(drawBy(line(`${shuffle} ${shuffle}`))).toBe("repetition");
  });
  it("counts castling rights: a king walk back home is a new position", () => {
    const walk = "e1e2 e8e7 e2e1 e7e8";
    expect(drawBy(line(`e2e4 e7e5 ${walk} ${walk}`))).toBeNull(); // the rightless position twice
    expect(drawBy(line(`e2e4 e7e5 ${walk} ${walk} ${walk}`))).toBe("repetition");
  });
});

describe("the fifty-move rule", () => {
  // a walk of quiet moves (no pawn moved, nothing taken) that never repeats a position three times
  function quietWalk(n: number, pawnAt = -1): Ply[] {
    const base = line("e2e4 e7e5 d2d4 d7d5 c2c3 c7c6");
    let seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    const options = (plies: Ply[]) => {
      const pos = startPos(); for (const p of plies) playPly(pos, p);
      const rows = rowsOf(pos).split("/"), on = (sq: string) => rows[8 - +sq[1]]["abcdefgh".indexOf(sq[0])];
      const pawn = plies.length - base.length === pawnAt;
      return legalPlies(pos).filter((p) => (on(p.from).toUpperCase() === "P") === pawn && on(p.to) === "." && drawBy([...plies, p]) !== "repetition")
        .map((p) => ({ p, r: rnd() })).sort((a, b) => a.r - b.r).map((x) => x.p);
    };
    // depth first, so a walk that runs into a corner (a check only a capture answers) backs out of it
    const walk = (plies: Ply[]): Ply[] | null => {
      if (plies.length === base.length + n) return plies;
      for (const p of options(plies)) { const w = walk([...plies, p]); if (w) return w; }
      return null;
    };
    return walk(base)!;
  }
  it("draws after a hundred quiet half-moves, not ninety-nine", () => {
    const w = quietWalk(100);
    expect(drawBy(w.slice(0, -1))).toBeNull();
    expect(drawBy(w)).toBe("fifty");
  });
  it("starts counting again after a pawn move", () => {
    const w = quietWalk(151, 50), base = 6; // a pawn moves on the 51st, then 100 quiet half-moves
    expect(drawBy(w.slice(0, base + 100))).toBeNull();
    expect(drawBy(w.slice(0, base + 150))).toBeNull();
    expect(drawBy(w)).toBe("fifty");
  });
});

describe("insufficient material", () => {
  // pieces as "Ke1 kh8 Bc1", white in capitals
  const pos = (s: string) => fromPieces(s.split(" ").map((t) => ({ type: t[0].toUpperCase(), color: t[0] === t[0].toUpperCase() ? "w" : "b", square: t.slice(1), captured: false })) as unknown as Piece[], "w", null);
  it("is dead with kings alone, or a lone bishop or knight", () => {
    for (const s of ["Ke1 kh8", "Ke1 kh8 Bc1", "Ke1 kh8 nb8", "Ke1 kh8 Bc1 bf8"]) expect(deadMaterial(pos(s)), s).toBe(true); // c1 and f8 both dark
  });
  it("is alive with a pawn, a rook, two knights, or bishops on both colours", () => {
    for (const s of ["Ke1 kh8 Pa2", "Ke1 kh8 Ra1", "Ke1 kh8 Nb1 Ng1", "Ke1 kh8 Bc1 bc8", "Ke1 kh8 Bc1 nb8"]) expect(deadMaterial(pos(s)), s).toBe(false);
  });
  it("is not reached in a game with material on the board", () => {
    expect(drawBy(line("e2e4 e7e5"))).toBeNull();
  });
});
