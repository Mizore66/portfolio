// The three featured project pieces, each in the material that argues for it.
import { THREE, piece, profileRadius, MAT } from "./chess3d.js";

function surfaceTube(type, pts, radius, mat, lift = .004) {
  const v = pts.map(([y, a]) => { const r = profileRadius(type, y) + lift; return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r); });
  const curve = new THREE.CatmullRomCurve3(v, false, "catmullrom", .1);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, radius, 8, false), mat);
  m.castShadow = false;
  return m;
}

/** FaultLine: porcelain bishop with one hairline crack, fired shut. */
export function faultline() {
  const g = piece("B", MAT.porcelain());
  const pts = [];
  for (let i = 0; i <= 40; i++) { const y = .18 + i * .026; pts.push([y, .22 + Math.sin(i * 1.7) * .018 + Math.sin(i * .45) * .05]); }
  g.add(surfaceTube("B", pts, .0024, new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: .5 }), .001));
  return g;
}

/** Gemini Teleportal: machined, anodised aluminium knight. */
export function teleportal() {
  const g = piece("N", MAT.aluminium());
  g.rotation.y = -0.45;
  return g;
}

/** CircuitMindAI: basalt bishop with a copper trace inlaid through it. */
export function circuitmind() {
  const g = piece("B", MAT.basalt());
  const P = [];
  const seg = (y0, y1, a) => { for (let i = 0; i <= 6; i++) P.push([y0 + (y1 - y0) * i / 6, a]); };
  const arc = (y, a0, a1) => { for (let i = 1; i <= 8; i++) P.push([y, a0 + (a1 - a0) * i / 8]); };
  seg(.14, .42, -.35); arc(.42, -.35, .3); seg(.42, .66, .3); arc(.66, .3, -.2); seg(.66, .9, -.2); arc(.9, -.2, .25); seg(.9, 1.12, .25);
  g.add(surfaceTube("B", P, .009, MAT.copper(), .006));
  return g;
}
