"use client";

/* eslint-disable react-hooks/immutability -- three.js objects (scene, renderer, uniforms) are mutated imperatively by design in R3F; they are not React state. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { boardStore, useBoard } from "@/lib/board/store";
import { BoardView } from "./BoardView";
import { takeAnimating } from "./perf";

/** Shared room-light environment for every view's reflections. */
function useEnv(): THREE.Texture | null {
  const gl = useThree((s) => s.gl);
  const rt = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    return target;
  }, [gl]);
  useEffect(() => () => rt.dispose(), [rt]);
  return rt.texture;
}

/** Scroll and resize move the tracked boxes, so the demand loop must draw again. */
function Invalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const on = () => invalidate();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    document.addEventListener("visibilitychange", on);
    const unsub = boardStore().subscribe(on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      document.removeEventListener("visibilitychange", on);
      unsub();
    };
  }, [invalidate]);
  return null;
}

function Views({ reduced, shadows }: { reduced: boolean; shadows: boolean }) {
  const boxes = useBoard((s) => s.boxes);
  const env = useEnv();
  return (
    <>
      {Object.values(boxes).map((b) => (
        <BoardView key={b.id} box={b} env={env} reduced={reduced} shadows={shadows} />
      ))}
    </>
  );
}

/**
 * Quality governor (brief §7, §8). drei's PerformanceMonitor reads idle gaps in
 * a demand loop as a low frame rate, so this one only counts back-to-back
 * frames (a running animation). Two seconds under 45 fps steps quality down:
 * shadows first, then resolution.
 */
function Governor({ onDecline }: { onDecline: () => void }) {
  const acc = useRef({ time: 0, frames: 0 });
  useFrame((_s, delta) => {
    if (!takeAnimating() || delta > 0.1) return;
    const a = acc.current;
    a.time += delta;
    a.frames += 1;
    if (a.time >= 2) {
      if (a.frames / a.time < 45) onDecline();
      a.time = 0;
      a.frames = 0;
    }
  }, 4);
  return null;
}

/** Prototype instrumentation: writes fps and renderer counters into #board-stats when it exists. */
function Stats() {
  const gl = useThree((s) => s.gl);
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
  }, 3);
  useEffect(() => {
    const out = document.getElementById("board-stats");
    if (!out) return;
    gl.info.autoReset = false;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const fps = (frames.current * 1000) / (now - last);
      const calls = Math.round(gl.info.render.calls / Math.max(1, frames.current));
      const tris = Math.round(gl.info.render.triangles / Math.max(1, frames.current));
      out.textContent = `${fps.toFixed(0)} fps · ${calls} draw calls/frame · ${tris.toLocaleString()} triangles/frame · ${gl.info.memory.geometries} geometries · ${gl.info.memory.textures} textures · dpr ${gl.getPixelRatio()}`;
      frames.current = 0;
      gl.info.reset();
      last = now;
    }, 1000);
    return () => clearInterval(id);
  }, [gl]);
  return null;
}

function useReducedMotion(): boolean {
  const [r, setR] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return r;
}

/**
 * The one persistent WebGL canvas (brief §7). Fixed behind the content,
 * `aria-hidden`, no pointer events; drei Views draw the board into whichever
 * DOM boxes are registered. Frames are drawn on demand only.
 */
export default function BoardCanvas() {
  const reduced = useReducedMotion();
  const [dpr, setDpr] = useState(() => Math.min(2, Math.max(1, window.devicePixelRatio || 1)));
  const [shadows, setShadows] = useState(true);
  // `?fps` on the prototype draws every frame so frame rate can be measured.
  const [continuous] = useState(() => new URLSearchParams(window.location.search).has("fps"));
  useEffect(() => {
    boardStore().getState().setLive(true);
    return () => boardStore().getState().setLive(false);
  }, []);
  return (
    <Canvas
      aria-hidden="true"
      className="board-canvas"
      frameloop={continuous ? "always" : "demand"}
      dpr={dpr}
      shadows={{ type: THREE.PCFSoftShadowMap, enabled: shadows }}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.NeutralToneMapping, outputColorSpace: THREE.SRGBColorSpace, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: -1 }}
      events={undefined}
    >
      <Governor
        onDecline={() => {
          if (shadows) setShadows(false);
          else setDpr(1);
        }}
      />
      <Invalidator />
      <Stats />
      <Views reduced={reduced} shadows={shadows} />
    </Canvas>
  );
}
