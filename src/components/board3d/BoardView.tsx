"use client";

/* eslint-disable react-hooks/immutability -- three.js objects (scene, renderer, uniforms) are mutated imperatively by design in R3F; they are not React state. */

import { View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { candidates, piecesAt, replayTo } from "@/lib/board/position";
import { positionAfter } from "@/lib/chess/replay";
import { boardStore, useBoard, type Arrow, type BoardBox } from "@/lib/board/store";
import { Arrows } from "./Arrows";
import { CameraRig, type RigCue } from "./CameraRig";
import { Glyphs } from "./Glyphs";
import { Mat } from "./Mat";
import { materials } from "./materials";
import { Pieces, type PieceMotion } from "./Pieces";
import { squareXZ } from "./world";

const OPENING_KEY = "board:opening-played";

function openingWanted(box: BoardBox, reduced: boolean): boolean {
  if (!box.opening || reduced) return false;
  // Only a box the visitor can see plays it; an offscreen pane must not spend the once-per-session replay.
  const r = box.el.getBoundingClientRect();
  if (r.bottom <= 0 || r.top >= window.innerHeight) return false;
  try {
    return sessionStorage.getItem(OPENING_KEY) !== "1";
  } catch {
    return false;
  }
}

/** Normalises candidate evals into 0–1 arrow weights; the played move is always strong. */
function arrowsFor(nodes: { from: string; to: string; evalCp: number | null; strong: boolean }[]): Arrow[] {
  const vals = nodes.map((n) => n.evalCp ?? 0);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return nodes.map((n) => ({
    from: n.from,
    to: n.to,
    strong: n.strong,
    weight: hi === lo ? 0.6 : 0.25 + (0.75 * ((n.evalCp ?? 0) - lo)) / (hi - lo),
  }));
}

function Lights() {
  const light = useRef<THREE.DirectionalLight>(null);
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    l.shadow.camera.left = l.shadow.camera.bottom = -6.5;
    l.shadow.camera.right = l.shadow.camera.top = 6.5;
    l.shadow.camera.updateProjectionMatrix();
  }, []);
  return (
    <>
      <directionalLight ref={light} color="#fffaf0" intensity={2.6} position={[-6, 11, 5]} castShadow shadow-mapSize={[1024, 1024]} shadow-radius={5} shadow-bias={-0.0004} shadow-normalBias={0.02} />
      <hemisphereLight args={["#ffffff", "#b9c2b6", 0.45]} />
    </>
  );
}

/**
 * Keeps the shared environment map on this view's own scene (each View is a
 * portal). A layout effect, so it is set before the first frame draws: a frame
 * without it compiles a second, environment-less set of shaders.
 */
function Env({ env }: { env: THREE.Texture | null }) {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = 0.55;
  }, [scene, env]);
  return null;
}

/** Marks the box ready once this view has actually drawn into its box, so its printed diagram can fade. */
function FirstFrame({ id, el }: { id: string; el: HTMLElement }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight || r.width === 0) return;
    done.current = true;
    requestAnimationFrame(() => boardStore().getState().markReady(id));
  }, 2);
  return null;
}

