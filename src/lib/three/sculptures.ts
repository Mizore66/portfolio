// The three featured project pieces, each in the material that argues for it (Phase 4, approved at Gate 4).
// Ported from design/keyframes/_shared/sculptures.js.
import * as THREE from "three";
import { piece, profileRadius, MAT, type PieceType } from "./pieces";

function surfaceTube(type: PieceType, pts: [number, number][], radius: number, mat: THREE.Material, lift = 0.004) {
  const v = pts.map(([y, a]) => { const r = profileRadius(type, y) + lift; return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r); });
  const curve = new THREE.CatmullRomCurve3(v, false, "catmullrom", 0.1);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, radius, 8, false), mat);
  m.castShadow = false;
  return m;
}

/** FaultLine: porcelain bishop with one hairline crack, fired shut. */
export function faultline(): THREE.Group {
  const g = piece("B", MAT.porcelain());
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) { const y = 0.18 + i * 0.026; pts.push([y, 0.22 + Math.sin(i * 1.7) * 0.018 + Math.sin(i * 0.45) * 0.05]); }
  g.add(surfaceTube("B", pts, 0.0014, new THREE.MeshStandardMaterial({ color: 0x9a9186, roughness: 0.5 }), 0.0005));
  return g;
}

/** Gemini Teleportal: machined, anodised aluminium knight. */
export function teleportal(): THREE.Group {
  const g = piece("N", MAT.aluminium());
  g.rotation.y = -0.45;
  return g;
}

/** CircuitMindAI: basalt bishop with a copper trace inlaid through it. */
export function circuitmind(): THREE.Group {
  const g = piece("B", MAT.basalt());
  const P: [number, number][] = [];
  const seg = (y0: number, y1: number, a: number) => { for (let i = 0; i <= 6; i++) P.push([y0 + ((y1 - y0) * i) / 6, a]); };
  const arc = (y: number, a0: number, a1: number) => { for (let i = 1; i <= 8; i++) P.push([y, a0 + ((a1 - a0) * i) / 8]); };
  seg(0.14, 0.42, -0.35); arc(0.42, -0.35, 0.3); seg(0.42, 0.66, 0.3); arc(0.66, 0.3, -0.2); seg(0.66, 0.9, -0.2); arc(0.9, -0.2, 0.25); seg(0.9, 1.12, 0.25);
  g.add(surfaceTube("B", P, 0.009, MAT.copper(), 0.006));
  return g;
}

// The other seven (step 4a, "new pieces on a different board"). Each is fixed by its move in the career game,
// and each material argues for its project without reusing the featured three's.
// Ported from design/keyframes/_shared/sidelines.js.

/** Ash: a pale wood with a drawn grain. */
let ASH: THREE.CanvasTexture | null = null;
function ash() {
  if (ASH) return ASH;
  const c = document.createElement("canvas"); c.width = 256; c.height = 1024; const g = c.getContext("2d")!;
  g.fillStyle = "#d9c7a4"; g.fillRect(0, 0, 256, 1024);
  let seed = 3; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) {
    const x = r() * 256, w = 0.6 + r() * 2.4;
    g.strokeStyle = `rgba(${120 + r() * 30},${90 + r() * 25},${55 + r() * 20},${0.18 + r() * 0.3})`; g.lineWidth = w;
    g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= 1024; y += 32) g.lineTo(x + Math.sin(y / 140 + i) * 6 + (r() - 0.5) * 2, y); g.stroke();
  }
  ASH = new THREE.CanvasTexture(c); ASH.colorSpace = THREE.SRGBColorSpace; ASH.wrapS = ASH.wrapT = THREE.RepeatWrapping; return ASH;
}
/** The pawn's silhouette: the turned body, and the ball that sits on it. */
const pawnR = (y: number) => Math.max(profileRadius("P", y), Math.sqrt(Math.max(0, 0.16 ** 2 - (y - 0.68) ** 2)));
const isFelt = (o: THREE.Object3D) => (o as THREE.Mesh).geometry?.type === "CylinderGeometry";

export const SMAT = {
  ash: () => new THREE.MeshPhysicalMaterial({ map: ash(), roughness: 0.62, clearcoat: 0.15, clearcoatRoughness: 0.6 }),
  // black glass: smoked, polished, a little light passing through its edges (owner, step 4a)
  blackGlass: () => new THREE.MeshPhysicalMaterial({ color: 0x2a2c30, roughness: 0.03, metalness: 0, transmission: 0.82, thickness: 0.9, ior: 1.52, attenuationColor: new THREE.Color(0x0b0c0e), attenuationDistance: 0.35, clearcoat: 1, clearcoatRoughness: 0.02 }),
  bronze: () => new THREE.MeshStandardMaterial({ color: 0x7a5534, metalness: 1, roughness: 0.38 }),
  brass: () => new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 1, roughness: 0.3 }),
  glass: () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transmission: 1, thickness: 0.6, ior: 1.46, attenuationColor: new THREE.Color(0xd8e6e2), attenuationDistance: 3 }),
  obsidian: () => new THREE.MeshPhysicalMaterial({ color: 0x0a0a0c, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02, reflectivity: 0.7 }),
};

