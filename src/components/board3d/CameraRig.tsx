"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Framing } from "@/lib/board/store";
import { OPENING, T, place } from "@/lib/motion/tokens";
import { markAnimating } from "./perf";
import { squareXZ } from "./world";

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

const R_FIT = 5.9; // bounding radius of the mat with standing pieces
const IDLE_PERIOD = 28000;
const IDLE_SWING = 4;

export type RigCue =
  | { kind: "rest" }
  | { kind: "push"; key: string } // opening: wide and high to the framing
  | { kind: "arrive"; key: string } // contact ending: settles into the raking angle
  | { kind: "focus"; key: string; squares: string[] };

/**
 * The camera for one view. It fits the board to the box, shifts the lens so
 * wide hero boxes keep the board clear of the text column (Phase 1 §3), orbits
 * slowly at rest, and eases to frame a moved piece.
 */
export function CameraRig({
  framing,
  shift,
  cue,
  reduced,
  visibleRef,
}: {
  framing: Framing;
  /** Virtual frame width as a multiple of the box: 1 = centred, 1.42 = board in the right two-thirds. */
  shift: number;
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

    const aspect = Math.max(0.2, (size.width * shift) / Math.max(1, size.height));
    const vfov = THREE.MathUtils.degToRad(f.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const fit = Math.min(vfov, hfov);
    const dist = (R_FIT / Math.sin(fit / 2)) * (framing === "raking" ? 0.66 : framing === "hero" ? 0.9 : 0.86) * distMul;

    const el = THREE.MathUtils.degToRad(elevation);
    const az = THREE.MathUtils.degToRad(azimuth);
    const t = target.current;
    c.position.set(t.x + dist * Math.cos(el) * Math.sin(az), t.y + f.lookY + dist * Math.sin(el), t.z + dist * Math.cos(el) * Math.cos(az));
    c.lookAt(t.x, t.y + f.lookY, t.z);
    c.fov = f.fov;
    c.aspect = size.width / Math.max(1, size.height);
    if (shift > 1.001) c.setViewOffset(size.width * shift, size.height, 0, 0, size.width, size.height);
    else c.clearViewOffset();
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
