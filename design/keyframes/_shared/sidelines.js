// The seven other projects as new pieces (owner, step 4a: "new pieces but on a different board").
// Each piece is fixed by its move in the career game; each material argues for its project, as the
// featured three do (porcelain, aluminium, basalt and copper), without reusing theirs.
import { THREE, piece, profileRadius, MAT } from "./chess3d.js";

/** Ash: a pale wood with a drawn grain. */
function ash() {
  const c = document.createElement("canvas"); c.width = 256; c.height = 1024; const g = c.getContext("2d");
  g.fillStyle = "#d9c7a4"; g.fillRect(0, 0, 256, 1024);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) { const x = r() * 256, w = .6 + r() * 2.4; g.strokeStyle = `rgba(${120 + r() * 30},${90 + r() * 25},${55 + r() * 20},${.18 + r() * .3})`; g.lineWidth = w;
    g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= 1024; y += 32) g.lineTo(x + Math.sin(y / 140 + i) * 6 + (r() - .5) * 2, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

/** The pawn's silhouette: the turned body, and the ball that sits on it. */
const pawnR = (y) => Math.max(profileRadius("P", y), Math.sqrt(Math.max(0, .16 ** 2 - (y - .68) ** 2)));

export const SMAT = {
  ash: () => new THREE.MeshPhysicalMaterial({ map: ash(), roughness: .62, clearcoat: .15, clearcoatRoughness: .6 }),
  mirror: () => new THREE.MeshStandardMaterial({ color: 0xe8eaec, metalness: 1, roughness: .045 }),
  bronze: () => new THREE.MeshStandardMaterial({ color: 0x7a5534, metalness: 1, roughness: .38 }),
  lacquer: () => new THREE.MeshPhysicalMaterial({ color: 0x151312, roughness: .25, clearcoat: 1, clearcoatRoughness: .08 }),
  brass: () => new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 1, roughness: .3 }),
  glass: () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .04, transmission: 1, thickness: .6, ior: 1.46, attenuationColor: new THREE.Color(0xd8e6e2), attenuationDistance: 3 }),
  obsidian: () => new THREE.MeshPhysicalMaterial({ color: 0x0a0a0c, roughness: .08, clearcoat: 1, clearcoatRoughness: .02, reflectivity: .7 }),
};

/** Veridian (5. d4): a pawn in pale ash. Measured emissions, grown material. */
export function veridian() { return piece("P", SMAT.ash()); }

/** MirrorFi (4…Nf6): a mirror-polished knight; it shows the room back to itself. */
export function mirrorfi() { const g = piece("N", SMAT.mirror()); g.rotation.y = .5; return g; }

/** Financial Risk Predictor (1…Nf6, Alekhine's Defence): a dark bronze knight, weighed and cast. */
export function riskPredictor() { const g = piece("N", SMAT.bronze()); g.rotation.y = -.35; return g; }

/** Distributed Lead Scorer (2…d5, the Elephant Gambit): an ivory pawn cut into thirty slices, each carrying its share. */
export function leadScorer() {
  const whole = piece("P", MAT.ivory()), g = new THREE.Group(), n = 30, gap = .007;
  // keep the felt; rebuild the body as slices of the same profile
  whole.children.filter((m) => m.geometry?.type === "CylinderGeometry").forEach((f) => g.add(f));
  const mat = MAT.ivory(), top = .84;
  for (let i = 0; i < n; i++) {
    const y0 = i * top / n + gap / 2, y1 = (i + 1) * top / n - gap / 2, ym = (y0 + y1) / 2;
    const rad = pawnR(ym);
    if (rad < .01) continue;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, y1 - y0, 64), mat); m.position.y = ym; m.castShadow = m.receiveShadow = true; g.add(m);
  }
  return g;
}

/** Multi-Agent GraphRAG (5…d6): a pawn drawn as a graph, brass edges between nodes on its surface. */
export function graphRag() {
  const g = new THREE.Group(), brass = SMAT.brass();
  const ring = (y, k, off) => Array.from({ length: k }, (_, i) => { const a = off + (i / k) * Math.PI * 2, r = pawnR(y); return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r); });
  const rows = [[.02, 12], [.12, 12], [.24, 10], [.36, 8], [.46, 8], [.56, 9], [.68, 10], [.79, 8], [.84, 1]].map(([y, k], i) => ring(y, k, i * .3));
  const edge = (a, b) => { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, d.length(), 8), brass); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; g.add(m); };
  rows.forEach((row, i) => row.forEach((p, j) => {
    const node = new THREE.Mesh(new THREE.SphereGeometry(.017, 16, 12), brass); node.position.copy(p); node.castShadow = true; g.add(node);
    if (row.length > 1) edge(p, row[(j + 1) % row.length]);
    const up = rows[i + 1]; if (!up) return;
    const near = [...up].sort((a, b) => a.distanceTo(p) - b.distanceTo(p)); edge(p, near[0]); if (up.length > 1 && (i + j) % 2) edge(p, near[1]);
  }));
  const felt = piece("P", brass).children.find((m) => m.geometry?.type === "CylinderGeometry"); if (felt) g.add(felt);
  return g;
}

/** SLM Distillation Engine (5…Bb6): a glass bishop with a small solid bishop inside it, 70B around 3B. */
export function distillation() {
  const g = piece("B", SMAT.glass());
  g.children.forEach((m) => { if (m.geometry?.type !== "CylinderGeometry") { m.castShadow = false; } });
  const core = piece("B", MAT.ivory()); core.scale.setScalar(.34); core.position.y = .3; core.children.forEach((m) => { m.castShadow = false; });
  g.add(core);
  return g;
}

/** RexCheck (no move yet: rex, the king, in check): an obsidian king. */
export function rexCheck() { return piece("K", SMAT.obsidian()); }

export const SIDELINES = [
  { slug: "financial-risk-predictor", name: "Financial Risk Predictor", make: riskPredictor, move: "1…Nf6", square: "f6", line: "side", opening: "Alekhine's Defence" },
  { slug: "distributed-lead-scorer", name: "Distributed Lead Scorer", make: leadScorer, move: "2…d5", square: "d5", line: "side", opening: "Elephant Gambit" },
  { slug: "mirrorfi", name: "MirrorFi", make: mirrorfi, move: "4…Nf6", square: "f6", line: "main" },
  { slug: "veridian", name: "Veridian", make: veridian, move: "5. d4", square: "d4", line: "main" },
  { slug: "slm-distillation-engine", name: "SLM Distillation Engine", make: distillation, move: "5…Bb6", square: "b6", line: "side" },
  { slug: "multi-agent-graphrag", name: "Multi-Agent GraphRAG", make: graphRag, move: "5…d6", square: "d6", line: "side" },
  { slug: "rexcheck", name: "RexCheck", make: rexCheck, move: null, square: null, line: "none" },
];
