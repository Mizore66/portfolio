"use client";

/* eslint-disable react-hooks/immutability -- three.js objects (scene, renderer, uniforms) are mutated imperatively by design in R3F; they are not React state. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { boardStore, useBoard } from "@/lib/board/store";
import { yieldToMain } from "@/lib/idle";
import { BoardView } from "./BoardView";
import { pieceGeometries } from "./geometry";
import { materials } from "./materials";
import { takeAnimating } from "./perf";

/**
 * Shared room-light environment for every view's reflections. Built in its own
 * task after the canvas has mounted, not during React's render, so creating
 * the WebGL context and filtering the environment are two short tasks rather
 * than one long one.
 */
function useEnv(): THREE.Texture | null {
  const gl = useThree((s) => s.gl);
  const [rt, setRt] = useState<THREE.WebGLRenderTarget | null>(null);
  useEffect(() => {
    let live = true;
    let made: THREE.WebGLRenderTarget | null = null;
    void yieldToMain().then(() => {
      if (!live) return;
      const pmrem = new THREE.PMREMGenerator(gl);
      made = pmrem.fromScene(new RoomEnvironment(), 0.04);
      pmrem.dispose();
      setRt(made);
    });
    return () => {
      live = false;
      made?.dispose();
    };
  }, [gl]);
  return rt?.texture ?? null;
}

/**
 * Compiles the board's shaders before the first frame, against a stand-in
 * scene with the views' lights and environment, so the programs are cached
 * when the views draw. Where the driver compiles in parallel
 * (KHR_parallel_shader_compile) this keeps shader compilation off the main
 * thread; elsewhere it costs the same as compiling on the first frame.
 */
function usePrecompiled(env: THREE.Texture | null, shadows: boolean): boolean {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!env) return;
    let live = true;
    const m = materials();
    const geo = pieceGeometries().P;
    const scene = new THREE.Scene();
    scene.environment = env;
    const sun = new THREE.DirectionalLight("#fffaf0", 2.6);
    sun.castShadow = shadows;
    scene.add(sun, new THREE.HemisphereLight("#ffffff", "#b9c2b6", 0.45));
    const shadowCatcher = new THREE.ShadowMaterial({ color: "#1f2a24", opacity: 0.28 });
    // Pieces, slits and felt pads are instanced, which is a different shader variant.
    for (const mat of [m.plastic.w, m.plastic.b, m.felt, m.slit.w, m.slit.b]) {
      const mesh = new THREE.InstancedMesh(geo, mat, 1);
      mesh.castShadow = mesh.receiveShadow = shadows;
      scene.add(mesh);
    }
    for (const mat of [m.mat, m.arrow, m.arrowStrong, m.hover, shadowCatcher]) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = mesh.receiveShadow = shadows;
      scene.add(mesh);
    }
    // No timeout: mounting the views before compilation finishes would block the first frame on it. The
    // printed diagram simply stays up longer.
    void gl
      .compileAsync(scene, camera)
      .catch(() => {})
      .then(() => {
        shadowCatcher.dispose();
        if (live) setDone(true);
      });
    return () => {
      live = false;
    };
  }, [env, gl, camera, shadows]);
  return done;
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
  const ready = usePrecompiled(env, shadows);
  // Until then every box keeps its printed diagram.
  if (!ready) return null;
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
