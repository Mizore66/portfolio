// Drawing a scene once before it is first seen, so its first real frame costs no more than any other.
import * as THREE from "three";
import { sliced, type Steps } from "./steps";
import { trace } from "@/lib/perf/trace";

type Scenes = { r: THREE.WebGLRenderer; scene: THREE.Scene }[];

/**
 * `draw` renders the scenes as usual, shadow pass included, but into one pixel, with each thing in them shown, none
 * of it culled, and each instanced mesh drawing one instance. So every program compiles and every buffer uploads
 * now, in idle time, not on the frame that first shows it: a scene warmed from its arrival camera skipped whatever
 * that camera did not see, and paid for it as the camera settled. Nothing in it is drawn beyond the one pixel (a
 * full frame of chapter 4's end state, two 8192² shadow maps of 1,599 pieces, is seconds for a software renderer).
 *
 * It is drawn a few objects at a time, one pass a slice (steps.ts): warming a whole scene in one go was a frame of
 * 40-155 ms. Each object is in one pass. `before` and `after` run around each pass (the Lab's chapters warm their end
 * state). The promise settles once every pass has been drawn.
 */
export function warmScenes(scenes: Scenes, draw: () => void, { before, after, name = "warm" }: { before?: () => void; after?: () => void; name?: string } = {}): Promise<void> {
  return sliced(warmSteps(scenes, draw, before, after), 8, name).done;
}

const PER_PASS = 6;
const what = (o: THREE.Object3D) => {
  const m = o as THREE.Mesh, mat = Array.isArray(m.material) ? m.material[0] : m.material;
  return `${m.geometry?.type ?? o.type}${(o as THREE.InstancedMesh).isInstancedMesh ? " ×" + (o as THREE.InstancedMesh).count : ""} (${mat?.type ?? "?"})`;
};

function* warmSteps(scenes: Scenes, draw: () => void, before?: () => void, after?: () => void): Steps<void> {
  const things: THREE.Object3D[] = [];
  for (const { scene } of scenes) scene.traverse((o) => { if ((o as THREE.Mesh).isMesh || (o as THREE.Line).isLine || (o as THREE.Points).isPoints) things.push(o); });
  for (let i = 0; i < things.length; i += PER_PASS) {
    const these = things.slice(i, i + PER_PASS), t0 = performance.now();
    pass(scenes, draw, new Set(these), before, after);
    const ms = performance.now() - t0;
    if (ms > 30) trace(`warm: ${Math.round(ms)} ms for ${these.map(what).join(", ")}`);
    yield;
  }
}

function pass(scenes: Scenes, draw: () => void, these: Set<THREE.Object3D>, before?: () => void, after?: () => void) {
  before?.();
  const shown: [THREE.Object3D, boolean, boolean][] = [], counts: [THREE.InstancedMesh, number][] = [];
  for (const { r, scene } of scenes) {
    scene.traverse((o) => {
      if ((o as THREE.Light).isLight) return; // a light shown or hidden changes every program
      const thing = (o as THREE.Mesh).isMesh || (o as THREE.Line).isLine || (o as THREE.Points).isPoints;
      shown.push([o, o.visible, o.frustumCulled]); o.visible = !thing || these.has(o); o.frustumCulled = false;
      const m = o as THREE.InstancedMesh;
      if (m.isInstancedMesh && these.has(m)) { counts.push([m, m.count]); m.count = Math.min(1, m.instanceMatrix.count); }
    });
    r.setScissorTest(true); r.setScissor(0, 0, 1, 1);
  }
  try { draw(); } finally {
    for (const [o, v, f] of shown) { o.visible = v; o.frustumCulled = f; }
    for (const [m, n] of counts) m.count = n;
    for (const { r } of scenes) { r.setScissorTest(false); r.shadowMap.needsUpdate = true; }
    after?.();
  }
}
