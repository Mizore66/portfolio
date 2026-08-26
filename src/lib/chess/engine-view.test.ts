import { describe, expect, it } from "vitest";
import { PV_MIN_DEPTH, visibleEngineLine } from "./engine-view";
import type { SearchInfo } from "./engine";

const nc3: SearchInfo = {
  depth: 4,
  nodes: 100,
  nps: 1000,
  evalCp: 12,
  pv: ["Nc3"],
  best: { from: "b1", to: "c3" },
  thinking: false,
};

describe("visibleEngineLine", () => {
  it("prefers the repertoire ply over a shallow Nc3", () => {
    const line = visibleEngineLine({ san: "e4", plies: [{ from: "e2", to: "e4" }] }, nc3);
    expect(line.pv[0]).toBe("e4");
    expect(line.best).toEqual({ from: "e2", to: "e4" });
  });

  it("hides an off-book PV until the search is deep enough", () => {
    expect(visibleEngineLine(null, nc3)).toEqual({ pv: [], best: null });
    const deep = { ...nc3, depth: PV_MIN_DEPTH, pv: ["Nf3"], best: { from: "g1", to: "f3" } };
    expect(visibleEngineLine(null, deep).pv).toEqual(["Nf3"]);
  });

  it("keeps a book arrow even before the engine returns", () => {
    const line = visibleEngineLine({ san: "exd4", plies: [{ from: "e5", to: "d4" }] }, null);
    expect(line.pv).toEqual(["exd4"]);
    expect(line.best).toEqual({ from: "e5", to: "d4" });
  });
});
