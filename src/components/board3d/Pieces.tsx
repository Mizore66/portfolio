"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Piece, PieceType } from "@/lib/chess/replay";
import { OPENING, T, place } from "@/lib/motion/tokens";
import { bishopSlit, pieceGeometries } from "./geometry";
import { materials } from "./materials";
import { markAnimating } from "./perf";
import { squareDistance, squareXZ } from "./world";

/** What the pieces should do next. `key` changes whenever a new motion starts. */
export type PieceMotion =
  | { kind: "instant"; key: string; pieces: Piece[] }
  | { kind: "move"; key: string; pieces: Piece[] }
  | { kind: "sequence"; key: string; frames: Piece[][] };

type Tween = {
  id: string;
  start: number;
  lift: number;
  travel: number;
  settle: number;
  from: [number, number];
  to: [number, number];
  height: number;
  /** 1 = appears, -1 = is captured, 0 = moves. */
  appear: 0 | 1 | -1;
  type: PieceType;
};

type Shown = { square: string; captured: boolean; type: PieceType; x: number; z: number };
/** Where a piece is drawn this frame, and as what: a promoting pawn stays a pawn until it lands. */
type Pose = { x: number; y: number; z: number; scale: number; type: PieceType };

/** Order of the engine view's glyph row (Glyphs.tsx): K Q R B N P. */
const TYPE_INDEX: Record<PieceType, number> = { K: 1, Q: 2, R: 3, B: 4, N: 5, P: 6 };
const TYPES: PieceType[] = ["K", "Q", "R", "B", "N", "P"];
const COLORS = ["w", "b"] as const;
const REST_Y = 0.012;
// Each side has sixteen pieces, and a promotion can make any of them any type.
const PER_SIDE = 16;
// White's pieces face Black and vice versa, turned a little so the knights read in profile.
const TURN = { w: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI - 0.35), b: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.35) };
const NO_TURN = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();

/** Sub-linear so a long diagonal is unhurried, not slow: one square is `T.move`. */
function travelMs(dist: number): number {
  return T.move * (1 + 0.35 * Math.max(0, dist - 1));
}

/**
 * The pieces, drawn as instances: one instanced mesh per type and side, one
 * for the bishops' mitre slits per side and one for the felt pads, so a view
 * costs about fifteen draw calls rather than ninety-six (brief §7: six unique
 * meshes, instanced). Each piece keeps a pose; `flush` packs the live pieces of
 * each type into their mesh's instances after anything moves.
 */
