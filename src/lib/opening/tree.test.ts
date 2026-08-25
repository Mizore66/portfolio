import { describe, expect, it } from "vitest";
import { layoutTree } from "./tree";
import { OPENING_NODES } from "@/content/opening";

describe("layoutTree", () => {
  it("puts the mainline on one horizontal staff", () => {
    const { positions, mainY } = layoutTree(OPENING_NODES);
    const main = OPENING_NODES.filter((n) => n.type === "mainline");
    for (const n of main) {
      expect(positions[n.id].y).toBe(mainY);
    }
    const xs = main.map((n) => positions[n.id].x);
    const sorted = [...xs].sort((a, b) => a - b);
    expect(xs).toEqual(sorted);
  });

  it("hangs branches off the parent move, not the next ply's column", () => {
    const { positions } = layoutTree(OPENING_NODES);
    expect(positions.hike.x).toBe(positions.e4.x);
    expect(positions.alekhine.x).toBe(positions.e4.x);
    expect(positions.elephant.x).toBe(positions.nf3.x);
    expect(positions.philidor.x).toBe(positions.nf3.x);
    expect(positions.club.x).toBe(positions.oo.x);

    expect(positions.hike.y).toBeLessThan(positions.e4.y);
    expect(positions.club.y).toBeLessThan(positions.oo.y);
    expect(positions.alekhine.y).toBeGreaterThan(positions.e4.y);
    expect(positions.elephant.y).toBeGreaterThan(positions.nf3.y);
    expect(positions.philidor.y).toBeGreaterThan(positions.elephant.y);
  });
});
