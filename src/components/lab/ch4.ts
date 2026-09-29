/**
 * 04, Gate A: check the referee (key frames lab2-4, lab2-4-m; motion.md §11). Handcrafted against itself over the
 * 50 openings, one board per opening, drawn as the key frame's `many` does: each piece type is one merged geometry
 * in an InstancedMesh, and so are the tiles and frames. The boards set up one after another, their pieces dropping
 * onto the squares, then a few pieces hop on every board at once, the 100 games playing fast. The seam holds at 50%.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { piece, MAT, type PieceType } from "@/lib/three/pieces";
import OPENINGS from "@/content/openings.json";
import { stage, frame, size, compile, disposeStage, span, arrive, clamp, type ChapterFactory, type Frame, type Stage } from "./kit";

const OP = OPENINGS as { fen: string }[];
const CAM: Record<string, Frame> = {
  desk: { pos: [0, 58, 96], look: [0, 0, -4], fov: 30, off: [0, 0.085] },
  phone: { pos: [0, 168, 96], look: [0, 0, -2], fov: 36, off: [0, -0.02] },
};
/** where each opening's board stands: ten across on desktop, five across on the phone */
const layout = (phone: boolean): [number, number][] => OP.map((_, i) => phone
  ? [((i % 5) - 2) * 10.6, (Math.floor(i / 5) - 4.5) * 10.6 * 1.06]
  : [((i % 10) - 4.5) * 11, (Math.floor(i / 10) - 2) * 11 * 1.05]);

// one merged geometry per piece type, as many.js builds it (every part of the piece, drawn in the piece's material).
// The pieces are seen a few px tall, so they use the set's `lod` (fewer segments round the axis, as the day hall does):
// 1,599 pieces at full detail would draw about 145 M vertices a frame, and as many again for the shadow.
const LOD = true;
const GEO: Partial<Record<PieceType, THREE.BufferGeometry>> = {};
function pieceGeo(t: PieceType) {
  if (GEO[t]) return GEO[t]!;
  const g = piece(t, MAT.ivory(), { lod: LOD }); g.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];
  g.traverse((x) => { const m = x as THREE.Mesh; if (!m.isMesh) return;
    let q = m.geometry.clone().applyMatrix4(m.matrixWorld); if (q.index) q = q.toNonIndexed(); q.deleteAttribute("uv"); parts.push(q); });
  return (GEO[t] = mergeGeometries(parts));
}
/** a small integer hash, so the hops are the same on every scroll */
const hash = (a: number, b: number, c: number) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };

const SET_END = 0.6, PLAY = [0.62, 0.96] as const, HOPS = 5, PER = 3;

