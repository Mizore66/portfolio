import { describe, expect, it } from "vitest";
import { expandIfCastle, expandPlayLine, sideAfter } from "./play";
import { positionAfter } from "./replay";

describe("play helpers", () => {
  it("flips the side after each extra ply", () => {
    expect(sideAfter("w", 0)).toBe("w");
    expect(sideAfter("w", 1)).toBe("b");
    expect(sideAfter("b", 1)).toBe("w");
  });

  it("expands a king leap into a rook ply", () => {
    const pieces = positionAfter([]);
    const expanded = expandIfCastle(pieces, { from: "e1", to: "g1" });
    expect(expanded).toEqual([
      { from: "e1", to: "g1" },
      { from: "h1", to: "f1" },
    ]);
  });

  it("keeps ordinary plies as one step in the play line", () => {
    const line = expandPlayLine([], [{ from: "e2", to: "e4" }]);
    expect(line).toEqual([{ from: "e2", to: "e4" }]);
  });
});
