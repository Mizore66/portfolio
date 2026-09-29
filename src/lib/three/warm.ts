// Drawing a scene once before it is first seen, so its first real frame costs no more than any other.
import * as THREE from "three";

/**
 * `draw` renders the scenes as usual, shadow pass included, but into one pixel, with everything in them shown, none
 * of it culled, and each instanced mesh drawing one instance. So every program compiles and every buffer uploads
 * now, in idle time, not on the frame that first shows it: a scene warmed from its arrival camera skipped whatever
 * that camera did not see, and paid for it as the camera settled. Nothing in it is drawn beyond the one pixel (a
 * full frame of chapter 4's end state, two 8192² shadow maps of 1,599 pieces, is seconds for a software renderer).
 */
export function warmScenes(scenes: { r: THREE.WebGLRenderer; scene: THREE.Scene }[], draw: () => void) {
  const shown: [THREE.Object3D, boolean, boolean][] = [], counts: [THREE.InstancedMesh, number][] = [];
  for (const { r, scene } of scenes) {
    scene.traverse((o) => {
      if ((o as THREE.Light).isLight) return; // a light shown or hidden changes every program
      shown.push([o, o.visible, o.frustumCulled]); o.visible = true; o.frustumCulled = false;
      const m = o as THREE.InstancedMesh;
      if (m.isInstancedMesh) { counts.push([m, m.count]); m.count = Math.min(1, m.instanceMatrix.count); }
    });
    r.setScissorTest(true); r.setScissor(0, 0, 1, 1);
  }
  try { draw(); } finally {
    for (const [o, v, f] of shown) { o.visible = v; o.frustumCulled = f; }
    for (const [m, n] of counts) m.count = n;
    for (const { r } of scenes) { r.setScissorTest(false); r.shadowMap.needsUpdate = true; }
  }
}
