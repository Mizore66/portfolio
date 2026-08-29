import { describe, expect, it } from "vitest";
import { toyNet } from "@/lib/chess/nnue/format";
import { searchSliceMs, type SearchJob } from "@/lib/chess/search-job";

describe("search worker job", () => {
  it("structured-clones a learned job the way postMessage will", () => {
    const net = toyNet(128, 3);
    const job: SearchJob = {
      type: "search",
      jobId: 7,
      plies: [{ from: "e2", to: "e4" }],
      side: "b",
      last: { from: "e2", to: "e4" },
      evalMode: "learned",
      net,
      maxDepth: 4,
      sliceMs: 400,
      showDepths: 8,
      budgetMs: 900,
      dwellMs: 0,
    };
    const wire = structuredClone(job);
    expect(wire.jobId).toBe(7);
    expect(wire.evalMode).toBe("learned");
    expect(wire.net?.id).toBe(net.id);
    expect(wire.net?.accSize).toBe(128);
    expect(wire.net?.ftW).toBeInstanceOf(Int16Array);
    expect(wire.net?.ftW).not.toBe(net.ftW);
    expect(wire.net?.ftW[0]).toBe(net.ftW[0]);
    expect(wire.plies[0]).toEqual({ from: "e2", to: "e4" });
  });

  it("gives painted depths a full slice after the race budget is spent", () => {
    expect(searchSliceMs(5, 980, 8, 900, 400)).toBe(400);
    expect(searchSliceMs(9, 980, 8, 900, 400)).toBe(16);
  });
});
