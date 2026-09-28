/**
 * The signature moment's 3D stage (design/motion.md §1, approved at Gate 3).
 * A lit board plays the career line, 10…Bg4 detonates it from g4, and every square, frame part and
 * piece slows into a floating field around the name. One scene, drawn twice: by day under the
 * paper, by night under the black. Ported from design/motion/hero-3d.html.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gsap } from "gsap";
import { piece, MAT, sq, type PieceType } from "@/lib/three/pieces";
import { rng } from "@/lib/three/rng";
import line from "@/content/opening-line.json";

export const PLIES = line.plies;
type V3 = [number, number, number];

interface Obj {
  mesh: THREE.Object3D; kind: "tile" | "frame" | "piece"; size: number;
  p0: THREE.Vector3; q0: THREE.Quaternion; rest?: boolean;
  pf?: THREE.Vector3; axis?: THREE.Vector3; spin?: number; tilt?: THREE.Quaternion; lift?: number; bob?: [number, number, number];
  type?: PieceType; white?: boolean; dark?: boolean;
}

// ---- timing: the game accelerates 7% a move ----
const T_PLAY = 0.75;
const D = PLIES.map((_, i) => 0.21 * Math.pow(0.93, i));
const T_AT: number[] = []; { let t = T_PLAY; for (const d of D) { T_AT.push(t); t += d; } }
const T_END = T_AT[T_AT.length - 1] + D[D.length - 1];
export const T = { play: T_PLAY, blast: T_END + 0.28, paper: T_END + 1.13, name: T_END + 1.53, total: T_END + 4.73 };
const CHECKS = [15, 17].map((i) => T_AT[i] + D[i]); // 8…Bb4+ and 9…Bxd2+

function renderer(canvas: HTMLCanvasElement, exposure: number) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = exposure;
  r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
}

function grain(base: string, dark: string, seed: number) {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!, rr = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256); g.globalAlpha = 0.12;
  for (let i = 0; i < 90; i++) {
    g.strokeStyle = dark; g.lineWidth = 0.6 + rr() * 1.8; g.beginPath(); const y = rr() * 256; g.moveTo(0, y);
    for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 3 + (rr() - 0.5) * 2);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export interface Stage {
  render(t: number): void; resize(): void; ply(t: number): string; dispose(): void;
  /** Steps the drawing resolution down one notch (2 → 1.5 → 1). Returns false when already at the floor. */
  lower(): boolean;
}

