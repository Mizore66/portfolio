"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Arrow } from "@/lib/board/store";
import { T, place } from "@/lib/motion/tokens";
import { materials } from "./materials";
import { markAnimating } from "./perf";
import { squareXZ } from "./world";

/** A flat arrow drawn on the mat, from the centre of one square to another, like an analysis board's. */
function arrowGeometry(len: number, width: number): THREE.ShapeGeometry {
  const head = Math.min(0.42, len * 0.4);
  const hw = width * 2.1;
  const s = new THREE.Shape();
  s.moveTo(0, -width / 2);
  s.lineTo(len - head, -width / 2);
  s.lineTo(len - head, -hw / 2);
  s.lineTo(len, 0);
  s.lineTo(len - head, hw / 2);
  s.lineTo(len - head, width / 2);
  s.lineTo(0, width / 2);
  s.closePath();
  const g = new THREE.ShapeGeometry(s);
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Candidate moves fan out from their squares; thickness follows the eval (0–1 weight). */
export function Arrows({ arrows, reduced }: { arrows: Arrow[]; reduced: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const m = materials();
  const group = useRef<THREE.Group>(null);
  const born = useRef(0);
  const sig = arrows.map((a) => `${a.from}${a.to}${a.strong ? "!" : ""}${a.weight.toFixed(2)}`).join(",");

  const items = useMemo(
    () =>
      arrows.map((a, i) => {
        const [x0, z0] = squareXZ(a.from);
        const [x1, z1] = squareXZ(a.to);
        const len = Math.hypot(x1 - x0, z1 - z0) - 0.18;
        const width = 0.08 + 0.16 * Math.max(0, Math.min(1, a.weight));
        return { key: `${sig}-${i}`, geo: arrowGeometry(Math.max(0.3, len), width), x: x0, z: z0, angle: -Math.atan2(z1 - z0, x1 - x0), strong: !!a.strong, order: i };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sig],
  );

  useEffect(() => {
    born.current = performance.now();
    invalidate();
    return () => items.forEach((it) => it.geo.dispose());
  }, [items, invalidate]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const e = performance.now() - born.current;
    let active = false;
    g.children.forEach((c, i) => {
      // Fan out one after another, drawn from the moving piece outward.
      const k = reduced ? 1 : place(Math.min(1, Math.max(0, (e - i * 60) / T.move)));
      c.scale.set(Math.max(0.001, k), 1, 1);
      if (k < 1) active = true;
    });
    if (active) {
      markAnimating();
      invalidate();
    }
  });

  return (
    <group ref={group} position-y={0.016}>
      {items.map((it) => (
        <mesh key={it.key} geometry={it.geo} material={it.strong ? m.arrowStrong : m.arrow} position={[it.x, 0, it.z]} rotation-y={it.angle} renderOrder={2} userData={{ idMaterial: m.arrowId }} />
      ))}
    </group>
  );
}
