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
  it("grays a shallow on-book line instead of holding a blank PV", () => {
    const line = visibleEngineLine(book, nc3);
    expect(line.settling).toBe(true);
    expect(line.pv[0]).toBe("exd4");
    expect(line.best).toEqual({ from: "e5", to: "d4" });
    expect(visibleEngineLine(book, null)).toEqual({ pv: [], best: null, settling: false });
  });

  it("prefers the repertoire ply over Nc3 once depth is honest", () => {
    const deep = { ...nc3, depth: PV_MIN_DEPTH, pv: ["Nc3"], best: { from: "b1", to: "c3" } };
    const line = visibleEngineLine({ san: "e4", plies: [{ from: "e2", to: "e4" }] }, deep);
    expect(line.settling).toBe(false);
    expect(line.pv[0]).toBe("e4");
    expect(line.best).toEqual({ from: "e2", to: "e4" });
  });

  it("shows an off-book shallow PV as settling, then the deep line", () => {
    const shallow = visibleEngineLine(null, nc3);
    expect(shallow.settling).toBe(true);
    expect(shallow.pv).toEqual(["Nc3"]);
    const deep = { ...nc3, depth: PV_MIN_DEPTH, pv: ["Nf3"], best: { from: "g1", to: "f3" } };
    expect(visibleEngineLine(null, deep).pv).toEqual(["Nf3"]);
    expect(visibleEngineLine(null, deep).settling).toBe(false);
  });
});