/** Veridian (5. d4): a pawn in pale ash. Measured emissions, grown material. */
export function veridian() { return piece("P", SMAT.ash()); }
/** MirrorFi (4…Nf6): a knight in polished black glass; it shows the room back to itself. */
export function mirrorfi() { const g = piece("N", SMAT.blackGlass()); g.rotation.y = 0.5; return g; }
/** Financial Risk Predictor (1…Nf6, Alekhine's Defence): a dark bronze knight, weighed and cast. */
export function riskPredictor() { const g = piece("N", SMAT.bronze()); g.rotation.y = -0.35; return g; }
/** Distributed Lead Scorer (2…d5, the Elephant Gambit): an ivory pawn cut into thirty slices, each carrying its share. */
export function leadScorer() {
  const whole = piece("P", MAT.ivory()), g = new THREE.Group(), n = 30, gap = 0.007, top = 0.84, mat = MAT.ivory();
  whole.children.filter(isFelt).forEach((f) => g.add(f)); // keep the felt; the body is rebuilt as slices of the same profile
  disposeScene(whole);
  for (let i = 0; i < n; i++) {
    const y0 = (i * top) / n + gap / 2, y1 = ((i + 1) * top) / n - gap / 2, ym = (y0 + y1) / 2, rad = pawnR(ym);
    if (rad < 0.01) continue;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, y1 - y0, 64), mat); m.position.y = ym; m.castShadow = m.receiveShadow = true; g.add(m);
  }
  return g;
}
/** Multi-Agent GraphRAG (5…d6): a pawn drawn as a graph, brass edges between nodes on its surface. */
export function graphRag() {
  const g = new THREE.Group(), brass = SMAT.brass();
  const ring = (y: number, k: number, off: number) => Array.from({ length: k }, (_, i) => { const a = off + (i / k) * Math.PI * 2, r = pawnR(y); return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r); });
  const rows = ([[0.02, 12], [0.12, 12], [0.24, 10], [0.36, 8], [0.46, 8], [0.56, 9], [0.68, 10], [0.79, 8], [0.84, 1]] as [number, number][]).map(([y, k], i) => ring(y, k, i * 0.3));
  const up = new THREE.Vector3(0, 1, 0);
  const edge = (a: THREE.Vector3, b: THREE.Vector3) => {
    const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, d.length(), 8), brass);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(up, d.normalize()); m.castShadow = true; g.add(m);
  };
  rows.forEach((row, i) => row.forEach((p, j) => {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.017, 16, 12), brass); node.position.copy(p); node.castShadow = true; g.add(node);
    if (row.length > 1) edge(p, row[(j + 1) % row.length]);
    const next = rows[i + 1]; if (!next) return;
    const near = [...next].sort((a, b) => a.distanceTo(p) - b.distanceTo(p)); edge(p, near[0]); if (next.length > 1 && (i + j) % 2) edge(p, near[1]);
  }));
  const whole = piece("P", brass), felt = whole.children.find(isFelt);
  if (felt) { whole.remove(felt); g.add(felt); }
  return g;
}
/** SLM Distillation Engine (5…Bb6): a glass bishop with a small solid bishop inside it, 70B around 3B. */
export function distillation() {
  const g = piece("B", SMAT.glass());
  g.children.forEach((m) => { if (!isFelt(m)) m.castShadow = false; });
  const core = piece("B", MAT.ivory()); core.scale.setScalar(0.34); core.position.y = 0.3; core.traverse((m) => { m.castShadow = false; });
  g.add(core);
  return g;
}
/** RexCheck (no move yet; rex, the king): an obsidian king. */
export function rexCheck() { return piece("K", SMAT.obsidian()); }

export const SCULPTURE: Record<string, () => THREE.Group> = {
  faultline, "gemini-teleportal": teleportal, circuitmindai: circuitmind,
  veridian, mirrorfi, "financial-risk-predictor": riskPredictor, "distributed-lead-scorer": leadScorer,
  "multi-agent-graphrag": graphRag, "slm-distillation-engine": distillation, rexcheck: rexCheck,
};

export function disposeScene(scene: THREE.Object3D) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.dispose();
    (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => { if (!x.userData.shared) x.dispose(); });
  });
}
