import { describe, expect, it } from "vitest";
import { OPENING_NODES } from "../../content/opening";
import { collectPlies, getMainline } from "../opening/tree";
import { occupancy, occupancyFen, positionAfter, snapInnerEdge, squareBox } from "./replay";

describe("Italian Game replay", () => {
  it("prints occupancy as piece-placement FEN", () => {
    expect(occupancyFen(positionAfter([]))).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    expect(occupancyFen(positionAfter(collectPlies("e4")))).toBe(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
    );
  });

  it("castles as two raw plies: king g1, rook f1", () => {
    const occ = occupancy(positionAfter(collectPlies("oo")));
    expect(occ.g1).toBe("wK");
    expect(occ.f1).toBe("wR");
    expect(occ.e1).toBeUndefined();
    expect(occ.h1).toBeUndefined();
  });

  it("captures on 5…exd4: black pawn on d4, white d-pawn gone", () => {
    const before = occupancy(positionAfter(collectPlies("d4")));
    expect(before.d4).toBe("wP");
    expect(before.e5).toBe("bP");

    const after = occupancy(positionAfter(collectPlies("exd4")));
    expect(after.d4).toBe("bP");
    expect(after.e5).toBeUndefined();
    expect(Object.values(after).filter((p) => p === "wP")).toHaveLength(7);
  });

  it("reaches the legal 6. Re1 Italian position", () => {
    const occ = occupancy(positionAfter(collectPlies("re1")));
    expect(occ).toMatchObject({
      a1: "wR",
      b1: "wN",
      c1: "wB",
      d1: "wQ",
      e1: "wR",
      g1: "wK",
      a2: "wP",
      b2: "wP",
      c2: "wP",
      e4: "wP",
      f2: "wP",
      g2: "wP",
      h2: "wP",
      f3: "wN",
      c4: "wB",
      d4: "bP",
      a7: "bP",
      b7: "bP",
      c7: "bP",
      d7: "bP",
      f7: "bP",
      g7: "bP",
      h7: "bP",
      a8: "bR",
      c8: "bB",
      d8: "bQ",
      e8: "bK",
      h8: "bR",
      c6: "bN",
      f6: "bN",
      c5: "bB",
    });
    expect(occ.f1).toBeUndefined();
    expect(occ.e2).toBeUndefined();
    expect(occ.d2).toBeUndefined();
    expect(occ.g8).toBeUndefined();
    expect(occ.b8).toBeUndefined();
    expect(Object.keys(occ)).toHaveLength(31);
  });

  it("places squares in board-relative percents so files cannot drift", () => {
    expect(squareBox(0, 7)).toEqual({ left: "0%", top: "0%", width: "12.5%", height: "12.5%" });
    expect(squareBox(6, 7)).toEqual({ left: "75%", top: "0%", width: "12.5%", height: "12.5%" });
    expect(squareBox(7, 0)).toEqual({ left: "87.5%", top: "87.5%", width: "12.5%", height: "12.5%" });
    expect(snapInnerEdge(390)).toBe(384);
    expect(snapInnerEdge(390) % 8).toBe(0);
  });

  it("replays every content node without illegal plies", () => {
    for (const node of OPENING_NODES) {
      expect(() => positionAfter(collectPlies(node.id))).not.toThrow();
    }
  });

  it("keeps a mainline of start through Re1", () => {
    expect(getMainline().map((n) => n.id)).toEqual([
      "start",
      "e4",
      "e5",
      "nf3",
      "nc6",
      "bc4",
      "bc5",
      "oo",
      "nf6",
      "d4",
      "exd4",
      "re1",
    ]);
  });
});
