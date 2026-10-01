import { describe, it, expect } from "vitest";
import type * as THREE from "three";
import { compileAsync } from "./env";

// A renderer with two materials compiling: `props` is three's per-material state, as dispose leaves it (no program).
function fake(lost = false) {
  const a = {}, b = {}, props = new Map<object, { currentProgram?: { isReady(): boolean } }>();
  let ready = false;
  props.set(a, { currentProgram: { isReady: () => ready } }); props.set(b, { currentProgram: { isReady: () => ready } });
  const r = {
    compile: () => new Set([a, b]),
    properties: { get: (m: object) => props.get(m) ?? {} },
    getContext: () => ({ isContextLost: () => lost }),
    extensions: { has: () => true },
  } as unknown as THREE.WebGLRenderer;
  return { r, a, props, finish: () => { ready = true; } };
}
const scene = {} as THREE.Scene, cam = {} as THREE.Camera;

describe("compileAsync", () => {
  it("settles once every program is ready", async () => {
    const f = fake(); const p = compileAsync(f.r)(scene, cam);
    setTimeout(f.finish, 30);
    await expect(p).resolves.toBe(scene);
  });
  it("does not throw when a material is disposed of while it compiles", async () => {
    const f = fake(); const p = compileAsync(f.r)(scene, cam);
    f.props.delete(f.a); // material.dispose(), mid-compile
    setTimeout(f.finish, 30);
    await expect(p).resolves.toBe(scene);
  });
  it("settles when the context is lost meanwhile", async () => {
    await expect(compileAsync(fake(true).r)(scene, cam)).resolves.toBe(scene);
  });
});
