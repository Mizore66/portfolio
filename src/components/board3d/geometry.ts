import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { PieceType } from "@/lib/chess/replay";

/**
 * Club plastic Staunton pieces, turned on a lathe in code (Phase 1 §1).
 * One unit is one square. Nothing is downloaded: the whole set is geometry.
 */

type Pt = [number, number];

function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * (i / n);
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

function base(r: number): Pt[] {
  return [[0, 0], [r, 0], [r, 0.035], [r * 0.97, 0.06], ...arc(r * 0.9, 0.085, 0.035, -Math.PI / 2, Math.PI / 2, 6), [r * 0.78, 0.13], [r * 0.64, 0.165]];
}

function lathe(pts: Pt[], segments = 32): THREE.BufferGeometry {
  const g = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(Math.max(x, 0.0001), y)), segments);
  g.deleteAttribute("uv");
  return g.toNonIndexed();
}

function clean(g: THREE.BufferGeometry): THREE.BufferGeometry {
  g.deleteAttribute("uv");
  return g.index ? g.toNonIndexed() : g;
}

function pawn(): THREE.BufferGeometry {
  return lathe([...base(0.3), [0.18, 0.22], [0.12, 0.42], [0.17, 0.46], [0.18, 0.49], [0.1, 0.52], [0.085, 0.56], ...arc(0, 0.68, 0.135, -Math.PI / 2 + 0.55, Math.PI / 2, 12)]);
}

function rook(): THREE.BufferGeometry {
  const parts = [lathe([...base(0.33), [0.22, 0.24], [0.17, 0.62], [0.24, 0.66], [0.25, 0.72], [0.23, 0.75], [0.23, 0.9], [0.15, 0.9], [0.15, 0.86], [0, 0.86]])];
  for (let i = 0; i < 5; i++) {
    const a0 = (i / 5) * Math.PI * 2;
    const a1 = a0 + ((Math.PI * 2) / 5) * 0.6;
    const sh = new THREE.Shape();
    sh.absarc(0, 0, 0.23, a0, a1, false);
    sh.absarc(0, 0, 0.15, a1, a0, true);
    const m = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 8 });
    m.rotateX(-Math.PI / 2);
    m.translate(0, 0.9, 0);
    parts.push(clean(m));
  }
  return mergeGeometries(parts)!;
}

function bishop(): THREE.BufferGeometry {
  const body = lathe([...base(0.31), [0.18, 0.24], [0.1, 0.64], [0.19, 0.68], [0.2, 0.72], [0.11, 0.75], [0.1, 0.78],
    [0.15, 0.84], [0.175, 0.92], [0.17, 1.0], [0.14, 1.07], [0.09, 1.13], [0.04, 1.17], [0.03, 1.19], ...arc(0, 1.235, 0.048, -Math.PI / 2, Math.PI / 2, 8)]);
  return body;
}

/** The mitre's cut: a thin wedge laid into the head, drawn in a darker tone of the same plastic. */
export function bishopSlit(): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(0.03, 0.2, 0.4);
  g.rotateZ(-0.6);
  g.translate(0.035, 1.0, 0);
  g.rotateY(0.5);
  return clean(g);
}

function queen(): THREE.BufferGeometry {
  const parts = [lathe([...base(0.36), [0.2, 0.26], [0.11, 0.85], [0.21, 0.9], [0.22, 0.95], [0.12, 0.98], [0.11, 1.02], [0.2, 1.22], [0.22, 1.25], [0.14, 1.25], [0.12, 1.3], ...arc(0, 1.36, 0.07, -Math.PI / 2, Math.PI / 2, 8)])];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const s = new THREE.SphereGeometry(0.035, 10, 6);
    s.translate(Math.cos(a) * 0.205, 1.27, Math.sin(a) * 0.205);
    parts.push(clean(s));
  }
  return mergeGeometries(parts)!;
}

function king(): THREE.BufferGeometry {
  const v = new THREE.BoxGeometry(0.06, 0.24, 0.06);
  v.translate(0, 1.51, 0);
  const h = new THREE.BoxGeometry(0.18, 0.06, 0.06);
  h.translate(0, 1.54, 0);
  return mergeGeometries([
    lathe([...base(0.37), [0.21, 0.27], [0.12, 0.9], [0.22, 0.95], [0.23, 1.0], [0.13, 1.03], [0.12, 1.07], [0.21, 1.28], [0.21, 1.32], [0.1, 1.36], [0.06, 1.4], [0, 1.4]]),
    clean(v),
    clean(h),
  ])!;
}

function knight(): THREE.BufferGeometry {
  const pts: Pt[] = [[-0.19, 0.3], [-0.235, 0.46], [-0.24, 0.62], [-0.215, 0.78], [-0.16, 0.9], [-0.09, 0.99], [-0.05, 1.05], [-0.045, 1.14], [-0.01, 1.2],
    [0.03, 1.13], [0.07, 1.1], [0.12, 1.07], [0.2, 1.0], [0.27, 0.91], [0.32, 0.82], [0.345, 0.75], [0.33, 0.7], [0.28, 0.67], [0.2, 0.68],
    [0.13, 0.66], [0.08, 0.6], [0.085, 0.5], [0.14, 0.4], [0.18, 0.3]];
  const head = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), {
    depth: 0.16, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.05, bevelSegments: 6, curveSegments: 12,
  });
  head.translate(0, 0, -0.08);
  // Taper toward the muzzle and crest so the head reads as carved, not cut from sheet.
  const p = head.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    let k = 1;
    if (x > 0.12) k *= 1 - 0.38 * Math.min(1, (x - 0.12) / 0.23);
    if (y > 0.95) k *= 1 - 0.3 * Math.min(1, (y - 0.95) / 0.25);
    if (y < 0.5) k *= 1 + (0.25 * (0.5 - y)) / 0.2;
    p.setZ(i, p.getZ(i) * k);
  }
  return mergeGeometries([lathe([...base(0.33), [0.21, 0.26], [0.2, 0.33], [0, 0.33]]), clean(head)])!;
}

let cache: Record<PieceType, THREE.BufferGeometry> | null = null;

export function pieceGeometries(): Record<PieceType, THREE.BufferGeometry> {
  if (!cache) {
    cache = { P: pawn(), R: rook(), B: bishop(), Q: queen(), K: king(), N: knight() };
    for (const g of Object.values(cache)) g.computeVertexNormals();
  }
  return cache;
}

/** Heights, for lift arcs and camera framing. */
export const PIECE_HEIGHT: Record<PieceType, number> = { P: 0.82, R: 1.0, B: 1.28, Q: 1.43, K: 1.65, N: 1.2 };