export function Pieces({
  motion,
  reduced,
  onMoved,
  onSettled,
}: {
  motion: PieceMotion;
  reduced: boolean;
  onMoved?: (squares: string[]) => void;
  onSettled?: () => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const geos = useMemo(() => pieceGeometries(), []);
  const slit = useMemo(() => bishopSlit(), []);
  const felt = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 0.012, 20), []);
  useEffect(() => () => felt.dispose(), [felt]);
  const m = materials();
  const initial = motion.kind === "sequence" ? motion.frames[0] : motion.pieces;
  const colorOf = useMemo(() => new Map(initial.map((p) => [p.id, p.color])), [initial]);
  const bodies = useRef(new Map<string, THREE.InstancedMesh>());
  const slits = useRef(new Map<string, THREE.InstancedMesh>());
  const pads = useRef<THREE.InstancedMesh | null>(null);
  const shown = useRef(new Map<string, Shown>());
  const poses = useRef(new Map<string, Pose>());
  const tweens = useRef<Tween[]>([]);
  const settledCb = useRef(onSettled);
  useEffect(() => {
    settledCb.current = onSettled;
  }, [onSettled]);

  const place3d = (id: string, s: Shown, y = REST_Y, scale = 1, type = s.type) => {
    poses.current.set(id, { x: s.x, y, z: s.z, scale: s.captured && scale <= 0.001 ? 0 : scale, type });
  };

  /** Writes every live piece into its mesh's instances. */
  const flush = () => {
    const counts = new Map<string, number>();
    let pad = 0;
    for (const [id, pose] of poses.current) {
      const color = colorOf.get(id);
      if (!color || pose.scale <= 0.001) continue;
      const key = color + pose.type;
      const body = bodies.current.get(key);
      if (!body) continue;
      _m.compose(_p.set(pose.x, pose.y, pose.z), TURN[color], _s.setScalar(pose.scale));
      const i = counts.get(key) ?? 0;
      body.setMatrixAt(i, _m);
      counts.set(key, i + 1);
      if (pose.type === "B") {
        const sl = slits.current.get(color);
        const j = counts.get("slit" + color) ?? 0;
        sl?.setMatrixAt(j, _m);
        counts.set("slit" + color, j + 1);
      }
      if (pads.current) {
        pads.current.setMatrixAt(pad++, _m.compose(_p.set(pose.x, pose.y - 0.006, pose.z), NO_TURN, _s));
      }
    }
    for (const [key, body] of bodies.current) {
      body.count = counts.get(key) ?? 0;
      body.instanceMatrix.needsUpdate = true;
    }
    for (const [color, sl] of slits.current) {
      sl.count = counts.get("slit" + color) ?? 0;
      sl.instanceMatrix.needsUpdate = true;
    }
    if (pads.current) {
      pads.current.count = pad;
      pads.current.instanceMatrix.needsUpdate = true;
    }
  };

  const snapTo = (pieces: Piece[]) => {
    tweens.current = [];
    for (const p of pieces) {
      const [x, z] = squareXZ(p.square);
      const s: Shown = { square: p.square, captured: p.captured, type: p.type, x, z };
      shown.current.set(p.id, s);
      place3d(p.id, s, REST_Y, p.captured ? 0 : 1);
    }
    flush();
  };

  /** Tweens from what is on the board now to `target`, starting at `t0`. */
  const plan = (target: Piece[], t0: number, fast: boolean): string[] => {
    const moved: string[] = [];
    const lift = fast ? 40 : T.lift;
    const settle = fast ? 40 : T.lift;
    for (const p of target) {
      const cur = shown.current.get(p.id);
      if (!cur) continue;
      const [x, z] = squareXZ(p.square);
      if (cur.captured && !p.captured) {
        tweens.current.push({ id: p.id, start: t0, lift: 0, travel: fast ? OPENING.travel : T.lift, settle: 0, from: [x, z], to: [x, z], height: 0, appear: 1, type: p.type });
      } else if (!cur.captured && p.captured) {
        const delay = fast ? OPENING.travel : T.lift + T.move;
        tweens.current.push({ id: p.id, start: t0 + delay, lift: 0, travel: fast ? OPENING.travel : T.lift, settle: 0, from: [cur.x, cur.z], to: [cur.x, cur.z], height: 0, appear: -1, type: cur.type });
      } else if (!p.captured && cur.square !== p.square) {
        const dist = squareDistance(cur.square, p.square);
        const knight = cur.type === "N";
        tweens.current.push({
          id: p.id,
          start: t0,
          lift,
          travel: fast ? OPENING.travel : travelMs(dist),
          settle,
          from: [cur.x, cur.z],
          to: [x, z],
          height: fast ? 0.06 : knight ? 0.34 : 0.18,
          appear: 0,
          type: cur.type,
        });
        moved.push(p.square);
      }
      shown.current.set(p.id, { square: p.square, captured: p.captured, type: p.type, x, z });
    }
    return moved;
  };

  const key = motion.key;
  useEffect(() => {
    const now = performance.now();
    if (motion.kind === "instant" || reduced) {
      snapTo(motion.kind === "sequence" ? motion.frames[motion.frames.length - 1] : motion.pieces);
      invalidate();
      settledCb.current?.();
      return;
    }
    if (motion.kind === "move") {
      const moved = plan(motion.pieces, now, false);
      onMoved?.(moved);
    } else {
      snapTo(motion.frames[0]);
      motion.frames.slice(1).forEach((f, i) => plan(f, now + i * OPENING.stagger, true));
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reduced]);

  useFrame(() => {
    const list = tweens.current;
    if (!list.length) return;
    const now = performance.now();
    const remaining: Tween[] = [];
    for (const tw of list) {
      const s = shown.current.get(tw.id);
      if (!s) continue;
      const e = now - tw.start;
      const total = tw.lift + tw.travel + tw.settle;
      if (e < 0) {
        remaining.push(tw);
        continue;
      }
      if (e >= total) {
        place3d(tw.id, s, REST_Y, s.captured ? 0 : 1);
        continue;
      }
      remaining.push(tw);
      if (tw.appear !== 0) {
        const k = place(e / tw.travel);
        const scale = tw.appear === 1 ? k : 1 - k;
        place3d(tw.id, { ...s, captured: false, x: tw.from[0], z: tw.from[1] }, REST_Y - (1 - scale) * 0.05, scale, tw.type);
        continue;
      }
      let y = REST_Y;
      if (e < tw.lift) y += tw.height * place(e / tw.lift);
      else if (e < tw.lift + tw.travel) y += tw.height;
      else y += tw.height * (1 - place((e - tw.lift - tw.travel) / tw.settle));
      const k = e < tw.lift ? 0 : place(Math.min(1, (e - tw.lift) / tw.travel));
      const x = tw.from[0] + (tw.to[0] - tw.from[0]) * k;
      const z = tw.from[1] + (tw.to[1] - tw.from[1]) * k;
      place3d(tw.id, { ...s, captured: false, x, z }, y, 1, tw.type);
    }
    tweens.current = remaining;
    flush();
    if (remaining.length) {
      markAnimating();
      invalidate();
    }
    else settledCb.current?.();
  });

  // First placement, before any motion and before the first frame: until then every instance sits at the origin.
  useLayoutEffect(() => {
    snapTo(initial);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group>
      {COLORS.flatMap((color) =>
        TYPES.map((type) => (
          <instancedMesh
            key={color + type}
            ref={(mesh) => {
              if (mesh) bodies.current.set(color + type, mesh);
              else bodies.current.delete(color + type);
            }}
            args={[geos[type], m.plastic[color], PER_SIDE]}
            castShadow
            receiveShadow
            frustumCulled={false}
            userData={{ idMaterial: m.pieceId[color] }}
            onBeforeRender={(_r, _s, _c, _g, mat) => {
              const u = (mat as THREE.ShaderMaterial).uniforms;
              if (u?.uType) {
                u.uType.value = TYPE_INDEX[type] / 8;
                (mat as THREE.ShaderMaterial).uniformsNeedUpdate = true;
              }
            }}
          />
        )),
      )}
      {COLORS.map((color) => (
        <instancedMesh
          key={"slit" + color}
          ref={(mesh) => {
            if (mesh) slits.current.set(color, mesh);
            else slits.current.delete(color);
          }}
          args={[slit, m.slit[color], PER_SIDE]}
          frustumCulled={false}
          userData={{ hideInIdPass: true }}
        />
      ))}
      <instancedMesh ref={pads} args={[felt, m.felt, PER_SIDE * 2]} frustumCulled={false} userData={{ hideInIdPass: true }} />
    </group>
  );
}
