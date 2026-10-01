// The renderer every 3D room shares: ACES tone mapping, sRGB output, soft shadows, pixel ratio at most 2.
import * as THREE from "three";
import { evictKept } from "./keep";
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

export function renderer(canvas: HTMLCanvasElement, exposure: number) {
  for (let room = MAX - live.size, n = 1; room <= 0 && n; room += n) n = evictKept();
  if (live.size >= MAX) trace(`webgl: ${live.size} contexts live, making another (${location.pathname}, ${[...live].map((x) => x.domElement.closest("[data-ch], section, main")?.getAttribute("data-ch") ?? x.domElement.closest("section, main")?.className.split(" ")[0] ?? "detached").join(" ")})`);
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  live.add(r);
  canvas.addEventListener("webglcontextlost", () => { if (live.delete(r)) trace("webgl: a context was lost"); });
  const dispose = r.dispose.bind(r);
  r.dispose = () => { if (!live.delete(r)) return dispose(); dispose(); r.forceContextLoss(); };
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = exposure;
  r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
}

/** for the tests: how many contexts are live */
export const liveContexts = () => live.size;
