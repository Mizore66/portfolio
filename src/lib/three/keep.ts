import { timed, trace } from "@/lib/perf/trace";

/**
 * The one page's scenes, kept across a visit to a detail page (phase 6, step 5: on a phone, coming back from a
 * project or a role took 170-300 ms frames, because every scene near the screen was built again from nothing
 * while the seam swept in: geometry baked, a new WebGL context, every shader compiled).
 *
 * A section renders an empty slot. On mount it claims its canvases: the ones it drew into last time, with the
 * built scene, or fresh ones. On unmount it keeps them instead of disposing of them. A scene no one claims
 * within ten minutes is disposed of, so the GPU memory is not held for a visit that does not come back.
 */
const LIFE = 10 * 60_000;
interface Kept { canvases: HTMLCanvasElement[]; stage: unknown; dispose: () => void; timer: number }
const kept = new Map<string, Kept>();

/** Fills each slot with a canvas: the ones kept under `key`, returned with their scene, or new ones and null. */
export function claim<T>(key: string, slots: HTMLElement[]): { canvases: HTMLCanvasElement[]; stage: T | null } {
  const k = kept.get(key);
  if (k) { kept.delete(key); clearTimeout(k.timer); }
  const canvases = k?.canvases ?? slots.map(() => document.createElement("canvas"));
  trace(`${key}: ${k ? "handed back" : "new"}`);
  slots.forEach((s, i) => s.replaceChildren(canvases[i]));
  return { canvases, stage: (k?.stage as T) ?? null };
}

/** Sets a built scene aside as its section unmounts. `dispose` runs if it is not claimed again in time. */
export function keep(key: string, canvases: HTMLCanvasElement[], stage: unknown, dispose: () => void) {
  const old = kept.get(key);
  if (old && old.stage !== stage) { clearTimeout(old.timer); old.dispose(); }
  const timer = window.setTimeout(() => { if (kept.get(key)?.stage === stage) { kept.delete(key); dispose(); } }, LIFE);
  shrink(canvases); // held while away, but without its buffers: they come back when the section is near again (sleeper)
  kept.set(key, { canvases, stage, dispose, timer });
}

/** Gives up a canvas's drawing buffer: at 2× with antialiasing a full-screen one holds about 230 MB. */
export const shrink = (canvases: HTMLCanvasElement[]) => canvases.forEach((c) => { c.width = 1; c.height = 1; });

export interface Sleeper { near: boolean; readonly asleep: boolean; sleep(): void; wake(): void; sync(): void; built(): void; stop(): void }

/**
 * A scene's canvases hold their drawing buffers only while their section is within `screens` of the screen (on the
 * one page every section's canvas held a full screen of buffers at all times: 1.6 GB at 2×, and the Lab 2.8 GB, which
 * pushed a Mac that was already swapping into black frames during page changes). Further away they are shrunk to a
 * pixel; coming near, `wake` gives them back (the stage's resize, then a draw) a screen before they are seen.
 * Nothing drawn changes. After building (which sizes the canvases), a
 * section calls `built()`: a scene far off sleeps; one handed back asleep wakes once the page is where it will be
 * (Back restores the scroll after the sections mount), from `wakeNear` or the observer. Asleep is read from the canvas itself, so a build or a resize never leaves it stale.
 */
export function sleeper(el: Element, canvases: HTMLCanvasElement[], wake: () => void, screens = 1): Sleeper {
  const name = () => el.id || ((el as HTMLElement).dataset.ch ? `lab chapter ${(el as HTMLElement).dataset.ch}` : el.className.split(" ")[0]);
  const measure = () => { const r = el.getBoundingClientRect(), h = innerHeight * screens; return r.bottom > -h && r.top < innerHeight + h; };
  const s: Sleeper = {
    near: measure(),
    get asleep() { return canvases.length > 0 && canvases[0].width <= 1; },
    sleep() { if (!s.asleep) { shrink(canvases); trace(`${name()}: asleep`); } },
    wake() { if (s.asleep) timed(`${name()}: woken`, wake); },
    sync() { if (s.near) s.wake(); else s.sleep(); },
    built() { if (!measure()) s.sleep(); }, // wakes come from the observer, a scroll or a jump: not before Back restores the page
    stop() { io.disconnect(); awake.delete(check); if (!awake.size) removeEventListener("scroll", wakeNear); },
  };
  const io = new IntersectionObserver((es) => { s.near = es.some((e) => e.isIntersecting); s.sync(); }, { rootMargin: `${screens * 100}% 0px` });
  io.observe(el);
  const check = () => { if (s.asleep && measure()) { s.near = true; s.wake(); } };
  if (!awake.size) addEventListener("scroll", wakeNear, { passive: true });
  awake.add(check);
  return s;
}

/**
 * Wakes, at once, any sleeping scene a jump has brought near: the observer reports after the frame is painted, and a
 * jump (Back to where the one page was left, a link to one of its sections) would paint that frame from a one-pixel
 * canvas. Runs on scroll, before the frame, and from the code that jumps.
 */
const awake = new Set<() => void>();
export function wakeNear() { awake.forEach((f) => f()); }