/** The square under the pointer, lit on the mat (the cursor's board half). */
function HoverSquare({ el }: { el: HTMLElement }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const mesh = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const ndc = new THREE.Vector2();
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const m = mesh.current;
      if (!m) return;
      if (ray.ray.intersectPlane(plane, hit) && Math.abs(hit.x) < 4 && Math.abs(hit.z) < 4) {
        const f = Math.floor(hit.x + 4);
        const rk = Math.floor(4 - hit.z);
        const [x, z] = squareXZ(`${"abcdefgh"[f]}${rk + 1}`);
        m.position.set(x, 0.013, z);
        m.visible = true;
      } else m.visible = false;
      invalidate();
    };
    const leave = () => {
      if (mesh.current) mesh.current.visible = false;
      invalidate();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [el, camera, invalidate]);
  return (
    <mesh ref={mesh} rotation-x={-Math.PI / 2} visible={false} material={materials().hover} userData={{ hideInIdPass: true }}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/** One DOM box's view of the board: its own camera, the shared current move or a fixed one. */
export function BoardView({ box, env, reduced, shadows }: { box: BoardBox; env: THREE.Texture | null; reduced: boolean; shadows: boolean }) {
  const data = useBoard((s) => s.data)!;
  const current = useBoard((s) => s.nodeId);
  const focus = useBoard((s) => s.focusNode);
  const engine = useBoard((s) => s.engine);
  const engineView = useBoard((s) => s.engineView);
  const takeback = useBoard((s) => s.takeback);
  const replay = useBoard((s) => s.replay);
  const track = useMemo(() => ({ current: box.el }), [box.el]);
  const visibleRef = useRef(false);

  // Hover and keyboard focus previews on shared boards, with a short intent delay so the board never flickers.
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (box.binding.kind !== "current") return;
    const t = setTimeout(() => setPreview(focus), focus ? 160 : 260);
    return () => clearTimeout(t);
  }, [focus, box.binding.kind]);

  const bound = box.binding.kind === "current" ? current : box.binding.nodeId;
  const previewParent = preview ? data.nodes[preview]?.parent : null;
  const shownNode = previewParent && data.nodes[previewParent] ? previewParent : bound;

  const [opening] = useState(() => openingWanted(box, reduced));
  const [skipped, setSkipped] = useState(false);
  // Arriving from a project: start on its position so the move can be taken back.
  const [arrivedFrom] = useState(() => (box.binding.kind === "current" && takeback && data.nodes[takeback] ? takeback : null));
  const [motion, setMotion] = useState<PieceMotion>(() =>
    opening
      ? { kind: "sequence", key: "opening", frames: replayTo(data, bound) }
      : { kind: "instant", key: `i-${arrivedFrom ?? bound}`, pieces: piecesAt(data, arrivedFrom ?? bound) },
  );
  useEffect(() => {
    if (!arrivedFrom) return;
    boardStore().getState().setTakeback(null);
    const id = requestAnimationFrame(() => setMotion({ kind: "move", key: `tb-${Date.now()}`, pieces: piecesAt(data, boardStore().getState().nodeId) }));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [cue, setCue] = useState<RigCue>(() => (opening ? { kind: "push", key: "opening" } : { kind: "rest" }));

  // Any input skips the opening straight to the final position (brief §4).
  useEffect(() => {
    if (!opening) return;
    try {
      sessionStorage.setItem(OPENING_KEY, "1");
    } catch {}
    const skip = () => setSkipped(true);
    const evs = ["wheel", "touchstart", "keydown", "pointerdown", "scroll"] as const;
    evs.forEach((e) => window.addEventListener(e, skip, { passive: true, once: true }));
    const t = setTimeout(() => setSkipped(true), 3200);
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, skip));
    };
  }, [opening]);
  useEffect(() => {
    if (!opening || !skipped) return;
    // Reacting to input outside React (wheel, key, touch) that ends the opening early.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMotion((m) => (m.kind === "sequence" ? { kind: "instant", key: `skip-${bound}`, pieces: piecesAt(data, bound) } : m));
    setCue({ kind: "rest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipped]);

  // Position changes after the first paint replay as moves.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const from = takeback && box.binding.kind === "current" && data.nodes[takeback] ? takeback : null;
    if (from) {
      // Takeback: start on the project's position and play its move backwards.
      // The store changed outside React's render; the render loop, not React, plays the move.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMotion({ kind: "instant", key: `tb0-${from}`, pieces: piecesAt(data, from) });
      requestAnimationFrame(() => setMotion({ kind: "move", key: `tb-${shownNode}-${Date.now()}`, pieces: piecesAt(data, shownNode) }));
      boardStore().getState().setTakeback(null);
      return;
    }
    // A new position from the store becomes a move to animate.
    setMotion({ kind: "move", key: `m-${shownNode}-${Date.now()}`, pieces: piecesAt(data, shownNode) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownNode]);

  // With the engine running, the shared boards show the position it is searching (the visitor may have played on).
  const enginePlies = engine && box.binding.kind === "current" ? engine.plies : null;
  const engineKey = enginePlies ? enginePlies.map((p) => p.from + p.to).join("") : null;
  const engineFirst = useRef(true);
  useEffect(() => {
    if (engineFirst.current) {
      engineFirst.current = false;
      return;
    }
    if (!enginePlies) {
      // Engine stopped or reset: back to the shared move.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMotion({ kind: "move", key: `e0-${shownNode}-${Date.now()}`, pieces: piecesAt(data, shownNode) });
      return;
    }
    setMotion({ kind: "move", key: `e-${engineKey}`, pieces: positionAfter(enginePlies) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineKey]);

  // Opening a project: its piece slides to its square from the position before the move (brief §4).
  const replayKey = replay?.key ?? 0;
  useEffect(() => {
    if (!replay || box.binding.kind !== "current") return;
    const parent = data.nodes[replay.nodeId]?.parent;
    if (!parent) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMotion({ kind: "instant", key: `r0-${replay.key}`, pieces: piecesAt(data, parent) });
    const id = requestAnimationFrame(() => setMotion({ kind: "move", key: `r-${replay.key}`, pieces: piecesAt(data, replay.nodeId) }));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey]);

  // Visibility drives the idle orbit and the contact ending's arrival.
  const arrived = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = e.isIntersecting;
        if (e.isIntersecting && box.framing === "raking" && !arrived.current) {
          arrived.current = true;
          setCue({ kind: "arrive", key: "arrive" });
        }
      },
      { threshold: [0, 0.35] },
    );
    io.observe(box.el);
    return () => io.disconnect();
  }, [box.el, box.framing]);

  const arrows = useMemo<Arrow[]>(() => {
    if (preview && previewParent) {
      const played = data.nodes[preview];
      return arrowsFor(
        candidates(data, preview).map((c) => ({ from: c.uci!.slice(0, 2), to: c.uci!.slice(2, 4), evalCp: c.evalCp, strong: c.id === played.id })),
      );
    }
    if (engine && box.binding.kind === "current" && engine.pv.length) {
      return engine.pv.slice(0, 3).map((p, i) => ({ from: p.from, to: p.to, weight: i === 0 ? 1 : 0.35, strong: i === 0 }));
    }
    return [];
  }, [preview, previewParent, engine, box.binding.kind, data]);

  return (
    <View track={track as React.RefObject<HTMLElement>}>
      <CameraRig framing={box.framing} cue={cue} reduced={reduced} visibleRef={visibleRef} />
      <Env env={env} />
      {shadows ? <Lights /> : <><directionalLight color="#fffaf0" intensity={2.4} position={[-6, 11, 5]} /><hemisphereLight args={["#ffffff", "#b9c2b6", 0.5]} /></>}
      <Mat />
      <Pieces
        motion={motion}
        reduced={reduced}
        onMoved={(squares) => {
          if (squares.length) setCue({ kind: "focus", key: `${squares.join()}-${Date.now()}`, squares });
        }}
      />
      <Arrows arrows={arrows} reduced={reduced} />
      <HoverSquare el={box.el} />
      {box.binding.kind === "current" ? <Glyphs on={engineView} searching={!!engine?.searching && engineView} /> : null}
      <FirstFrame id={box.id} el={box.el} />
    </View>
  );
}

