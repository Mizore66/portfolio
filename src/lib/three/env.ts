// The renderer every 3D room shares: ACES tone mapping, sRGB output, soft shadows, pixel ratio at most 2.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { evictKept } from "./keep";
import { run, type Steps } from "./steps";
import { trace } from "@/lib/perf/trace";

/**
 * Chrome keeps at most 16 WebGL contexts alive in a page and loses the oldest when a 17th is made: its canvas goes
 * blank and stays blank. The one page holds 7 (the hero's two, the hall, the gallery, the sideboard, Play's two), kept
 * across page changes (keep.ts), and the Lab's chapters 12 more, so arriving at /lab lost the hero and the hall. So a
 * renderer is made only with room for it: kept scenes no one is showing are let go first, oldest first, and a
 * disposed renderer gives its context back at once (dispose alone leaves it held until garbage collection).
 */
const MAX = 14;
const live = new Set<THREE.WebGLRenderer>();
let made: THREE.WebGLRenderer[] | null = null;

/** The renderers `fn` made, for its caller to dispose of should it not go on with them. */
export function madeDuring(fn: () => void): THREE.WebGLRenderer[] {
  const outer = made, mine: THREE.WebGLRenderer[] = (made = []);
  try { fn(); } finally { made = outer; outer?.push(...mine); }
  return mine;
}

export function renderer(canvas: HTMLCanvasElement, exposure: number) {
  for (let room = MAX - live.size, n = 1; room <= 0 && n; room += n) n = evictKept();
  if (live.size >= MAX) trace(`webgl: ${live.size} contexts live, making another (${location.pathname}, ${[...live].map((x) => x.domElement.closest("[data-ch], section, main")?.getAttribute("data-ch") ?? x.domElement.closest("section, main")?.className.split(" ")[0] ?? "detached").join(" ")})`);
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  live.add(r); made?.push(r);
  canvas.addEventListener("webglcontextlost", () => { if (live.delete(r)) trace("webgl: a context was lost"); });
  const dispose = r.dispose.bind(r);
  r.dispose = () => { if (!live.delete(r)) return dispose(); dispose(); r.forceContextLoss(); };
  r.compileAsync = compileAsync(r);
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = exposure;
  r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
}

/**
 * The room every scene is lit by (three's RoomEnvironment at a 0.04 blur), in steps: its programs compiled in the
 * background (where the browser can), then drawn. Drawn cold, the drawing compiled them: 20-30 ms a scene, 50-80 ms on
 * a phone (4x CPU), the slowest step of the hero, the hall, the gallery, the sideboard and the Lab's chapters; compiled
 * first, 6-7 ms. Built straight through, it does not wait: the same programs, compiled as it draws.
 */
export function* roomEnv(r: THREE.WebGLRenderer): Steps<THREE.Texture> {
  const pm = new THREE.PMREMGenerator(r), room = new RoomEnvironment();
  // compiled as fromScene draws it: into a target (so linear and untoned, the programs it will look up)
  const target = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType }), was = r.getRenderTarget();
  r.setRenderTarget(target); const ready = r.compileAsync(room, new THREE.PerspectiveCamera(90, 1, 0.1, 100));
  r.setRenderTarget(was); target.dispose();
  yield ready;
  const env = pm.fromScene(room, 0.04).texture; pm.dispose(); room.dispose();
  return env;
}
/** The same, at once (a scene built in one go). */
export const roomEnvNow = (r: THREE.WebGLRenderer) => run(roomEnv(r));

/**
 * three's compileAsync, except that a material disposed of while it compiles, or a context lost meanwhile, counts as
 * done. A scene built straight through (reached before it was ready) is handed over with its programs still
 * compiling, and can be let go before they finish (a page left at once, a kept scene let go for room): three's own
 * check then read the freed material's program and threw ("reading 'isReady'", the owner, colophon to Contact), or,
 * on a lost context, polled forever. Same order and timing as three's (r180) otherwise.
 */
export function compileAsync(r: THREE.WebGLRenderer): THREE.WebGLRenderer["compileAsync"] {
  return (scene, camera, target = null) => {
    const materials = r.compile(scene, camera, target);
    return new Promise((resolve) => {
      const check = () => {
        const lost = r.getContext().isContextLost();
        materials.forEach((m) => {
          const program = (r.properties.get(m) as { currentProgram?: { isReady(): boolean } }).currentProgram;
          if (lost || !program || program.isReady()) materials.delete(m);
        });
        if (materials.size === 0) { resolve(scene); return; }
        setTimeout(check, 10);
      };
      if (r.extensions.has("KHR_parallel_shader_compile")) check(); else setTimeout(check, 10); // has(): get() warns where it is missing
    });
  };
}

/** for the tests: how many contexts are live */
export const liveContexts = () => live.size;
