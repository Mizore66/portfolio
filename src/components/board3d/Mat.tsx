"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { materials } from "./materials";
import { MAT } from "./world";

let geo: THREE.PlaneGeometry | null = null;

function matGeometry(): THREE.PlaneGeometry {
  if (geo) return geo;
  geo = new THREE.PlaneGeometry(MAT, MAT, 80, 80);
  geo.rotateX(-Math.PI / 2);
  // Roll memory: the two short ends lift a little, the way a rolled mat never quite lies flat.
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const d = Math.abs(p.getZ(i)) - (MAT / 2 - 0.9);
    if (d > 0) p.setY(i, 0.055 * (d / 0.9) ** 2.2);
  }
  geo.computeVertexNormals();
  return geo;
}

/** The mat plus a shadow catcher, so shadows fall on the page itself. */
export function Mat() {
  const m = materials();
  const g = useMemo(() => matGeometry(), []);
  return (
    <group>
      <mesh geometry={g} material={m.mat} receiveShadow userData={{ idMaterial: m.matId }} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002} receiveShadow userData={{ hideInIdPass: true }}>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial color="#1f2a24" opacity={0.28} />
      </mesh>
    </group>
  );
}
