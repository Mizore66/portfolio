// Gate C: game results as stones dropped into three heaps (wins, draws, losses) on the dark side of the seam.
import { THREE, renderer, applyEnv, MAT } from "./chess3d.js";
import { rng } from "./rng.js";

const STONE = new THREE.SphereGeometry(.5, 48, 24).scale(1, .42, 1);
const R = .5, T = .21;

function heap(n, seed) {
  const r = rng(seed), out = [], spread = 1.5 + .15 * Math.sqrt(n);
  const settle = (x, z) => { let y = T; for (const s of out) { const q = Math.hypot(s.x - x, s.z - z); if (q < 2 * R * .92) y = Math.max(y, s.y + 2 * T * (1 - (q / (2 * R)) ** 2) * .9); } return y; };
  for (let k = 0; k < n; k++) {
    let best = null; // a dropped stone slides to the lowest of a few nearby rests
    for (let c = 0; c < 7; c++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * spread, x = Math.cos(a) * d, z = Math.sin(a) * d * .8, y = settle(x, z); if (!best || y < best.y) best = { x, y, z }; }
    const tilt = Math.min(.45, (best.y - T) * .35);
    out.push({ ...best, rx: (r() - .5) * tilt, rz: (r() - .5) * tilt, ry: r() * 6 });
  }
  return out;
}

export const PILES = [{ key: "w", x: -5.6, seed: 3 }, { key: "d", x: 0, seed: 5 }, { key: "l", x: 5.8, seed: 9 }];

export function matchScene(canvas, theme, { counts, falling = null, view, piles = PILES, camera = { pos: [0, 11.5, 31], look: [0, 1.2, 0], fov: 28 } }) {
  const day = theme === "day";
  const { r, envTex } = renderer(canvas, { exposure: day ? 1 : 1.12 }), scene = new THREE.Scene();
  const bg = day ? 0xf3f3f1 : 0x0b0e14; scene.background = new THREE.Color(bg); scene.fog = new THREE.Fog(bg, 40, 90); applyEnv(scene, envTex, day ? .45 : .12);
  scene.add(new THREE.HemisphereLight(day ? 0xffffff : 0x26324a, day ? 0xd8d5ce : 0x05070a, day ? .7 : .5));
  const key = day ? new THREE.DirectionalLight(0xfffaf2, 2.8) : new THREE.SpotLight(0xfff0dc, 430, 0, .5, .8, 1.3); key.position.set(-3, 17, 9); if (day) Object.assign(key.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 }); key.target.position.set(0, 0, 0); scene.add(key.target);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 7; key.shadow.bias = -.0003; scene.add(key);
  const rim = new THREE.DirectionalLight(day ? 0xffffff : 0x9fb4d8, day ? .4 : .9); rim.position.set(6, 4, -10); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: day ? 0xe8e6e0 : 0x0b0f16, roughness: .8 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const mats = { w: MAT.porcelain(), d: new THREE.MeshPhysicalMaterial({ color: 0x3b3e45, roughness: .78, clearcoat: 0, clearcoatRoughness: .4 }), l: new THREE.MeshPhysicalMaterial({ color: 0x16171a, roughness: .3, clearcoat: 1, clearcoatRoughness: .12 }) };
  const heaps = {};
  for (const p of piles) { const pz = p.z ?? 0;
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.55, 2.58, 128), new THREE.MeshBasicMaterial({ color: day ? 0x57534c : 0x8f98a8, transparent: true, opacity: .45 })); ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, .005, pz); ring.scale.z = .8; scene.add(ring);
    const list = heap(counts[p.key], p.seed), m = new THREE.InstancedMesh(STONE, mats[p.key], Math.max(1, list.length)); m.count = list.length;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
    list.forEach((s, i) => { M.compose(new THREE.Vector3(p.x + s.x, s.y, pz + s.z), Q.setFromEuler(E.set(s.rx, s.ry, s.rz)), one); m.setMatrixAt(i, M); });
    m.castShadow = m.receiveShadow = true; scene.add(m); heaps[p.key] = { m, list, x: p.x, z: pz };
  }
  if (falling) { const s = new THREE.Mesh(STONE, mats[falling.key]); { const f = piles.find((p) => p.key === falling.key); s.position.set(f.x, falling.y, f.z ?? 0); } s.rotation.set(.5, .3, -.35); s.castShadow = true; scene.add(s); }
  const cam = new THREE.PerspectiveCamera(camera.fov, innerWidth / innerHeight, .1, 200); cam.position.set(...camera.pos); cam.lookAt(...camera.look);
  cam.setViewOffset(innerWidth, innerHeight, view[0] * innerWidth, view[1] * innerHeight, innerWidth, innerHeight); cam.updateMatrixWorld();
  return { r, scene, cam, heaps };
}

/** Place stones 0..n-1 of a heap; `drop(i)` gives stone i's height above its rest (0 when landed). */
export function placeStones(h, n, drop = () => 0) {
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
  h.m.count = Math.min(n, h.list.length);
  for (let i = 0; i < h.m.count; i++) { const s = h.list[i], d = drop(i); M.compose(new THREE.Vector3(h.x + s.x, s.y + d, h.z + s.z), Q.setFromEuler(E.set(s.rx + d * .12, s.ry + d * .3, s.rz)), one); h.m.setMatrixAt(i, M); }
  h.m.instanceMatrix.needsUpdate = true;
}

export function pileTags(cam, labels, piles = PILES) {
  return piles.map((p) => { const v = new THREE.Vector3(p.x, 0, (p.z ?? 0) + 2.8).project(cam); return `<div class="tag p" style="left:${(v.x + 1) / 2 * innerWidth}px;top:${(1 - v.y) / 2 * innerHeight + 14}px">${labels[p.key]}</div>`; }).join("");
}
