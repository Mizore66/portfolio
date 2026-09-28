// The chess set (Phase 4 assets, approved at Gate 4). Ported from design/keyframes/_shared/chess3d.js.
// Board: one square = 1 unit, centred on the origin. Files a..h run -x to +x; White sits at +z.
import * as THREE from "three";
export type { PieceType };
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";


type Pt = [number, number];
type PieceType = "P" | "N" | "B" | "R" | "Q" | "K";
const V = (r: number, y: number) => new THREE.Vector2(r, y);

const PROFILES: Record<PieceType, Pt[]> = {
  P: [[0, 0], [.30, 0], [.30, .05], [.27, .08], [.27, .11], [.22, .14], [.13, .40], [.20, .46], [.20, .50], [.10, .54], [0, .54]],
  R: [[0, 0], [.33, 0], [.33, .06], [.29, .10], [.29, .13], [.24, .17], [.21, .62], [.25, .66], [.28, .71], [.28, .92], [.17, .92], [.17, .86], [0, .86]],
  N: [[0, 0], [.33, 0], [.33, .06], [.29, .10], [.29, .13], [.24, .17], [.22, .22], [0, .22]],
  B: [[0, 0], [.31, 0], [.31, .06], [.27, .10], [.27, .13], [.21, .17], [.12, .62], [.20, .68], [.20, .72], [.11, .76], [.16, .86], [.20, .98], [.17, 1.12], [.10, 1.22], [.04, 1.27], [0, 1.28]],
  Q: [[0, 0], [.34, 0], [.34, .06], [.30, .10], [.30, .14], [.23, .18], [.12, .78], [.21, .84], [.21, .88], [.11, .93], [.16, 1.10], [.24, 1.36], [.22, 1.40], [.14, 1.42], [0, 1.44]],
  K: [[0, 0], [.34, 0], [.34, .06], [.30, .10], [.30, .14], [.23, .18], [.13, .86], [.22, .92], [.22, .96], [.12, 1.00], [.17, 1.20], [.23, 1.40], [.21, 1.46], [.10, 1.50], [0, 1.50]],
};

const SMOOTH: Partial<Record<PieceType, Pt[]>> = {};
export function profileRadius(type: PieceType, y: number): number {
  const p = (SMOOTH[type] ??= smooth(PROFILES[type]));
  for (let i = 1; i < p.length; i++) {
    const [r0, y0] = p[i - 1], [r1, y1] = p[i];
    if (y >= y0 && y <= y1 && y1 > y0) return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0);
  }
  return 0;
}

