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
  if (k) { kept.delete(key); clearTimeout(k.timer); later.delete(k.canvases); }
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
  // held while away, without its buffers (they come back when the section is near again, sleeper), except the scene on
  // screen as the page is left: Back returns to it, and getting its buffers back then cost a frame of up to 194 ms,
  // with the GPU busy drawing the page change. Seen as the sleeper last saw it: by now the page may have scrolled.
  // The others give theirs up once the page change is over: shrinking a canvas during it cost a frame of 92 ms.
  if (!onScreen.get(canvases[0])?.()) { later.add(canvases); settle(); }
  kept.delete(key); kept.set(key, { canvases, stage, dispose, timer }); // last in, last let go (evictKept)
}

/** Lets the oldest kept scene go, for room for a new WebGL context (env.ts): how many contexts it held, 0 when none is
 * kept. Its renderers are freed once it has finished compiling (a microtask for a scene that has drawn). */
export function evictKept(): number {
  const [key, k] = kept.entries().next().value ?? [];
  if (!key || !k) return 0;
  kept.delete(key); clearTimeout(k.timer); later.delete(k.canvases);
  timed(`${key}: let go, for room`, k.dispose);
  return k.canvases.length;
}

/** Gives up a canvas's drawing buffer: at 2× with antialiasing a full-screen one holds about 230 MB. */
export const shrink = (canvases: HTMLCanvasElement[]) => canvases.forEach((c) => { c.width = 1; c.height = 1; });

export interface Sleeper { readonly asleep: boolean; sleep(): void; wake(): void; built(): void; stop(): void }

/** whether a canvas's section was on screen when last seen, for keep() */
const onScreen = new WeakMap<HTMLCanvasElement, () => boolean>();

/**
 * A scene's canvases hold their drawing buffers only near the screen (on the one page every section's canvas held a
 * full screen of buffers at all times: 1.6 GB at 2×, and the Lab 2.8 GB, which pushed a Mac that was already swapping
 * into black frames during page changes). Far off they are shrunk to a pixel; coming near, `wake` gives them back (the
 * stage's resize, then a draw). Nothing drawn changes.
 *
 * Resizing a canvas waits for the GPU to finish what it has queued: 5-30 ms with the page still, but up to 190 ms in
 * the middle of a scroll through the Lab's heaviest chapters. So a scene changes only once the scroll has been still
 * for a moment, one per task: it wakes within two screens and sleeps beyond three (between, it stays as it is). Only
 * one caught asleep within half a screen (a fast scroll, a jump) wakes at once. After building, which sizes the
 * canvases, a section calls `built()`: a scene built beyond two screens sleeps. Asleep is read from the canvas
 * itself, so a build or a resize never leaves it stale.
 */
export function sleeper(el: Element, canvases: HTMLCanvasElement[], wake: () => void): Sleeper {
  const name = () => el.id || ((el as HTMLElement).dataset.ch ? `lab chapter ${(el as HTMLElement).dataset.ch}` : el.className.split(" ")[0]);
  /** how many screens away the section is: 0 on screen */
  const away = () => { const r = el.getBoundingClientRect(), h = innerHeight; return r.bottom < 0 ? -r.bottom / h : r.top > h ? (r.top - h) / h : 0; };
  let visible = away() === 0;
  const s: Sleeper & { check(): void; settle(): (() => void) | null } = {
    get asleep() { return canvases.length > 0 && canvases[0].width <= 1; },
    sleep() { if (!s.asleep) { timed(`${name()}: asleep`, () => shrink(canvases)); } },
    wake() { if (s.asleep) timed(`${name()}: woken`, wake); },
    built() { if (away() > 2) settle(); }, // it sleeps from the queue, once the scroll and any page change are still
    check() { if (s.asleep && away() < 0.5) s.wake(); }, // on scroll, before the frame
    settle() { const d = away(); return s.asleep && d < 2 ? s.wake : !s.asleep && d > 2 ? s.sleep : null; },
    stop() { io.disconnect(); all.delete(s); onScreen.delete(canvases[0]); if (!all.size) { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); } },
  };
  const io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); });
  io.observe(el);
  if (canvases[0]) onScreen.set(canvases[0], () => visible);
  if (!all.size) { addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); }
  all.add(s); settle();
  return s;
}

const all = new Set<{ check(): void; settle(): (() => void) | null }>();
/** kept scenes' canvases (keep()) still to give up their buffers */
const later = new Set<HTMLCanvasElement[]>();
let lastScroll = 0, timer = 0;
function onScroll() { lastScroll = performance.now(); wakeNear(); settle(); }
// once the scroll has been still for 250 ms and no page change is drawing: the first scene that wants to change does,
// and the rest wait their turn
function settle() {
  clearTimeout(timer);
  timer = window.setTimeout(function run() {
    const still = performance.now() - lastScroll;
    if (still < 250) { timer = window.setTimeout(run, 250 - still); return; }
    if (document.querySelector(".site[data-seam-moving]")) { timer = window.setTimeout(run, 250); return; }
    for (const c of later) { later.delete(c); if (c[0]?.width > 1) { timed("a kept scene: asleep", () => shrink(c)); timer = window.setTimeout(run, 50); return; } }
    for (const s of all) { const act = s.settle(); if (act) { act(); timer = window.setTimeout(run, 50); return; } }
  }, 250);
}

/**
 * Wakes, at once, any sleeping scene within half a screen: the scroll handler runs before the frame, and a jump (Back
 * to where the one page was left, a link to one of its sections) would otherwise paint that frame from a one-pixel
 * canvas. Runs on scroll, and from the code that jumps.
 */
export function wakeNear() { all.forEach((s) => s.check()); }
