/**
 * Chapter 3's rough casts (lab2-3): a knight's geometry tessellated finely and every vertex pushed along its normal by
 * a position-seeded noise, so seams stay closed. Pure geometry, so it runs in a worker (cast.worker.ts) while the
 * chapter is built in slices; needed at once, the chapter runs the same function itself. Same input, same numbers.
 */
import * as THREE from "three";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const DIRS = Array.from({ length: 7 }, (_, i) => { const a = i * 2.39996, b = Math.acos(1 - (2 * (i + 0.5)) / 7); return [Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a), 1 + i * 0.37]; });
const noise = (x: number, y: number, z: number, f: number) => DIRS.reduce((s, [a, b, c, k], i) => s + Math.sin((x * a + y * b + z * c) * f * k + i * 1.7) / (1 + i * 0.35), 0) / 3;

export interface Cast { position: Float32Array; normal: Float32Array; index: Uint16Array | Uint32Array | null }

/** The geometry's triangles as a flat, unindexed position array: what the cast starts from. */
export function source(geo: THREE.BufferGeometry): Float32Array {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  return new Float32Array(g.getAttribute("position").array as ArrayLike<number>);
}

export function castOf(position: Float32Array, amp: number, freq: number): Cast {
  let geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geo = new TessellateModifier(0.02, 10).modify(geo); geo = mergeVertices(geo, 1e-4); geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) { const d = amp * noise(p.getX(i), p.getY(i), p.getZ(i), freq); p.setXYZ(i, p.getX(i) + n.getX(i) * d, p.getY(i) + n.getY(i) * d, p.getZ(i) + n.getZ(i) * d); }
  geo.computeVertexNormals();
  return { position: p.array as Float32Array, normal: geo.attributes.normal.array as Float32Array, index: (geo.index?.array as Uint16Array | Uint32Array) ?? null };
}

export function geometryOf(c: Cast): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(c.position, 3)); g.setAttribute("normal", new THREE.BufferAttribute(c.normal, 3));
  if (c.index) g.setIndex(new THREE.BufferAttribute(c.index, 1));
  return g;
}
