// Many boards at once (Gate A): each piece type is one merged geometry drawn with InstancedMesh.
import { THREE, piece, MAT } from "./chess3d.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const GEO = {};
function pieceGeo(t) {
  if (GEO[t]) return GEO[t];
  const g = piece(t, MAT.ivory()); g.updateMatrixWorld(true);
  const parts = [];
  g.traverse((o) => { if (!o.isMesh || o.geometry.type === "BoxGeometry" && t === "B") return;
    let q = o.geometry.clone().applyMatrix4(o.matrixWorld); if (q.index) q = q.toNonIndexed(); q.deleteAttribute("uv"); parts.push(q); });
  return (GEO[t] = mergeGeometries(parts));
}

/** boards: [{ fen, at: [x, z], rot, scale }]. Board units as chess3d: one square = 1. */
export function many(scene, boards, { white = MAT.ivory(), black = MAT.ebony(), light = 0xe2d6bf, dark = 0x9c8468, frame = 0xb79e7c } = {}) {
  const buckets = {}, tiles = { l: [], d: [] }, frames = [];
  const M = new THREE.Matrix4(), P = new THREE.Matrix4(), Q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (const b of boards) {
    const s = b.scale ?? 1; M.compose(new THREE.Vector3(b.at[0], b.y ?? 0, b.at[1]), Q.setFromAxisAngle(up, b.rot ?? 0), new THREE.Vector3(s, s, s));
    frames.push(M.clone().multiply(P.makeTranslation(0, -.1, 0)));
    for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) tiles[(f + r) % 2 === 0 ? "d" : "l"].push(M.clone().multiply(P.makeTranslation(f - 3.5, -.04, 4.5 - (r + 1))));
    b.fen.split("/").forEach((row, i) => [...row].forEach((ch, f) => { if (ch === ".") return;
      const w = ch === ch.toUpperCase(), t = ch.toUpperCase(), k = t + (w ? "w" : "b");
      const L = P.makeTranslation(f - 3.5, 0, 4.5 - (8 - i)).multiply(new THREE.Matrix4().makeRotationY(t === "N" ? (w ? Math.PI / 2 : -Math.PI / 2) : 0));
      (buckets[k] ??= []).push(M.clone().multiply(L)); }));
  }
  const inst = (geo, mat, list) => { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((x, i) => m.setMatrixAt(i, x)); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  inst(new THREE.BoxGeometry(1, .08, 1), new THREE.MeshStandardMaterial({ color: light, roughness: .55 }), tiles.l);
  inst(new THREE.BoxGeometry(1, .08, 1), new THREE.MeshStandardMaterial({ color: dark, roughness: .5 }), tiles.d);
  inst(new THREE.BoxGeometry(8.9, .14, 8.9), new THREE.MeshStandardMaterial({ color: frame, roughness: .5 }), frames);
  for (const k in buckets) inst(pieceGeo(k[0]), k[1] === "w" ? white : black, buckets[k]);
}
