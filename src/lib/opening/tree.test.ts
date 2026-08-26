import { describe, expect, it } from "vitest";
import { isOpeningId, isSingleMainlineAdvance, layoutTree, pathIdSet } from "./tree";
import { OPENING_NODES, ROOT_ID } from "@/content/opening";

describe("layoutTree", () => {
  it("grows the mainline down a single trunk", () => {
    const { positions, trunkX } = layoutTree(OPENING_NODES);
    const main = OPENING_NODES.filter((n) => n.type === "mainline");
    for (const n of main) {
      expect(positions[n.id].x).toBe(trunkX);
    }
    const ys = main.map((n) => positions[n.id].y);
    const sorted = [...ys].sort((a, b) => a - b);
    expect(ys).toEqual(sorted);
  });

  it("forks life left and variations right on the next rank", () => {
    const { positions } = layoutTree(OPENING_NODES);
    expect(positions.hike.x).toBeLessThan(positions.e4.x);
    expect(positions.alekhine.x).toBeGreaterThan(positions.e4.x);
    expect(positions.hike.y).toBe(positions.e5.y);
    expect(positions.alekhine.y).toBe(positions.e5.y);

    expect(positions.elephant.x).toBeGreaterThan(positions.nf3.x);
    expect(positions.philidor.x).toBeGreaterThan(positions.elephant.x);
    expect(positions.elephant.y).toBe(positions.nc6.y);
    expect(positions.philidor.y).toBe(positions.nc6.y);

    expect(positions.club.x).toBeLessThan(positions.oo.x);
    expect(positions.club.y).toBe(positions.nf6.y);
  });

  it("accepts only known node ids", () => {
    expect(isOpeningId(ROOT_ID)).toBe(true);
    expect(isOpeningId("d4")).toBe(true);
    expect(isOpeningId("not-a-node")).toBe(false);
  });
});

describe("single mainline advance", () => {
  it("is true only for one trunk ply", () => {
    expect(isSingleMainlineAdvance("start", "e4")).toBe(true);
    expect(isSingleMainlineAdvance("e4", "e5")).toBe(true);
    expect(isSingleMainlineAdvance("start", "d4")).toBe(false);
    expect(isSingleMainlineAdvance("e4", "hike")).toBe(false);
    expect(isSingleMainlineAdvance("e4", "e4")).toBe(false);
  });

  it("path-to-root includes the sideline, not the unused fork", () => {
    const path = pathIdSet("hike");
    expect(path.has("start")).toBe(true);
    expect(path.has("e4")).toBe(true);
    expect(path.has("hike")).toBe(true);
    expect(path.has("e5")).toBe(false);
    expect(path.has("alekhine")).toBe(false);
  });
});
