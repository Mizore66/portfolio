/**
 * 05, Gate C: the match (key frames lab2-5a, lab2-5b and their phone versions; motion.md §11; prototype
 * design/motion/gatec.html). 128 stones, the real results in game order, drop into three heaps (wins, draws,
 * losses), each falling for 420 ms of the prototype's timeline. The seam glides between checkpoints, the running
 * score after every 16th game, eased with the house "seam" curve, from 50% to 30.5%. The same scene on both sides.
 */
import * as THREE from "three";
import { gsap } from "gsap";
import { registerEases } from "@/lib/motion/ease";
import { MAT } from "@/lib/three/pieces";
import { content } from "@/content/site";
import DATA from "@/content/lab-data.json";
import { stage, frame, size, toScreen, compile, disposeStage, span, type ChapterFactory, type Frame, type Stage, type Tag } from "./kit";
import { type Steps } from "@/lib/three/steps";

type K = "w" | "d" | "l";
const R = DATA.gateC.games as number[], WDL = DATA.gateC.wdl as Record<K, number>;
const COPY = (content.pageCopy as unknown as { lab: { chapters: { piles: Record<K, string>; counter: string[] }[] } }).lab.chapters[4];

interface Pile { key: K; x: number; z?: number; seed: number }
const PILES: Pile[] = [{ key: "w", x: -5.6, seed: 3 }, { key: "d", x: 0, seed: 5 }, { key: "l", x: 5.8, seed: 9 }];
const MPILES: Pile[] = [{ key: "w", x: -2.95, z: 3.6, seed: 3 }, { key: "d", x: 0, z: -3.4, seed: 5 }, { key: "l", x: 2.45, z: 3.8, seed: 9 }];
const CAM: Record<string, Frame> = {
  desk: { pos: [0, 11.5, 31], look: [0, 1.2, 0], fov: 28, off: [-0.16, -0.1] },
  phone: { pos: [0, 27, 31], look: [0, 0, 0.2], fov: 36, off: [0, -0.235] },
};

// match.js: a stone is a flattened sphere; a heap is built by dropping stones that slide to the lowest nearby rest
const rng = (seed = 1) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const SR = 0.5, ST = 0.21;
interface Rest { x: number; y: number; z: number; rx: number; ry: number; rz: number }
function heap(n: number, seed: number): Rest[] {
  const r = rng(seed), out: Rest[] = [], spread = 1.5 + 0.15 * Math.sqrt(n);
  const settle = (x: number, z: number) => { let y = ST; for (const s of out) { const q = Math.hypot(s.x - x, s.z - z); if (q < 2 * SR * 0.92) y = Math.max(y, s.y + 2 * ST * (1 - (q / (2 * SR)) ** 2) * 0.9); } return y; };
  for (let k = 0; k < n; k++) {
    let best: { x: number; y: number; z: number } | null = null;
    for (let c = 0; c < 7; c++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * spread, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.8, y = settle(x, z); if (!best || y < best.y) best = { x, y, z }; }
    const tilt = Math.min(0.45, (best!.y - ST) * 0.35);
    out.push({ ...best!, rx: (r() - 0.5) * tilt, rz: (r() - 0.5) * tilt, ry: r() * 6 });
  }
  return out;
}

// gatec.html's timeline: game k lands at land[k] (a steady scroll, a little faster at the end), after falling FALL from H0
const T0 = 0.9, T1 = 8.4, FALL = 0.42, H0 = 7.5, EVERY = 16, DROP_END = 0.85;
const key = (s: number): K => (s === 1 ? "w" : s === 0 ? "l" : "d");
const land = R.map((_, k) => T0 + (T1 - T0) * Math.pow((k + 1) / R.length, 0.92));
const idxIn: number[] = []; { const c = { w: 0, d: 0, l: 0 }; R.forEach((s, k) => { idxIn[k] = c[key(s)]++; }); }
const CP = [{ t: land[0], v: 0.5 }];
for (let n = EVERY; n <= R.length; n += EVERY) CP.push({ t: land[n - 1], v: R.slice(0, n).reduce((a, b) => a + b, 0) / n });
/** the prototype's clock at progress p: the first stone starts falling at p = 0, the last lands at p = DROP_END */
const clock = (p: number) => (p >= DROP_END ? T1 + 0.3 : T0 - FALL + (T1 - (T0 - FALL)) * span(p, 0, DROP_END));

