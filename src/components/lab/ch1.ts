/**
 * 01, Two evaluators (key frames lab2-1, lab2-1-m; motion.md §11). Day: PeSTO's knight table as 64 terrain columns,
 * each as tall as a knight is worth on its square, rising from the floor rank by rank from a1; the knight lands on
 * f6 last. Night: the learned knight, its copper circuit lighting from the base upward. The seam holds at 50%.
 */
import * as THREE from "three";
import { piece, MAT } from "@/lib/three/pieces";
import { learnedKnight } from "@/lib/three/sculptures";
import DATA from "@/content/lab-data.json";
import { stage, frame, size, toScreen, compile, disposeStage, span, arrive, type ChapterFactory, type Frame, type Tag } from "./kit";
import { piecesReady } from "@/lib/three/pieces";

const V = DATA.pestoKnightMg as number[], LO = Math.min(...V), HI = Math.max(...V);
const hgt = (x: number) => 0.14 + ((x - LO) / (HI - LO)) * 2.4;
const DAY: Record<string, Frame> = {
  desk: { pos: [-14.2, 15.6, 22.4], look: [0, 0.9, 0], fov: 30, off: [0.255, -0.13] },
  phone: { pos: [-27, 29.5, 42.5], look: [0, 0.9, 0], fov: 30, off: [0.02, 0.178] },
};
const NIGHT: Record<string, Frame> = {
  desk: { pos: [1.2, 3.3, 13.5], look: [0, 2.05, 0], fov: 26, off: [-0.23, -0.1] },
  phone: { pos: [1.2, 3, 25], look: [0, 1.7, 0], fov: 26, off: [0, -0.19] },
};

export const chapter1: ChapterFactory = function* (dayCanvas, nightCanvas, o) {
  const k = o.phone ? "phone" : "desk";
  // day: the terrain
  const d = yield* stage(dayCanvas, { exposure: 1, env: 0.5, bg: 0xf3f3f1 });
  d.scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d5ce, 0.9));
  const sun = new THREE.DirectionalLight(0xfff8ee, 2.6); sun.position.set(-12, 9, 3); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 5; sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); d.scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0xeceae5, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; d.scene.add(floor);
  const lm = MAT.porcelain(), dm = new THREE.MeshPhysicalMaterial({ color: 0xb3ada2, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
  const box = new THREE.BoxGeometry(0.94, 1, 0.94);
  const cols: { m: THREE.Mesh; h: number; at: number }[] = [];
  for (let rk = 0; rk < 8; rk++) for (let f = 0; f < 8; f++) {
    const h = hgt(V[rk * 8 + f]), m = new THREE.Mesh(box, (f + rk) % 2 === 0 ? dm : lm);
    m.position.set(f - 3.5, 0, 4.5 - (rk + 1)); m.castShadow = m.receiveShadow = true; d.scene.add(m);
    cols.push({ m, h, at: (rk * 8 + f) / 64 }); // a1 first, rank by rank
  }
  yield* piecesReady(); const knight = piece("N", MAT.ivory()); knight.rotation.y = 0.5; d.scene.add(knight); yield;
  const F6 = new THREE.Vector3(1.5, hgt(129), -1.5);

  // night: the learned knight
  const n = nightCanvas ? yield* stage(nightCanvas, { exposure: 1.1, env: 0.06, bg: 0x0b0e14 }) : null;
  const glow: THREE.MeshStandardMaterial[] = [];
  if (n) {
    const kn = learnedKnight(); kn.scale.setScalar(2.6); kn.rotation.y = -0.28; n.scene.add(kn); yield;
    // each copper run gets its own material, ordered from the base up, so the circuit can light in that order
    const runs: { m: THREE.Mesh; y: number }[] = [];
    kn.traverse((x) => { const m = x as THREE.Mesh; if (m.isMesh && m.material === kn.userData.circuit) { m.geometry.computeBoundingBox(); runs.push({ m, y: m.geometry.boundingBox!.min.y }); } });
    runs.sort((a, b) => a.y - b.y).forEach(({ m }) => { const c = (m.material as THREE.MeshStandardMaterial).clone(); c.emissive = new THREE.Color(0xe07a2c); c.emissiveIntensity = 0; m.material = c; glow.push(c); });
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0e121a, roughness: 0.85 }));
    fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; n.scene.add(fl);
    const key = new THREE.SpotLight(0xfff0dc, 230, 0, 0.34, 0.7, 1.4); key.position.set(4.5, 9, 6); key.target.position.set(0, 1.9, 0);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -0.0003; n.scene.add(key, key.target);
    const rim = new THREE.SpotLight(0x9fb4d8, 90, 0, 0.4, 0.8, 1.4); rim.position.set(-5, 6, -6); rim.target.position.set(0, 2, 0); n.scene.add(rim, rim.target);
  }
  const stages = n ? [d, n] : [d], c = compile(stages);
  let p = 1;
  const place = () => { size(d); frame(d, DAY[k]); if (n) { size(n); frame(n, NIGHT[k]); } };
  place();

  return {
    ready: c.ready,
    progress(v) {
      p = o.reduced ? 1 : v;
      // the columns rise over the first 60% of the scroll, 12 ms apart as a steady scroll reads them
      for (const col of cols) { const t = arrive(span(p, col.at * 0.45, col.at * 0.45 + 0.15)); col.m.scale.y = Math.max(0.001, col.h * t); col.m.position.y = (col.h * t) / 2; }
      const land = arrive(span(p, 0.62, 0.74)); knight.position.set(F6.x, F6.y + (1 - land) * 2.2, F6.z); knight.visible = land > 0;
      // the circuit lights from the base upward, each run in turn, and settles back to plain copper (the key frame)
      glow.forEach((g, i) => { const t0 = 0.15 + (i / glow.length) * 0.45; g.emissiveIntensity = 0.8 * arrive(span(p, t0, t0 + 0.08)) * (1 - arrive(span(p, t0 + 0.12, 0.92))); });
    },
    seam: () => 0.5,
    tags(): Tag[] {
      if (p < 0.74) return [];
      const f6 = toScreen(d, new THREE.Vector3(F6.x, F6.y + (o.phone ? 0.7 : 1.45), F6.z)), a8 = toScreen(d, new THREE.Vector3(-3.5, hgt(-167) + 0.1, -3.5));
      return [{ key: "f6", ...f6, html: "f6 &nbsp;+129", cls: o.phone ? "side" : "" }, { key: "a8", ...a8, html: "a8 &nbsp;−167" }];
    },
    render() { if (!c.done()) return; place(); d.r.render(d.scene, d.cam); if (n) n.r.render(n.scene, n.cam); },
    resize: place,
    dispose() { c.ready.then(() => stages.forEach(disposeStage)); },
  };
};