export const chapter4: ChapterFactory = (dayCanvas, nightCanvas, o) => {
  const k = o.phone ? "phone" : "desk", at = layout(o.phone);
  const up = new THREE.Vector3(0, 1, 0), Q = new THREE.Quaternion(), HIDE = new THREE.Matrix4().makeScale(1e-4, 1e-4, 1e-4);
  // per board: its tiles (light and dark index ranges), its frame, and its pieces, each with its resting matrix
  type P = { mesh: number; i: number; rest: THREE.Matrix4 };
  const boards = at.map(([x, z], b) => ({ x, z, b, pieces: [] as P[], sb: -1, start: (b / (at.length - 1)) * (SET_END - 0.12) }));
  const tileL: THREE.Matrix4[] = [], tileD: THREE.Matrix4[] = [];
  for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) ((f + r) % 2 === 0 ? tileD : tileL).push(new THREE.Matrix4().makeTranslation(f - 3.5, -0.04, 4.5 - (r + 1)));
  const FR = new THREE.Matrix4().makeTranslation(0, -0.1, 0);
  const keys: string[] = [], counts: number[] = [];
  boards.forEach((bd) => {
    const M = new THREE.Matrix4().compose(new THREE.Vector3(bd.x, 0, bd.z), Q.setFromAxisAngle(up, 0), new THREE.Vector3(1, 1, 1));
    OP[bd.b].fen.split("/").forEach((row, i) => [...row].forEach((ch, f) => { if (ch === ".") return;
      const w = ch === ch.toUpperCase(), t = ch.toUpperCase(), key = t + (w ? "w" : "b");
      const L = new THREE.Matrix4().makeTranslation(f - 3.5, 0, 4.5 - (8 - i)).multiply(new THREE.Matrix4().makeRotationY(t === "N" ? (w ? Math.PI / 2 : -Math.PI / 2) : 0));
      let mi = keys.indexOf(key); if (mi < 0) { mi = keys.length; keys.push(key); counts.push(0); }
      bd.pieces.push({ mesh: mi, i: counts[mi]++, rest: M.clone().multiply(L) }); }));
  });

  const TILE = new THREE.BoxGeometry(1, 0.08, 1), FRAME = new THREE.BoxGeometry(8.9, 0.14, 8.9);
  type Side = { s: Stage; tl: THREE.InstancedMesh; td: THREE.InstancedMesh; fr: THREE.InstancedMesh; pc: THREE.InstancedMesh[] };
  const build = (canvas: HTMLCanvasElement, day: boolean): Side => {
    const bg = day ? 0xf3f3f1 : 0x0b0e14, s = stage(canvas, { exposure: day ? 1 : 1.1, env: day ? 0.5 : 0.08, bg, fov: CAM[k].fov });
    s.cam.far = o.phone ? 600 : 400;
    s.scene.fog = o.phone ? new THREE.Fog(bg, 220, 330) : new THREE.Fog(bg, 110, 190);
    s.scene.add(new THREE.HemisphereLight(day ? 0xffffff : 0x223048, day ? 0xd8d5ce : 0x05070a, day ? 0.8 : 0.35));
    const key = new THREE.DirectionalLight(day ? 0xfff8ee : 0xffe8cc, day ? 2.6 : 1.6); key.position.set(day ? -40 : 40, 60, 30); key.castShadow = true;
    key.shadow.mapSize.set(8192, 8192); key.shadow.bias = -0.0003;
    if (o.phone) Object.assign(key.shadow.camera, { left: -60, right: 60, top: 70, bottom: -70, near: 1, far: 220 });
    else { key.shadow.radius = 3; Object.assign(key.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, near: 1, far: 200 }); }
    s.scene.add(key);
    if (!day) at.forEach(([x, z], i) => { if (i % 3) return; const sp = new THREE.SpotLight(0xffe2b8, 900, 0, 0.16, 0.8, 1.6); sp.position.set(x + 6, 30, z + 8); sp.target.position.set(x, 0, z); s.scene.add(sp.target, sp); });
    const fs = o.phone ? 900 : 800;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(fs, fs), new THREE.MeshStandardMaterial({ color: day ? 0xe6e4de : 0x0d1118, roughness: day ? 0.9 : 0.35, metalness: day ? 0 : 0.2 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.17; floor.receiveShadow = true; s.scene.add(floor);
    const c = day ? { light: 0xe2d6bf, dark: 0x9c8468, frame: 0xb79e7c } : { light: 0xcfc3ab, dark: 0x7d6a55, frame: 0x8f7a5f };
    const white = MAT.ivory(), black = MAT.ebony();
    const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, n: number) => {
      const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = m.receiveShadow = true; m.frustumCulled = false; s.scene.add(m); return m;
    };
    return {
      s,
      tl: inst(TILE, new THREE.MeshStandardMaterial({ color: c.light, roughness: 0.55 }), tileL.length * boards.length),
      td: inst(TILE, new THREE.MeshStandardMaterial({ color: c.dark, roughness: 0.5 }), tileD.length * boards.length),
      fr: inst(FRAME, new THREE.MeshStandardMaterial({ color: c.frame, roughness: 0.5 }), boards.length),
      pc: keys.map((kk, i) => inst(pieceGeo(kk[0] as PieceType), kk[1] === "w" ? white : black, counts[i])),
    };
  };
  const d = build(dayCanvas, true), n = nightCanvas ? build(nightCanvas, false) : null;
  const sides = n ? [d, n] : [d], stages = sides.map((x) => x.s), c = compile(stages);

  // the drop and hop heights last written, so a scroll only rewrites what moved
  const last = boards.map((bd) => bd.pieces.map(() => NaN));
  const B = new THREE.Matrix4(), W = new THREE.Matrix4(), V = new THREE.Vector3(), S = new THREE.Vector3();
  let p = 1;
  const place = () => sides.forEach((x) => { size(x.s); frame(x.s, CAM[k]); });
  const update = () => {
    let dirty = false;
    const u = span(p, PLAY[0], PLAY[1]), env = clamp(u * 12) * clamp((1 - u) * 12);
    for (const bd of boards) {
      // the board lands first, growing to size, then its pieces drop onto their squares one after another
      const sb = arrive(span(p, bd.start, bd.start + 0.04));
      if (sb !== bd.sb) {
        bd.sb = sb; dirty = true;
        const sc = Math.max(1e-4, sb); B.compose(V.set(bd.x, 0, bd.z), Q.identity(), S.set(sc, sc, sc));
        for (const x of sides) {
          tileL.forEach((L, j) => x.tl.setMatrixAt(bd.b * tileL.length + j, W.multiplyMatrices(B, L)));
          tileD.forEach((L, j) => x.td.setMatrixAt(bd.b * tileD.length + j, W.multiplyMatrices(B, L)));
          x.fr.setMatrixAt(bd.b, W.multiplyMatrices(B, FR));
        }
      }
      // the games: every hop, a few pieces on each board lift and set down again (no per-game moves, a shimmer)
      const lift = new Map<number, number>();
      if (env > 0) for (let q = 0; q < PER; q++) {
        const ph = (hash(bd.b, q, 7) % 1000) / 1000, cyc = u * HOPS + ph, m = Math.floor(cyc), cc = cyc - m;
        if (cc < 0.4) lift.set(hash(bd.b, m, q) % bd.pieces.length, 0.5 * Math.sin((Math.PI * cc) / 0.4) * env);
      }
      const np = bd.pieces.length;
      bd.pieces.forEach((pc, j) => {
        const a = bd.start + 0.03 + (np > 1 ? j / (np - 1) : 0) * 0.05, t = span(p, a, a + 0.035);
        const h = t <= 0 ? -1 : (1 - t * t) * 2.4 + (lift.get(j) ?? 0);
        if (h === last[bd.b][j]) return;
        last[bd.b][j] = h; dirty = true;
        if (h < 0) W.copy(HIDE); else { W.copy(pc.rest); W.elements[13] += h; }
        for (const x of sides) x.pc[pc.mesh].setMatrixAt(pc.i, W);
      });
    }
    if (dirty) for (const x of sides) for (const m of [x.tl, x.td, x.fr, ...x.pc]) m.instanceMatrix.needsUpdate = true;
  };
  place(); update();

  return {
    ready: c.ready,
    progress(v) { p = o.reduced ? 1 : v; update(); },
    seam: () => 0.5,
    tags: () => [],
    render() { if (!c.done()) return; place(); for (const x of stages) x.r.render(x.scene, x.cam); },
    resize: place,
    dispose() { c.ready.then(() => stages.forEach(disposeStage)); },
  };
};