export const chapter5: ChapterFactory = function* (dayCanvas, nightCanvas, o) {
  registerEases();
  const seamEase = gsap.parseEase("seam");
  const seamAt = (t: number) => { // glide from checkpoint to checkpoint, each glide spanning the games between them
    if (t <= CP[0].t) return CP[0].v;
    for (let i = 1; i < CP.length; i++) if (t < CP[i].t) { const a = CP[i - 1], b = CP[i], u = (t - a.t) / (b.t - a.t); return a.v + (b.v - a.v) * seamEase(u); }
    return CP[CP.length - 1].v;
  };
  const lastCp = (t: number) => CP.filter((c, i) => i && c.t <= t).at(-1);

  const k = o.phone ? "phone" : "desk", piles = o.phone ? MPILES : PILES;
  const STONE = new THREE.SphereGeometry(0.5, 48, 24).scale(1, 0.42, 1);
  const rests = Object.fromEntries(piles.map((pl) => [pl.key, heap(WDL[pl.key], pl.seed)])) as Record<K, Rest[]>;

  type Side = { s: Stage; heaps: Record<K, THREE.InstancedMesh> };
  const build = function* (canvas: HTMLCanvasElement, day: boolean): Steps<Side> {
    const bg = day ? 0xf3f3f1 : 0x0b0e14, s = yield* stage(canvas, { exposure: day ? 1 : 1.12, env: day ? 0.45 : 0.12, bg, fov: CAM[k].fov });
    s.cam.far = 200; s.scene.fog = new THREE.Fog(bg, 40, 90);
    s.scene.add(new THREE.HemisphereLight(day ? 0xffffff : 0x26324a, day ? 0xd8d5ce : 0x05070a, day ? 0.7 : 0.5));
    const lt = day ? new THREE.DirectionalLight(0xfffaf2, 2.8) : new THREE.SpotLight(0xfff0dc, 430, 0, 0.5, 0.8, 1.3); lt.position.set(-3, 17, 9);
    if (day) Object.assign(lt.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 });
    lt.target.position.set(0, 0, 0); s.scene.add(lt.target);
    lt.castShadow = true; lt.shadow.mapSize.set(4096, 4096); lt.shadow.radius = 7; lt.shadow.bias = -0.0003; s.scene.add(lt);
    const rim = new THREE.DirectionalLight(day ? 0xffffff : 0x9fb4d8, day ? 0.4 : 0.9); rim.position.set(6, 4, -10); s.scene.add(rim);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: day ? 0xe8e6e0 : 0x0b0f16, roughness: 0.8 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.scene.add(floor);
    const mats: Record<K, THREE.Material> = {
      w: MAT.porcelain(),
      d: new THREE.MeshPhysicalMaterial({ color: 0x3b3e45, roughness: 0.78, clearcoat: 0, clearcoatRoughness: 0.4 }),
      l: new THREE.MeshPhysicalMaterial({ color: 0x16171a, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }),
    };
    const heaps = {} as Record<K, THREE.InstancedMesh>;
    for (const pl of piles) {
      const pz = pl.z ?? 0;
      const ring = new THREE.Mesh(new THREE.RingGeometry(2.55, 2.58, 128), new THREE.MeshBasicMaterial({ color: day ? 0x57534c : 0x8f98a8, transparent: true, opacity: 0.45 }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(pl.x, 0.005, pz); ring.scale.z = 0.8; s.scene.add(ring);
      const m = new THREE.InstancedMesh(STONE, mats[pl.key], Math.max(1, rests[pl.key].length)); m.count = 0;
      m.castShadow = m.receiveShadow = true; m.frustumCulled = false; s.scene.add(m); heaps[pl.key] = m;
    }
    return { s, heaps };
  };
  yield; const d = yield* build(dayCanvas, true), n = nightCanvas ? yield* build(nightCanvas, false) : null;
  const sides = n ? [d, n] : [d], stages = sides.map((x) => x.s), c = compile(stages);

  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1);
  let p = 1, t = clock(1), done = R.length;
  const place = () => sides.forEach((x) => { size(x.s); frame(x.s, CAM[k]); });
  const update = () => {
    t = clock(p); done = 0;
    const started: Record<K, number> = { w: 0, d: 0, l: 0 }, drops: Record<K, Record<number, number>> = { w: {}, d: {}, l: {} };
    R.forEach((s, g) => { const u = (t - (land[g] - FALL)) / FALL; if (u < 0) return; const kk = key(s); started[kk]++; drops[kk][idxIn[g]] = u >= 1 ? 0 : H0 * (1 - u * u); if (u >= 1) done++; });
    for (const pl of piles) {
      const list = rests[pl.key], pz = pl.z ?? 0, cnt = Math.min(started[pl.key], list.length);
      for (let i = 0; i < cnt; i++) {
        const s = list[i], dy = drops[pl.key][i] ?? 0;
        M.compose(V.set(pl.x + s.x, s.y + dy, pz + s.z), Q.setFromEuler(E.set(s.rx + dy * 0.12, s.ry + dy * 0.3, s.rz)), ONE);
        for (const x of sides) x.heaps[pl.key].setMatrixAt(i, M);
      }
      for (const x of sides) { x.heaps[pl.key].count = cnt; x.heaps[pl.key].instanceMatrix.needsUpdate = true; }
    }
  };
  place(); update();

  return {
    ready: c.ready,
    progress(v) { p = o.reduced ? 1 : v; update(); },
    seam: (v: number) => seamAt(clock(o.reduced ? 1 : v)),
    tags(): Tag[] {
      const all = done === R.length;
      return piles.map((pl) => {
        const at = toScreen(d.s, new THREE.Vector3(pl.x, 0, (pl.z ?? 0) + 2.8));
        return { key: pl.key, x: at.x, y: at.y + 14, html: all ? `${WDL[pl.key]} ${COPY.piles[pl.key]}` : COPY.piles[pl.key], cls: "p" };
      });
    },
    /** the prototype's counter: which game has landed, and the last checkpoint the seam has passed */
    counter() {
      const [game, of, after] = COPY.counter, c1 = lastCp(t);
      return `${game} ${Math.max(1, done)} ${of} ${R.length}` + (c1 ? ` · ${after} ${CP.indexOf(c1) * EVERY}: ${(c1.v * 100).toFixed(1)}%` : "");
    },
    /** 0 until the last stone has landed, then 1 at p = 1: the page swaps "Then the match." for the result on it */
    phase: () => span(o.reduced ? 1 : p, DROP_END, 1),
    render() { if (!c.done()) return; place(); for (const x of stages) x.r.render(x.scene, x.cam); },
    resize: place,
    dispose() { c.ready.then(() => stages.forEach(disposeStage)); },
  };
};
