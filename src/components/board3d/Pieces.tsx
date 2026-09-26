"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
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

/** Order of the engine view's glyph row (Glyphs.tsx): K Q R B N P. */
const TYPE_INDEX: Record<PieceType, number> = { K: 1, Q: 2, R: 3, B: 4, N: 5, P: 6 };
const REST_Y = 0.012;

/** Sub-linear so a long diagonal is unhurried, not slow: one square is `T.move`. */
function travelMs(dist: number): number {
  return T.move * (1 + 0.35 * Math.max(0, dist - 1));
}

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
  const m = materials();
  const initial = motion.kind === "sequence" ? motion.frames[0] : motion.pieces;
  const all = useMemo(() => initial.map((p) => ({ id: p.id, color: p.color })), [initial]);
  const objs = useRef(new Map<string, THREE.Group>());
  const meshes = useRef(new Map<string, THREE.Mesh>());
  const shown = useRef(new Map<string, Shown>());
  const tweens = useRef<Tween[]>([]);
  // Kept outside `userData`: R3F re-applies that prop on every render.
  const typeIdx = useRef(new Map<string, number>());
  const settledCb = useRef(onSettled);
  useEffect(() => {
    settledCb.current = onSettled;
  }, [onSettled]);

  const place3d = (id: string, s: Shown, y = REST_Y, scale = 1) => {
    const g = objs.current.get(id);
    if (!g) return;
    g.position.set(s.x, y, s.z);
    g.scale.setScalar(scale);
    g.visible = !s.captured || scale > 0.001;
  };

  const setType = (id: string, type: PieceType) => {
    const mesh = meshes.current.get(id);
    if (mesh && mesh.geometry !== geos[type]) mesh.geometry = geos[type];
    const g = objs.current.get(id);
    const slitMesh = g?.getObjectByName("slit");
    if (slitMesh) slitMesh.visible = type === "B";
    typeIdx.current.set(id, TYPE_INDEX[type]);
  };

  const snapTo = (pieces: Piece[]) => {
    tweens.current = [];
    for (const p of pieces) {
      const [x, z] = squareXZ(p.square);
      const s: Shown = { square: p.square, captured: p.captured, type: p.type, x, z };
      shown.current.set(p.id, s);
      setType(p.id, p.type);
      place3d(p.id, s, REST_Y, p.captured ? 0 : 1);
    }
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
          type: p.type,
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
        setType(tw.id, s.type);
        place3d(tw.id, s, REST_Y, s.captured ? 0 : 1);
        continue;
      }
      remaining.push(tw);
      if (tw.appear !== 0) {
        const k = place(e / tw.travel);
        const scale = tw.appear === 1 ? k : 1 - k;
        place3d(tw.id, { ...s, captured: false, x: tw.from[0], z: tw.from[1] }, REST_Y - (1 - scale) * 0.05, scale);
        continue;
      }
      let y = REST_Y;
      if (e < tw.lift) y += tw.height * place(e / tw.lift);
      else if (e < tw.lift + tw.travel) y += tw.height;
      else y += tw.height * (1 - place((e - tw.lift - tw.travel) / tw.settle));
      const k = e < tw.lift ? 0 : place(Math.min(1, (e - tw.lift) / tw.travel));
      const x = tw.from[0] + (tw.to[0] - tw.from[0]) * k;
      const z = tw.from[1] + (tw.to[1] - tw.from[1]) * k;
      place3d(tw.id, { ...s, captured: false, x, z }, y, 1);
    }
    tweens.current = remaining;
    if (remaining.length) {
      markAnimating();
      invalidate();
    }
    else settledCb.current?.();
  });

  // First placement, before any motion.
  useEffect(() => {
    snapTo(initial);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group>
      {all.map(({ id, color }) => (
        <group
          key={id}
          ref={(g) => {
            if (g) objs.current.set(id, g);
            else objs.current.delete(id);
          }}
        >
          <mesh
            ref={(mesh) => {
              if (mesh) meshes.current.set(id, mesh);
              else meshes.current.delete(id);
            }}
            geometry={geos.P}
            material={m.plastic[color]}
            castShadow
            receiveShadow
            rotation-y={color === "w" ? Math.PI - 0.35 : 0.35}
            userData={{ idMaterial: m.pieceId[color] }}
            onBeforeRender={(_r, _s, _c, _g, mat) => {
              const u = (mat as THREE.ShaderMaterial).uniforms;
              if (u?.uType) {
                u.uType.value = (typeIdx.current.get(id) ?? 6) / 8;
                (mat as THREE.ShaderMaterial).uniformsNeedUpdate = true;
              }
            }}
          >
            <mesh name="slit" geometry={slit} material={m.slit[color]} visible={false} userData={{ hideInIdPass: true }} />
          </mesh>
          <mesh position-y={-0.006} material={m.felt} userData={{ hideInIdPass: true }}>
            <cylinderGeometry args={[0.3, 0.3, 0.012, 20]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
