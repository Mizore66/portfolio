import { describe, it, expect } from "vitest";
import { lineClip } from "./sweep";

const pts = (css: string) => css.slice(8, -1).split(", ").map((p) => p.split(" ").map((v) => parseFloat(v)));

describe("a leaving line's clip", () => {
  const line = { x: 100, y: 200, w: 300, h: 40 };
  it("is cut to the line's own box, not the half screen", () => {
    const side: [number, number][] = [[-400, -400], [250, -400], [250, 1400], [-400, 1400]]; // the light side, seam at x 250
    const p = pts(lineClip(side, line));
    expect(p).toHaveLength(8);
    for (const [x, y] of p) { expect(x).toBeGreaterThanOrEqual(-2); expect(x).toBeLessThanOrEqual(150); expect(y).toBeGreaterThanOrEqual(-2); expect(y).toBeLessThanOrEqual(42); }
  });
  it("is empty, still in 8 points, where the line is wholly on the other side", () => {
    const p = pts(lineClip([[600, -400], [2000, -400], [2000, 1400], [600, 1400]], line));
    expect(p).toHaveLength(8);
    expect(new Set(p.map((q) => q.join()))).toHaveProperty("size", 1);
  });
});
