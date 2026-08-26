import { describe, expect, it } from "vitest";
import { GLIDE_MS, STAGGER_MS, playDelayMs } from "./motion";

describe("playDelayMs", () => {
  it("outlasts the glide plus stagger so play cannot teleport", () => {
    expect(playDelayMs(1)).toBeGreaterThan(GLIDE_MS);
    expect(playDelayMs(2)).toBeGreaterThan(GLIDE_MS + STAGGER_MS);
  });
});