export function createStage(dayCanvas: HTMLCanvasElement, nightCanvas: HTMLCanvasElement, mobile: boolean): Stage {
  const R = rng(11), scene = new THREE.Scene();
  const rDay = renderer(dayCanvas, 1), rNight = renderer(nightCanvas, 1.1);
  const pm = new THREE.PMREMGenerator(rDay), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = env; scene.environmentIntensity = 0.3;

  // lights: day under the paper, night under the black
  const day = new THREE.Group(), night = new THREE.Group(); scene.add(day, night);
  day.add(new THREE.HemisphereLight(0xffffff, 0xd8d5ce, 1.1));
  const sun = new THREE.DirectionalLight(0xfff8ee, 2.2); sun.position.set(-9, 16, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 }); day.add(sun);
  const spot = new THREE.SpotLight(0xfff0dc, 0, 0, 0.5, 0.55, 1.3); spot.position.set(2.5, 14, 8); spot.target.position.set(0.4, 0, 0);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0003; night.add(spot, spot.target);
  const floatKey = new THREE.DirectionalLight(0xffe9cf, 0), rim = new THREE.DirectionalLight(0x9fb4d8, 0);
  floatKey.position.set(10, 12, 12); rim.position.set(-12, 6, -10); night.add(floatKey, rim);
  const g4 = sq("g4"), amber = new THREE.PointLight(0xe8a33d, 0, 9, 1.6); amber.position.set(g4.x, 0.5, g4.z); night.add(amber);
  const nightHemi = new THREE.HemisphereLight(0x8a90a0, 0x2a2622, 0); night.add(nightHemi);

  // the board: rounded maple and walnut squares with a drawn grain, a walnut frame in eight parts
  const maple = new THREE.MeshPhysicalMaterial({ map: grain("#dccdb0", "#a88d69", 3), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const walnut = new THREE.MeshPhysicalMaterial({ map: grain("#5f3f2a", "#2e1c12", 5), roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const frameM = new THREE.MeshPhysicalMaterial({ map: grain("#4a3223", "#23160e", 9), roughness: 0.45, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  const hlLight = maple.clone(), hlDark = walnut.clone(); hlLight.color = new THREE.Color(0xf3c77f); hlDark.color = new THREE.Color(0xd9923a);
  const objs: Obj[] = [];
  const add = (mesh: THREE.Object3D, kind: Obj["kind"], size: number): Obj => {
    mesh.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(mesh); const o: Obj = { mesh, kind, size, p0: new THREE.Vector3(), q0: new THREE.Quaternion() }; objs.push(o); return o;
  };
  const tileGeo = new RoundedBoxGeometry(0.985, 0.16, 0.985, 3, 0.035), tiles: Record<string, Obj> = {};
  for (let f = 0; f < 8; f++) for (let k = 0; k < 8; k++) {
    const n = "abcdefgh"[f] + (k + 1), p = sq(n), dk = (f + k) % 2 === 0;
    const o = add(new THREE.Mesh(tileGeo, dk ? walnut : maple), "tile", 1); o.mesh.position.set(p.x, -0.08, p.z); o.dark = dk; tiles[n] = o;
  }
  const bar = new RoundedBoxGeometry(8.7, 0.28, 0.5, 3, 0.06), cap = new RoundedBoxGeometry(0.5, 0.3, 0.5, 3, 0.06);
  ([[0, 4.25, 0], [0, -4.25, 0], [4.25, 0, Math.PI / 2], [-4.25, 0, Math.PI / 2]] as V3[]).forEach(([x, z, ry]) => {
    const o = add(new THREE.Mesh(bar, frameM), "frame", 8.7); o.mesh.position.set(x, -0.12, z); o.mesh.rotation.y = ry;
  });
  [[4.25, 4.25], [4.25, -4.25], [-4.25, 4.25], [-4.25, -4.25]].forEach(([x, z]) => { const o = add(new THREE.Mesh(cap, frameM), "frame", 0.6); o.mesh.position.set(x, -0.11, z); });
  for (const o of objs) { o.p0.copy(o.mesh.position); o.q0.copy(o.mesh.quaternion); o.rest = true; }

  // the pieces, and where each stands after every ply ("x…" = taken, set beside the board)
  const pieces: Obj[] = [];
  "rnbqkbnr/pppppppp/......../......../......../......../PPPPPPPP/RNBQKBNR".split("/").forEach((row, i) => [...row].forEach((ch, f) => {
    if (ch === ".") return;
    const w = ch === ch.toUpperCase(), t = ch.toUpperCase() as PieceType, m = piece(t, w ? MAT.ivory() : MAT.ebony());
    const o = add(m, "piece", t === "P" ? 0.6 : 1.4); o.type = t; o.white = w; pieces.push(o);
    (o as Obj & { sq: string }).sq = "abcdefgh"[f] + (8 - i);
  }));
  const state: string[][] = [pieces.map((o) => (o as Obj & { sq: string }).sq)];
  { const where = new Map(pieces.map((o) => [(o as Obj & { sq: string }).sq, o])), taken = { w: 0, b: 0 };
    for (const pl of PLIES) {
      const cur = state[state.length - 1].slice(), mover = where.get(pl.from)!;
      if (pl.cap) { const c = where.get(pl.cap)!, s = c.white ? "w" : "b"; cur[pieces.indexOf(c)] = `x${s}${taken[s]++}`; where.delete(pl.cap); }
      cur[pieces.indexOf(mover)] = pl.to; where.delete(pl.from); where.set(pl.to, mover); state.push(cur);
    } }
  const home = (s: string) => {
    if (s[0] === "x") { const w = s[1] === "w", n = +s.slice(2); return new THREE.Vector3(w ? 5.3 : -5.3, 0, (w ? 1 : -1) * (-2.5 + n * 0.9)); }
    const p = sq(s); return new THREE.Vector3(p.x, 0, p.z);
  };

  // cameras
  let W = dayCanvas.clientWidth, H = dayCanvas.clientHeight;
  const cam = new THREE.PerspectiveCamera(mobile ? 46 : 34, W / H, 0.1, 200);
  const C0: [V3, V3] = mobile ? [[0, 25, 13], [0, 0, 0.4]] : [[0, 17, 10.5], [0, 0, 0.2]];
  const C1: [V3, V3] = mobile ? [[5.6, 6.8, 9.8], [1.8, 0.3, 0]] : [[4.6, 4.3, 7.8], [1.5, 0.3, -0.2]];
  const C2: [V3, V3] = mobile ? [[0, 4, 23], [0, 3.2, 0]] : [[0, 3.4, 20], [0, 3.1, 0]];
  const final = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 200); final.position.set(...C2[0]); final.lookAt(...C2[1]); final.updateMatrixWorld();

  // where everything floats: layered like the owner's reference, clear of the name and of all small text
  const keep = mobile ? [[0, 0.36, 1, 0.61]] : [[0.02, 0.12, 0.97, 0.68]];
  const hard = mobile ? [[0, 0.84, 0.72, 0.99], [0, 0, 1, 0.07], [0.7, 0.95, 1, 1]]
    : [[0.02, 0.84, 0.3, 0.96], [0.54, 0.84, 0.76, 0.99], [0, 0, 0.3, 0.09], [0.9, 0, 1, 0.09], [0.88, 0.9, 1, 1]];
  const inR = (u: number, v: number, m: number) => ([a, b, c, d]: number[]) => u > a - m && u < c + m && v > b - m && v < d + m;
  const hits = (u: number, v: number, m: number, dist: number) => hard.some(inR(u, v, m)) || (dist < 24 && keep.some(inR(u, v, m)));
  const placeAt = (u: number, v: number, dist: number) => {
    const p = new THREE.Vector3(u * 2 - 1, 1 - v * 2, 0.5).unproject(final), dir = p.sub(final.position).normalize();
    return final.position.clone().add(dir.multiplyScalar(dist));
  };
  const named: [PieceType, boolean, number, number, number][] = mobile
    ? [["K", true, 0.9, 0.76, 9], ["Q", false, 0.3, 0.29, 12], ["N", true, 0.84, 0.3, 11.5], ["R", false, 0.12, 0.72, 9.5]]
    : [["K", true, 0.43, 0.95, 6.4], ["Q", false, 0.92, 0.3, 7.4], ["N", true, 0.79, 0.93, 7.4], ["R", false, 0.46, 0.02, 10.5], ["B", false, 0.7, 0.05, 10]];
  const used = new Set<Obj>();
  for (const [t, w, u, v, d] of named) { const o = pieces.find((x) => x.type === t && x.white === w && !used.has(x))!; used.add(o); o.pf = placeAt(u, v, d); }
  for (const o of objs) {
    if (o.pf) continue;
    let u = 0, v = 0, d = 0, tries = 0;
    do { u = R() * 1.1 - 0.05; v = R() * 1.1 - 0.05; d = o.kind === "piece" ? 10 + R() * 12 : o.kind === "frame" && o.size > 1 ? 24 + R() * 14 : 13 + R() * 22; tries++; }
    while (tries < 400 && hits(u, v, Math.min(0.12, (o.size / d) * 0.9), d));
    o.pf = placeAt(u, v, d);
  }
  for (const o of objs) {
    o.axis = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize();
    o.spin = (o.kind === "piece" ? 0.6 : 1.4) * (R() * 2 + 1) * (R() < 0.5 ? -1 : 1);
    const k = o.kind === "piece" ? 1 : 2.4;
    o.tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler((R() - 0.5) * k, R() * 6.3, (R() - 0.5) * k));
    o.lift = 2 + R() * 3; o.bob = [0.05 + R() * 0.12, 0.35 + R() * 0.45, R() * 6.3];
  }

  const G4 = new THREE.Vector3(g4.x, 0, g4.z), UP = new THREE.Vector3(0, 1, 0), tmpQ = new THREE.Quaternion();
  const ease = gsap.parseEase("seam"), arrive = gsap.parseEase("arrive");
  const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  const arc = (u: number) => Math.sin(Math.PI * u) * 0.6, clamp = (x: number) => Math.min(1, Math.max(0, x));
  const knightYaw = (o: Obj) => (o.type === "N" ? (o.white ? Math.PI / 2 : -Math.PI / 2) : 0);
  const paper = new THREE.Color(0xf3f3f1), black = new THREE.Color(0x09090a), fogDay = new THREE.Fog(0xf3f3f1, 16, 44), fogNight = new THREE.Fog(0x09090a, 18, 48);
  let lastHl = "";

  const moving = (t: number) => { let k = -1, f = 0; for (let i = 0; i < PLIES.length; i++) if (t >= T_AT[i]) { k = i; f = Math.min(1, (t - T_AT[i]) / (D[i] * 0.85)); } return { k, f }; };

  function render(t: number) {
    const { k, f } = moving(t);
    const base = state[Math.max(0, k)], after = k >= 0 ? state[k + 1] : state[0];
    const hl = k >= 0 && f >= 1 ? [PLIES[k].from, PLIES[k].to] : k > 0 ? [PLIES[k - 1].from, PLIES[k - 1].to] : [];
    if (hl.join() !== lastHl) { lastHl = hl.join(); for (const n in tiles) (tiles[n].mesh as THREE.Mesh).material = hl.includes(n) ? (tiles[n].dark ? hlDark : hlLight) : (tiles[n].dark ? walnut : maple); }
    pieces.forEach((o, i) => {
      const a = home(base[i]), b = home(after[i]); o.p0.copy(a);
      if (a.distanceTo(b) > 0.01) { o.p0.lerpVectors(a, b, ease(f)); o.p0.y = after[i][0] === "x" ? arc(f) * 2 : arc(f) * (o.type === "N" ? 1.3 : 1); }
      o.q0.setFromEuler(new THREE.Euler(0, knightYaw(o), 0));
    });
    // the blast: a shockwave from g4, then everything slows into a hover
    for (const o of objs) {
      const tau = t - T.blast - o.p0.distanceTo(G4) * 0.028;
      if (tau <= 0) { o.mesh.position.copy(o.p0); o.mesh.quaternion.copy(o.q0); continue; }
      const u = 1 - Math.exp(-3.1 * tau), bob = Math.sin(t * o.bob![1] + o.bob![2]) * o.bob![0] * Math.min(1, tau);
      o.mesh.position.lerpVectors(o.p0, o.pf!, u).addScaledVector(UP, o.lift! * 4 * u * (1 - u) + bob);
      tmpQ.setFromAxisAngle(o.axis!, o.spin! * (u * 2.2 + tau * 0.05)); o.mesh.quaternion.copy(o.q0).slerp(o.tilt!, u).multiply(tmpQ);
    }
    // the camera: high and wide, pushing in as the game tightens; a jolt on each check; blown back, then settling
    const push = ease(clamp((t - T_PLAY) / (T_END - T_PLAY))), settle = arrive(clamp((t - T.blast - 0.05) / 1.9));
    let pos = lerp3(C0[0], C1[0], push), look = lerp3(C0[1], C1[1], push);
    pos = lerp3(pos, C2[0], settle); look = lerp3(look, C2[1], settle);
    let shake = 0; for (const c of CHECKS) if (t > c) shake += 0.06 * Math.exp(-(t - c) * 14) * Math.sin((t - c) * 70);
    if (t > T.blast) shake += 0.22 * Math.exp(-(t - T.blast) * 7) * Math.sin((t - T.blast) * 55);
    cam.position.set(pos[0] + shake, pos[1] + shake * 0.6, pos[2]); cam.lookAt(...look);
    // light: the spot finds the board and narrows; g4 flashes amber; the float is keyed and rimmed
    const lit = arrive(clamp(t / 0.7)), after2 = clamp((t - T.blast) / 1.2);
    spot.intensity = 140 * lit * (1 - after2 * 0.7); spot.angle = 0.5 - 0.16 * push;
    amber.intensity = t > T_END - 0.05 ? 60 * Math.exp(-Math.max(0, t - T_END + 0.05) * 4) : 0;
    floatKey.intensity = 1.6 * after2; rim.intensity = 1.1 * after2; nightHemi.intensity = 0.5 + 0.1 * after2;
    day.visible = true; night.visible = false; scene.background = paper; scene.fog = fogDay; rDay.render(scene, cam);
    day.visible = false; night.visible = true; scene.background = black; scene.fog = t > T.blast ? fogNight : null; rNight.render(scene, cam);
  }

  function resize() {
    W = dayCanvas.clientWidth; H = dayCanvas.clientHeight;
    for (const r of [rDay, rNight]) r.setSize(W, H, false);
    cam.aspect = W / H; cam.updateProjectionMatrix();
  }
  resize();

  return {
    render, resize,
    lower() {
      const dpr = rDay.getPixelRatio(); if (dpr <= 1) return false;
      for (const r of [rDay, rNight]) r.setPixelRatio(Math.max(1, dpr - 0.5));
      resize(); return true;
    },
    ply: (t: number) => { if (t >= T.blast + 0.3) return ""; const { k, f } = moving(t); return f >= 1 ? PLIES[k].label : k > 0 ? PLIES[k - 1].label : ""; },
    dispose() {
      scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose()); } });
      env.dispose(); rDay.dispose(); rNight.dispose();
    },
  };
}