// The knight: a Staunton head in profile (facing +x), inflated into a rounded volume.
// Thinner at the muzzle and ears, fuller at the neck; a braided mane on the rim, eyes and a mouth line.
function knightShape() {
  const s = new THREE.Shape();
  s.moveTo(.22, .20);
  s.bezierCurveTo(.24, .28, .14, .36, .16, .44);
  s.bezierCurveTo(.18, .52, .24, .54, .30, .56);
  s.bezierCurveTo(.36, .57, .44, .58, .44, .64);
  s.bezierCurveTo(.46, .68, .46, .73, .42, .76);
  s.bezierCurveTo(.36, .82, .28, .88, .22, .96);
  s.bezierCurveTo(.18, 1.02, .16, 1.08, .14, 1.12);
  s.lineTo(.10, 1.24);
  s.bezierCurveTo(.06, 1.18, .03, 1.14, .02, 1.10);
  s.bezierCurveTo(-.06, 1.10, -.16, 1.06, -.22, .98);
  s.bezierCurveTo(-.28, .88, -.32, .74, -.30, .62);
  s.bezierCurveTo(-.28, .46, -.30, .30, -.27, .20);
  s.lineTo(.22, .20);
  return s;
}
const KPOLY = knightShape().getSpacedPoints(420);
const sstep = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
function edgeDist(x: number, y: number) {
  let m = Infinity;
  for (let i = 1; i < KPOLY.length; i++) {
    const a = KPOLY[i - 1], b = KPOLY[i], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L)), ex = a.x + t * dx - x, ey = a.y + t * dy - y;
    m = Math.min(m, ex * ex + ey * ey);
  }
  return Math.sqrt(m);
}
/** Half-thickness of the knight's head at (x, y) in its own profile plane. */
export function knightHalfDepth(x: number, y: number): number {
  const T = .17 - .075 * sstep(.12, .42, x) * sstep(.45, .62, y) - .07 * sstep(.95, 1.2, y) + .025 * (1 - sstep(.2, .4, y));
  const k = Math.min(edgeDist(x, y) / .1, 1);
  return T * Math.sqrt(1 - (1 - k) ** 2);
}
let KNIGHT_GEO: THREE.BufferGeometry | null = null, KNIGHT_LOD: THREE.BufferGeometry | null = null;
function knightHead(lod = false) {
  if (lod ? KNIGHT_LOD : KNIGHT_GEO) return (lod ? KNIGHT_LOD : KNIGHT_GEO)!;
  // conforming mesh: the silhouette is star-shaped about a point in the neck, so build it as concentric rings
  const contour = (lod ? KPOLY.filter((_, i) => i % 4 === 0) : KPOLY).slice(0, -1), C = new THREE.Vector2(.0, .66), K = lod ? 10 : 28, n = contour.length;
  const ring = (k: number, i: number): Pt => { const q = contour[i % n], t = k / K; return [C.x + (q.x - C.x) * t, C.y + (q.y - C.y) * t]; };
  const pos: number[] = [], push = (side: number, pts: Pt[]) => { for (const [x, y] of side > 0 ? pts : [pts[0], pts[2], pts[1]]) pos.push(x, y, side * knightHalfDepth(x, y)); };
  for (const side of [1, -1]) for (let k = 0; k < K; k++) for (let i = 0; i < n; i++) {
    const a = ring(k, i), b = ring(k + 1, i), c = ring(k + 1, i + 1), d = ring(k, i + 1);
    push(side, [a, b, c]); if (k > 0) push(side, [a, c, d]);
  }
  const both = new THREE.BufferGeometry(); both.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const m = mergeVertices(both, 1e-5); m.computeVertexNormals();
  return lod ? (KNIGHT_LOD = m) : (KNIGHT_GEO = m);
}
type Add = (geo: THREE.BufferGeometry, m?: THREE.Material) => THREE.Mesh;
function knightDetails(add: Add, mat: THREE.Material) {
  // the mane: a braid of flattened beads along the back of the neck
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, y = 1.04 - t * .5, p = KPOLY.filter((q) => q.x < -.05 && Math.abs(q.y - y) < .02).sort((a, b) => a.x - b.x)[0];
    if (!p) continue;
    const b = add(new THREE.SphereGeometry(.05, 24, 16), mat); b.position.set(p.x + .018, y, 0); b.scale.set(.75, 1.05, 1.35); b.rotation.z = -.35;
  }
  for (const z of [1, -1]) {
    const e = add(new THREE.SphereGeometry(.026, 24, 16), mat); e.position.set(.2, .87, z * (knightHalfDepth(.2, .87) - .01));
    const mouth = []; for (let i = 0; i <= 12; i++) { const t = i / 12, x = .43 - t * .12, y = .625 - t * .01; mouth.push(new THREE.Vector3(x, y, z * (knightHalfDepth(x, y) - .002))); }
    const g = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mouth), 24, .006, 6, false), MAT.dark()); g.castShadow = false;
  }
}

// A pitted stone texture for basalt: fine speckle plus a few vesicles (gas pockets), tiling.
let STONE: THREE.CanvasTexture | null = null;
function stone() {
  if (STONE) return STONE;
  const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d")!, d = g.createImageData(512, 512);
  let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < d.data.length; i += 4) { const v = 150 + (r() - .5) * 70; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
  for (let k = 0; k < 260; k++) { const x = r() * 512, y = r() * 512, rad = .6 + r() ** 3 * 4; g.fillStyle = `rgba(20,20,20,${.5 + r() * .4})`; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); }
  STONE = new THREE.CanvasTexture(c); STONE.wrapS = STONE.wrapT = THREE.RepeatWrapping; STONE.repeat.set(3, 3); return STONE;
}
export const MAT = {
  ivory: () => new THREE.MeshPhysicalMaterial({ color: 0xeee7d8, roughness: .38, clearcoat: .5, clearcoatRoughness: .3 }),
  ebony: () => new THREE.MeshPhysicalMaterial({ color: 0x1d1a17, roughness: .32, clearcoat: .7, clearcoatRoughness: .2 }),
  porcelain: () => new THREE.MeshPhysicalMaterial({ color: 0xf4f1ea, roughness: .16, clearcoat: 1, clearcoatRoughness: .06, sheen: .4, sheenColor: new THREE.Color(0xfff6e8) }),
  aluminium: () => new THREE.MeshStandardMaterial({ color: 0xbfc4ca, metalness: 1, roughness: .42 }),
  basalt: () => new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: .9, roughnessMap: stone(), bumpMap: stone(), bumpScale: 1.6 }),
  copper: () => new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 1, roughness: .32 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x141312, roughness: .9 }),
};


/** Rounds gentle corners of a lathe profile (Chaikin cuts where the turn is under ~55°); crisp steps stay crisp. */
function smooth(pts: Pt[], passes = 4): Pt[] {
  let p = pts;
  for (let k = 0; k < passes; k++) {
    const out: Pt[] = [p[0]];
    for (let i = 1; i < p.length - 1; i++) {
      const [a, b, c] = [p[i - 1], p[i], p[i + 1]];
      const u = [b[0] - a[0], b[1] - a[1]], v = [c[0] - b[0], c[1] - b[1]];
      const turn = Math.abs(Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]));
      if (turn > .96) { out.push(b); continue; }
      out.push([b[0] - u[0] * .25, b[1] - u[1] * .25], [b[0] + v[0] * .25, b[1] + v[1] * .25]);
    }
    out.push(p[p.length - 1]); p = out;
  }
  return p;
}

