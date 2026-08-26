import { describe, expect, it } from "vitest";
import {
  isOpeningId,
  isSingleMainlineAdvance,
  issueChapters,
  layoutTree,
  nextMainlineBook,
  pathIdSet,
  TREE_NODE_W,
} from "./tree";
import { OPENING_NODES, ROOT_ID } from "@/content/opening";

describe("layoutTree", () => {
  it("grows the mainline down a single trunk", () => {
    const { positions, trunkX, height } = layoutTree(OPENING_NODES);
    const main = OPENING_NODES.filter((n) => n.type === "mainline");
    for (const n of main) {
      expect(positions[n.id].x).toBe(trunkX);
    }
    const ys = main.map((n) => positions[n.id].y);
    const sorted = [...ys].sort((a, b) => a - b);
    expect(ys).toEqual(sorted);
    const lastY = ys[ys.length - 1];
    expect(height - lastY).toBeLessThanOrEqual(32);
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

  it("keeps every node inside a newspaper-column canvas", () => {
    const { width, positions } = layoutTree(OPENING_NODES);
    expect(width).toBeLessThanOrEqual(480);
    for (const point of Object.values(positions)) {
      expect(point.x - TREE_NODE_W / 2).toBeGreaterThanOrEqual(0);
      expect(point.x + TREE_NODE_W / 2).toBeLessThanOrEqual(width);
    }
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

describe("repertoire book and issue index", () => {
  it("seeds the next trunk ply so the engine never has to advertise Nc3", () => {
    expect(nextMainlineBook("start")).toEqual({ san: "e4", plies: [{ from: "e2", to: "e4" }] });
    expect(nextMainlineBook("d4")?.san).toBe("exd4");
    expect(nextMainlineBook("re1")).toBeNull();
  });

  it("lists White's six mainline chapters for the sticky rail", () => {
    expect(issueChapters().map((n) => n.id)).toEqual(["e4", "nf3", "bc4", "oo", "d4", "re1"]);
  });
});
