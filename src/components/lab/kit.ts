/**
 * The Lab's shared pieces (key frames lab2-1 to lab2-7): every chapter is one composition rendered twice, a day
 * scene on the white side and a night scene on the dark, split at the seam so the 3D inverts like the type
 * (design/keyframes/_shared/twin.js). A chapter scrubs its object with its own scroll progress.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { renderer } from "@/lib/three/env";
import { disposeScene } from "@/lib/three/sculptures";

export type Theme = "day" | "night";
export interface Opts { phone: boolean; reduced: boolean }
/** a label in the scene, placed by the page in css px within the chapter's frame */
export interface Tag { key: string; x: number; y: number; html: string; cls?: string }

export interface Chapter {
  /** 0..1: how far through its pinned scroll the chapter is */
  progress(p: number): void;
  /** the seam this chapter wants at progress p: the white share, 0..1 */
  seam(p: number): number;
  tags(): Tag[];
  render(): void; resize(): void; dispose(): void;
  ready: Promise<void>;
}
export type ChapterFactory = (day: HTMLCanvasElement, night: HTMLCanvasElement | null, o: Opts) => Chapter;

export interface Stage { r: THREE.WebGLRenderer; scene: THREE.Scene; cam: THREE.PerspectiveCamera; env: THREE.Texture; canvas: HTMLCanvasElement }

/** A renderer and scene for one side, with the key frames' RoomEnvironment at `env`. */
const stages = new Set<Stage>();

/**
 * Warm a scene before it is first seen: `draw` renders it as usual, shadow pass included, but with each instanced
 * mesh drawing one instance and the frame cut to one pixel. Its programs compile and its buffers upload, so its
 * first real frame costs no more than any other, without the cost of drawing it (chapter 4's end state, two 8192²
 * shadow maps of 1,599 pieces, is seconds of fill for a software renderer).
 */
export function warm(draw: () => void) {
  const counts: [THREE.InstancedMesh, number][] = [];
  for (const st of stages) {
    st.scene.traverse((o) => { if ((o as THREE.InstancedMesh).isInstancedMesh) { const m = o as THREE.InstancedMesh; counts.push([m, m.count]); m.count = Math.min(m.count, 1); } });
    st.r.setScissorTest(true); st.r.setScissor(0, 0, 1, 1);
  }
  try { draw(); } finally {
    for (const [m, n] of counts) m.count = n;
    for (const st of stages) { st.r.setScissorTest(false); st.r.shadowMap.needsUpdate = true; }
  }
}

export function stage(canvas: HTMLCanvasElement, { exposure = 1, env = 0.5, bg = 0xf3f3f1, fov = 30 } = {}): Stage {
  const r = renderer(canvas, exposure);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(bg);
  const pm = new THREE.PMREMGenerator(r), e = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = e; scene.environmentIntensity = env;
  const cam = new THREE.PerspectiveCamera(fov, 1, 0.1, 400);
  const st = { r, scene, cam, env: e, canvas }; stages.add(st); return st;
}

/** The key frames' framing: a camera, and where its look point sits on screen (setViewOffset in fractions of the frame). */
export interface Frame { pos: [number, number, number]; look: [number, number, number]; fov: number; off: [number, number] }
export function frame(s: Stage, f: Frame) {
  const W = s.canvas.clientWidth || 1, H = s.canvas.clientHeight || 1;
  s.cam.fov = f.fov; s.cam.aspect = W / H; s.cam.position.set(...f.pos);
  s.cam.setViewOffset(W, H, f.off[0] * W, f.off[1] * H, W, H); s.cam.updateProjectionMatrix();
  s.cam.lookAt(...f.look); s.cam.updateMatrixWorld();
}
export function size(s: Stage) { s.r.setSize(s.canvas.clientWidth || 1, s.canvas.clientHeight || 1, false); }

/** Where a point in the scene lands in the chapter's frame, in css px. */
export function toScreen(s: Stage, v: THREE.Vector3) {
  const p = v.clone().project(s.cam);
  return { x: ((p.x + 1) / 2) * s.canvas.clientWidth, y: ((1 - p.y) / 2) * s.canvas.clientHeight };
}

/** Compile both sides without holding the page (see work/gallery.ts); render() waits for it. */
export function compile(stages: Stage[]) {
  let done = false;
  // three compiles only what is visible, and a chapter starts with most of its objects hidden (they arrive with the
  // scroll), so each would compile on its first frame on screen, mid-scroll. Show everything while the programs are
  // gathered (synchronously, inside compileAsync), then put it back.
  const ready = Promise.all(stages.map((s) => {
    const hidden: THREE.Object3D[] = [];
    s.scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
    const p = s.r.compileAsync(s.scene, s.cam).catch(() => {});
    hidden.forEach((o) => { o.visible = false; });
    return p;
  })).then(() => { done = true; });
  return { ready, done: () => done };
}

export function disposeStage(s: Stage) { disposeScene(s.scene); s.env.dispose(); s.r.dispose(); stages.delete(s); }

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** progress p remapped to 0..1 across [a, b] */
export const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
/** the house arrival ease (CustomEase "arrive", M0,0 C0.16,0.84 0.3,1 1,1), close enough for scrubbing */
export const arrive = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const share = (cp: number) => 0.5 + 0.5 * Math.tanh((0.00368208 * cp) / 2);
