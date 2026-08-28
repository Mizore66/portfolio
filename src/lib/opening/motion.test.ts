import { describe, expect, it } from "vitest";
import { GLIDE_MS, STAGGER_MS, DEPTH_PAINT_MS, depthPaintMs, playDelayMs } from "./motion";

describe("playDelayMs", () => {
  it("outlasts the glide plus stagger so play cannot teleport", () => {
    expect(playDelayMs(1)).toBeGreaterThan(GLIDE_MS);
    expect(playDelayMs(2)).toBeGreaterThan(GLIDE_MS + STAGGER_MS);
  });
});

describe("depthPaintMs", () => {
  it("holds a beat between depths unless motion is reduced", () => {
    expect(depthPaintMs(false)).toBe(DEPTH_PAINT_MS);
    expect(depthPaintMs(true)).toBe(0);
  });
});
