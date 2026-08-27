import { describe, expect, it } from "vitest";
import {
  getNode,
  isOpeningId,
  isSingleMainlineAdvance,
  issueChapters,
  layoutTree,
  nextMainlineBook,
  pathIdSet,
  todaysPuzzle,
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

  it("forks variations right on the next rank", () => {
    const { positions } = layoutTree(OPENING_NODES);
    expect(positions.alekhine.x).toBeGreaterThan(positions.e4.x);
    expect(positions.alekhine.y).toBe(positions.e5.y);

    expect(positions.elephant.x).toBeGreaterThan(positions.nf3.x);
    expect(positions.philidor.x).toBeGreaterThan(positions.elephant.x);
    expect(positions.elephant.y).toBe(positions.nc6.y);
    expect(positions.philidor.y).toBe(positions.nc6.y);

    expect(positions.closed.x).toBeGreaterThan(positions.d4.x);
    expect(positions.bb6.x).toBeGreaterThan(positions.closed.x);
    expect(positions.closed.y).toBe(positions.exd4.y);
    expect(positions.bb6.y).toBe(positions.exd4.y);
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
    expect(isSingleMainlineAdvance("e4", "alekhine")).toBe(false);
    expect(isSingleMainlineAdvance("e4", "e4")).toBe(false);
  });

  it("path-to-root includes the sideline, not the unused fork", () => {
    const path = pathIdSet("alekhine");
    expect(path.has("start")).toBe(true);
    expect(path.has("e4")).toBe(true);
    expect(path.has("alekhine")).toBe(true);
    expect(path.has("e5")).toBe(false);
    expect(path.has("nf3")).toBe(false);
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

describe("art taxonomy", () => {
  it("leaves connective moves without plates, figures, clippings, or diagrams", () => {
    for (const id of ["e5", "exd4", "re1"]) {
      const n = getNode(id);
      expect(n.plate).toBeUndefined();
      expect(n.figure).toBeUndefined();
      expect(n.clipping).toBeUndefined();
      expect(n.inlineDiagram).toBeFalsy();
      expect(n.impression).toBeUndefined();
    }
  });

  it("gives career chapters clippings or project patents, not role sheets, and drops the life lane", () => {
    expect(OPENING_NODES.some((n) => n.id === "hike" || n.id === "club")).toBe(false);
    expect(getNode("nf3").figure).toBeUndefined();
    expect(getNode("nc6").figure).toBeUndefined();
    expect(getNode("bc4").figure).toBeUndefined();
    expect(getNode("e4").figure).toBeUndefined();
    expect(getNode("oo").figure).toBeUndefined();
    expect(getNode("e4").inlineDiagram).toBe(true);
    expect(getNode("oo").inlineDiagram).toBe(true);
    expect(getNode("d4").plate).toBeTruthy();
    expect(getNode("d4").figure).toBeTruthy();
    expect(getNode("d4").inlineDiagram).toBe(true);
    expect(getNode("start").commentary).toMatch(/game I've played since I was a teenager/);
  });

  it("files every project plate on the scoresheet, including variation parentheticals", () => {
    expect(getNode("alekhine").plate?.src).toBe("/plates/plate-risk.jpg");
    expect(getNode("elephant").plate?.src).toBe("/plates/plate-leads.jpg");
    expect(getNode("bc5").plate?.src).toBe("/plates/plate-circuitmind.jpg");
    expect(getNode("nf6").plate?.src).toBe("/plates/plate-mirrorfi.jpg");
    expect(getNode("d4").plate?.src).toBe("/plates/plate-veridian.jpg");
    expect(getNode("closed").plate?.src).toBe("/plates/plate-graphrag.jpg");
    expect(getNode("bb6").plate?.src).toBe("/plates/plate-slm.jpg");
  });

  it("files an artist's impression on the declined startup, not a retrospect hed", () => {
    expect(getNode("philidor").impression?.src).toBe("/plates/impression-philidor.jpg");
    expect(getNode("philidor").impression?.caption).toMatch(/artist's impression/i);
  });

  it("files news-clippings on education and the three employer roles", () => {
    expect(getNode("e4").clipping?.headline).toMatch(/HONOURS FOR ASPIRING MONASH ENGINEERING CANDIDATE/);
    expect(getNode("nf3").clipping?.headline).toMatch(/PETRONAS RETAINS YOUNG TALENT ON THE PIPELINE DESIGN TEAM/);
    expect(getNode("nc6").clipping?.headline).toMatch(/SETEL RECRUITS NEW HANDS ON THE PAYMENT ENGINE/);
    expect(getNode("bc4").clipping?.headline).toMatch(/WESTERN DIGITAL NEWEST ADDITION FOR THE LAB FLOOR/);
    expect(getNode("oo").clipping).toBeUndefined();
  });

  it("files today's puzzle on a scoresheet node, not a hardcoded id", () => {
    const puzzle = todaysPuzzle();
    expect(puzzle?.puzzle?.target).toBe("d4");
  });
});