const GEO: Record<string, THREE.BufferGeometry> = {}, FELT = new THREE.MeshStandardMaterial({ color: 0x171a17, roughness: 1 });
FELT.userData.shared = true; // one felt for every set on the page: never disposed with a scene
/** `lod`: fewer segments round the axis, for pieces seen small (the day hall's seven sets). */
export function piece(type: PieceType, mat: THREE.Material, { lod = false } = {}): THREE.Group {
  const g = new THREE.Group();
  const add: Add = (geo, m = mat) => { const mesh = new THREE.Mesh(geo, m); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh; };
  add(new THREE.LatheGeometry((SMOOTH[type] ??= smooth(PROFILES[type])).map(([r, y]) => V(r, y)), lod ? 28 : 96));
  if (type === "P") add(new THREE.SphereGeometry(.16, 48, 32)).position.y = .68;
  if (type === "B") {
    add(new THREE.SphereGeometry(.05, 24, 16)).position.y = 1.33;
    // the mitre cut: a dark groove laid on the head's surface, rising diagonally across the front
    const cut = []; for (let i = 0; i <= 40; i++) { const t = i / 40, y = 1.0 + t * .15, a = -.62 + t * .8, r = profileRadius("B", y) - .002; cut.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r)); }
    const groove = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cut), 80, .0075, 8, false), MAT.dark()); groove.castShadow = false;
  }
  if (type === "Q") { // a coronet of eight points leaning out from the rim, and a ball on a short neck
    GEO.qPoint ??= mergeGeometries([new THREE.ConeGeometry(.036, .075, 20).translate(0, .037, 0), new THREE.SphereGeometry(.03, 20, 12).translate(0, .085, 0)]);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, m = add(GEO.qPoint); m.position.set(Math.cos(a) * .2, 1.39, Math.sin(a) * .2); m.rotation.set(Math.sin(a) * .22, 0, -Math.cos(a) * .22); }
    add(GEO.qNeck ??= new THREE.LatheGeometry([[0, 0], [.05, 0], [.035, .05], [0, .06]].map(([r, y]) => V(r, y)), 32)).position.y = 1.43;
    add(GEO.qBall ??= new THREE.SphereGeometry(.058, 32, 20)).position.y = 1.52;
  }
  if (type === "K") { // a bevelled cross pattée
    add(GEO.kCross ??= (() => { const c = new THREE.Shape(), w = .045, a = .13, f = .075;
      c.moveTo(-w, -a); c.lineTo(w, -a); c.lineTo(w * .7, -w); c.lineTo(a, -f); c.lineTo(a, f); c.lineTo(w * .7, w); c.lineTo(w, a); c.lineTo(-w, a); c.lineTo(-w * .7, w); c.lineTo(-a, f); c.lineTo(-a, -f); c.lineTo(-w * .7, -w); c.closePath();
      const g = new THREE.ExtrudeGeometry(c, { depth: .05, bevelEnabled: true, bevelThickness: .014, bevelSize: .012, bevelSegments: 4 }); g.translate(0, 0, -.025); return g; })()).position.y = 1.64;
    add(GEO.kNeck ??= new THREE.LatheGeometry([[0, 0], [.06, 0], [.04, .05], [.045, .09], [0, .1]].map(([r, y]) => V(r, y)), 32)).position.y = 1.47;
  }
  if (type === "R") { // six merlons cut from one ring, with bevelled edges
    add(GEO.rTop ??= (() => { const parts = []; for (let i = 0; i < 6; i++) { const a0 = (i / 6) * Math.PI * 2 + .16, a1 = a0 + (Math.PI * 2 / 6) - .32, sh = new THREE.Shape();
        sh.absarc(0, 0, .28, a0, a1, false); sh.absarc(0, 0, .175, a1, a0, true);
        const e = new THREE.ExtrudeGeometry(sh, { depth: .12, bevelEnabled: true, bevelThickness: .012, bevelSize: .01, bevelSegments: 3, curveSegments: 16 }); e.rotateX(-Math.PI / 2); parts.push(e); }
      return mergeGeometries(parts); })()).position.y = .905;
  }
  if (type === "N") { add(knightHead(lod)); knightDetails(add, mat); add(GEO.nCollar ??= new THREE.LatheGeometry(smooth([[0, .19], [.3, .19], [.305, .22], [.285, .265], [.22, .295], [0, .295]]).map(([r, y]) => V(r, y)), 96)); }
  const felt = add(GEO.felt ??= new THREE.CylinderGeometry(.285, .285, .008, 64).translate(0, .004, 0), FELT); felt.castShadow = false; felt.position.y = -.002;
  return g;
}

export function sq(square: string): { x: number; z: number } {
  return { x: "abcdefgh".indexOf(square[0]) - 3.5, z: 4.5 - Number(square[1]) };
}
