// Art-directed environment maps (Phase 4, approved at Gate 4). Ported from design/assets/env.js.
// gallery: a black room with two narrow strips and a warm softbox.
import * as THREE from "three";

const panel = (w: number, h: number, c: number, i: number) =>
  new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));

function bake(r: THREE.WebGLRenderer, build: (s: THREE.Scene, box: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>) => void) {
  const s = new THREE.Scene(), box = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0xffffff }));
  build(s, box); s.add(box);
  const pm = new THREE.PMREMGenerator(r), t = pm.fromScene(s, 0.02).texture;
  pm.dispose();
  s.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
  return t;
}

export const galleryEnv = (r: THREE.WebGLRenderer) => bake(r, (s, box) => {
  box.material.color.set(0x050506);
  for (const x of [-4, 4]) { const st = panel(0.35, 9, 0xffffff, 6); st.position.set(x, 1, -9.9); s.add(st); }
  const sb = panel(3, 2, 0xffe2b8, 9); sb.position.set(-5, 5.5, 6); sb.lookAt(0, 0, 0); s.add(sb);
  const fl = panel(20, 20, 0x0e0e0f, 1); fl.position.y = -5.9; fl.rotation.x = -Math.PI / 2; s.add(fl);
});

export function renderer(canvas: HTMLCanvasElement, exposure: number) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = exposure;
  r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
}
