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

export const SCULPTURE: Record<string, () => THREE.Group> = { faultline, "gemini-teleportal": teleportal, circuitmindai: circuitmind };

export function disposeScene(scene: THREE.Object3D) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.dispose();
    (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => { if (!x.userData.shared) x.dispose(); });
  });
}
