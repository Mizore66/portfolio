"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Framing } from "@/lib/board/store";
import { OPENING, T, place } from "@/lib/motion/tokens";
import { markAnimating } from "./perf";
import { MAT, squareXZ } from "./world";

/** Where each framing looks from. Angles in degrees; the distance is fitted to the box. */
const FRAMES: Record<Framing, { elevation: number; azimuth: number; fov: number; lookY: number }> = {
  // Low, slow orbit at rest, from White's side.
  hero: { elevation: 37, azimuth: 27, fov: 24, lookY: 0.2 },
  // A small box reads the position better from higher up.
  pane: { elevation: 50, azimuth: 16, fov: 26, lookY: 0.15 },
  // "Your move": low and raking, across the board.
  raking: { elevation: 8, azimuth: 11, fov: 18, lookY: 0.5 },
  // Straight down, like a printed diagram.
  diagram: { elevation: 89.5, azimuth: 0, fov: 18, lookY: 0 },
};

// What must stay in frame: the mat's corners, and the tops of the tallest pieces over the outer squares.
const FIT_POINTS = (() => {
  const h = MAT / 2;
  const pts: THREE.Vector3[] = [];
  for (const x of [-h, h]) for (const z of [-h, h]) pts.push(new THREE.Vector3(x, 0, z));
  for (const x of [-3.5, 3.5]) for (const z of [-3.5, 3.5]) pts.push(new THREE.Vector3(x, 1.65, z));
  return pts;
})();
// How much of the half-frame the board may fill.
const FILL: Record<Framing, number> = { hero: 0.94, pane: 0.95, raking: 0.98, diagram: 0.94 };
const IDLE_PERIOD = 28000;
const IDLE_SWING = 4;

export type RigCue =
  | { kind: "rest" }
  | { kind: "push"; key: string } // opening: wide and high to the framing
  | { kind: "arrive"; key: string } // contact ending: settles into the raking angle
  | { kind: "focus"; key: string; squares: string[] };

const _dir = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _q = new THREE.Vector3();
const _look = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

/**
 * The shortest camera distance that keeps every fit point inside the frame,
 * for a camera looking at `look` from the given angles. Exact for a pinhole
 * camera: a point's offset across the view does not change with distance,
 * only its depth does, so each point gives a closed-form bound.
 */
function fitDistance(elevationDeg: number, azimuthDeg: number, look: THREE.Vector3, vfov: number, aspect: number, fill: number): number {
  const el = THREE.MathUtils.degToRad(elevationDeg);
  const az = THREE.MathUtils.degToRad(azimuthDeg);
  _dir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  _fwd.copy(_dir).negate();
  _right.crossVectors(_fwd, WORLD_UP).normalize();
  _up.crossVectors(_right, _fwd);
  const tanV = Math.tan(vfov / 2) * fill;
  const tanH = Math.tan(vfov / 2) * aspect * fill;
  let d = 0;
  for (const p of FIT_POINTS) {
    _q.subVectors(p, look);
    const depth = _q.dot(_fwd);
    d = Math.max(d, Math.abs(_q.dot(_right)) / tanH - depth, Math.abs(_q.dot(_up)) / tanV - depth);
  }
  return d;
}

/**
 * The camera for one view. It fits the whole board to the box at the
 * framing's angle, orbits slowly at rest, and eases to frame a moved piece.
 */
export function CameraRig({
  framing,
  cue,
  reduced,
  visibleRef,
}: {
  framing: Framing;
  cue: RigCue;
  reduced: boolean;
  visibleRef: React.RefObject<boolean>;
}) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const anim = useRef({ start: 0, dur: 0, kind: "rest" as RigCue["kind"], focus: new THREE.Vector3(), from: new THREE.Vector3(), to: new THREE.Vector3() });
  const target = useRef(new THREE.Vector3());
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  useEffect(() => {
    const a = anim.current;
    a.kind = cue.kind;
    a.start = performance.now();
    if (cue.kind === "push") a.dur = OPENING.stagger * 20 + T.lift;
    else if (cue.kind === "arrive") a.dur = T.push;
    else if (cue.kind === "focus") {
      a.dur = T.reframe;
      a.from.copy(target.current);
      if (cue.squares.length) {
        const [x, z] = squareXZ(cue.squares[0]);
        // Lean a quarter of the way toward the moved piece: framed, not chased.
        a.to.set(x * 0.25, 0, z * 0.25);
      } else a.to.set(0, 0, 0);
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue.kind, "key" in cue ? cue.key : ""]);

  useFrame(() => {
    const c = cam.current;
    if (!c) return;
    const f = FRAMES[framing];
    const now = performance.now();
    const a = anim.current;
    const e = reduced ? Infinity : now - a.start;
    const k = a.dur ? place(Math.min(1, e / a.dur)) : 1;
    const animating = a.kind !== "rest" && e < a.dur;

    let elevation = f.elevation;
    let distMul = 1;
    if (a.kind === "push" && !reduced) {
      elevation = 62 + (f.elevation - 62) * k;
      distMul = 1.35 + (1 - 1.35) * k;
    } else if (a.kind === "arrive" && !reduced) {
      elevation = 22 + (f.elevation - 22) * k;
      distMul = 1.12 + (1 - 1.12) * k;
    }
    if (a.kind === "focus") target.current.lerpVectors(a.from, a.to, k);

    const idle = !reduced && framing !== "diagram" && visibleRef.current && document.visibilityState === "visible";
    const azimuth = f.azimuth + (idle ? IDLE_SWING * Math.sin(((now % IDLE_PERIOD) / IDLE_PERIOD) * Math.PI * 2) : 0);

    const aspect = Math.max(0.2, size.width / Math.max(1, size.height));
    // Fitted at the framing's resting angle and centre, so the idle sway and a focus lean do not breathe the zoom.
    const dist = fitDistance(f.elevation, f.azimuth, _look.set(0, f.lookY, 0), THREE.MathUtils.degToRad(f.fov), aspect, FILL[framing]) * distMul;

    const el = THREE.MathUtils.degToRad(elevation);
    const az = THREE.MathUtils.degToRad(azimuth);
    const t = target.current;
    c.position.set(t.x + dist * Math.cos(el) * Math.sin(az), t.y + f.lookY + dist * Math.sin(el), t.z + dist * Math.cos(el) * Math.cos(az));
    c.lookAt(t.x, t.y + f.lookY, t.z);
    c.fov = f.fov;
    c.aspect = aspect;
    c.updateProjectionMatrix();

    if (animating) {
      markAnimating();
      invalidate();
    }
    else if (idle && !idleTimer.current) {
      // The idle sway is slow; 30 frames a second is plenty and spares the battery.
      idleTimer.current = setTimeout(() => {
        idleTimer.current = null;
        invalidate();
      }, 33);
    }
  });

  return <PerspectiveCamera ref={cam} makeDefault near={0.1} far={200} />;
}
