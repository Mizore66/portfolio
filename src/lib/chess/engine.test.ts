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
  it("prints SAN, not coordinate UCI", () => {
    const r = search(startPos(), 2);
    expect(r.pv[0]).toBeTruthy();
    expect(r.pv[0]).not.toMatch(/^[a-h][1-8][a-h][1-8]q?$/);
    expect(r.pv[0]).toMatch(
      /^(O-O-O|O-O|[NBRQK][a-h1-8]?x?[a-h][1-8][+#]?|[a-h]x?[a-h][1-8](?:=Q)?[+#]?)$/,
    );
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
