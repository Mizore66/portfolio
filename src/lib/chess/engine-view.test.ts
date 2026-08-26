import { describe, expect, it } from "vitest";
import { PV_MIN_DEPTH, visibleEngineLine } from "./engine-view";
import type { SearchInfo } from "./engine";

const nc3: SearchInfo = {
  depth: 2,
  nodes: 100,
  nps: 1000,
  evalCp: 12,
  pv: ["Nc3"],
  best: { from: "b1", to: "c3" },
  thinking: false,
};

const book = { san: "exd4", plies: [{ from: "e5", to: "d4" }] };

describe("visibleEngineLine", () => {
  it("holds the PV until the search is deep enough, even on-book", () => {
    expect(visibleEngineLine(book, nc3)).toEqual({ pv: [], best: null });
    expect(visibleEngineLine(book, null)).toEqual({ pv: [], best: null });
  });

  it("prefers the repertoire ply over Nc3 once depth is honest", () => {
    const deep = { ...nc3, depth: PV_MIN_DEPTH, pv: ["Nc3"], best: { from: "b1", to: "c3" } };
    const line = visibleEngineLine({ san: "e4", plies: [{ from: "e2", to: "e4" }] }, deep);
    expect(line.pv[0]).toBe("e4");
    expect(line.best).toEqual({ from: "e2", to: "e4" });
  });

  it("shows an off-book PV only when deep", () => {
    expect(visibleEngineLine(null, nc3)).toEqual({ pv: [], best: null });
    const deep = { ...nc3, depth: PV_MIN_DEPTH, pv: ["Nf3"], best: { from: "g1", to: "f3" } };
    expect(visibleEngineLine(null, deep).pv).toEqual(["Nf3"]);
  });
});
