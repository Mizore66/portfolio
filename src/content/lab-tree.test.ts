import { describe, expect, it } from "vitest";
import { clonePos, playUci, startPos, type EnginePos } from "@/lib/chess/engine";
import type { TreeNode } from "./lab-tree.gen";
import saved from "./lab-tree.json";

// The saved tree was drawn by labTree() (lab-tree.gen.ts). The search is time-sliced, so a rerun can differ in its
// quieter branches: what is checked is that every line in it is legal chess from the Play position.
describe("the Lab's opening tree", () => {
  it("is legal chess from 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5, nine plies deep at most", () => {
    const pos = startPos();
    for (const u of ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5"]) playUci(pos, u);
    let deepest = 0;
    const walk = (n: TreeNode, p: EnginePos, d: number) => {
      deepest = Math.max(deepest, d);
      expect(n.children.length).toBeLessThanOrEqual(3);
      for (const c of n.children) { const q = clonePos(p); expect(playUci(q, c.move), `${c.move} at depth ${d}`).toBe(true); walk(c, q, d + 1); }
    };
    walk(saved as TreeNode, pos, 0);
    expect(deepest).toBe(9);
    expect((saved as TreeNode).children[0].move).toBe("e1g1"); // the principal variation opens with castling
  });
});
