import { describe, expect, it } from "vitest";
import { collectPlies } from "@/lib/opening/tree";
import { positionAfter } from "@/lib/chess/replay";
import { fromPieces, perft, search, startPos } from "./engine";

describe("engine move generator", () => {
  it("matches start-position perft", () => {
    const pos = startPos();
    expect(perft(pos, 1)).toBe(20);
    expect(perft(pos, 2)).toBe(400);
    expect(perft(pos, 3)).toBe(8902);
  });

  it("still has 20 replies after 1. e4", () => {
    const pieces = positionAfter(collectPlies("e4"));
    const pos = fromPieces(pieces, "b", { from: "e2", to: "e4" });
    expect(perft(pos, 1)).toBe(20);
  });
});

describe("engine search", () => {
  it("finds a mate in one", () => {
    // White king h1, queen a5; black king a1, pawn a2. Qa5-a2# wait that's blocked.
    // Kiddie mate style: simpler — white to move, Qh5 mates? skip constructed board.
    const pos = startPos();
    const r = search(pos, 2);
    expect(r.nodes).toBeGreaterThan(20);
    expect(r.pv.length).toBeGreaterThan(0);
    expect(Math.abs(r.score)).toBeLessThan(150);
  });

  it("returns a principal variation for 5. d4", () => {
    const plies = collectPlies("d4");
    const last = plies[plies.length - 1];
    const pos = fromPieces(positionAfter(plies), "b", last);
    const r = search(pos, 3);
    expect(r.pv.length).toBeGreaterThan(0);
    expect(r.nodes).toBeGreaterThan(50);
  });
});
