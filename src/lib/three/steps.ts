/**
 * Scenes built in steps (phase 6, step 5: no frame over about 50 ms). A scene's build is a generator that yields
 * between its parts: the renderer, the environment, each table or set of pieces. Built ahead of need it runs a slice
 * at a time (about 8 ms), one a frame, after the frame is drawn; needed at once (a section reached before its scene was
 * ready) the rest of it runs straight through. The same parts, in the same order, either way: the scene is the same.
 *
 * A step may yield a promise (work done off the main thread, as in chapter 3's casts): built in slices, the next step
 * waits for it; straight through, it does not, and the step does that work itself.
 */
import { trace } from "@/lib/perf/trace";

export type Steps<T> = Generator<unknown, T, void>;

/** All of it now. */
export function run<T>(g: Steps<T>): T {
  for (;;) { const r = g.next(); if (r.done) return r.value; }
}

/** Its first `n` steps now (a scene's renderers, made while the page change can still make room for them, env.ts),
 * the rest as a build that carries on from there: a promise the last of them yielded is yielded first. */
export function ahead<T>(g: Steps<T>, n: number): Steps<T> {
  let r: IteratorResult<unknown, T> | null = null;
  for (let i = 0; i < n && !(r = g.next()).done; i++) if (r.value instanceof Promise) break;
  const last = r;
  return (function* () {
    if (last?.done) return last.value;
    if (last?.value instanceof Promise) yield last.value;
    return yield* g;
  })();
}

const channel = typeof MessageChannel === "function" ? new MessageChannel() : null, queue: (() => void)[] = [];
if (channel) channel.port1.onmessage = () => queue.shift()?.();
/** The next slice runs once the next frame has been drawn: a task posted at the frame's start runs after its paint.
 * Posting task after task straight away let Chrome hold its frames back behind them (one load drew no frame for
 * 219 ms of slices); one slice a frame, the frames come first. A hidden tab draws no frames: there it is a timer. */
let lastFrame = 0, frameMs = 0;
const post = (fn: () => void) => {
  if (!channel || typeof requestAnimationFrame !== "function" || document.hidden) { setTimeout(fn, 0); return; }
  requestAnimationFrame((t) => { frameMs = lastFrame ? t - lastFrame : 0; lastFrame = t; queue.push(fn); channel.port2.postMessage(0); });
};
/** A slice's length: `budget`, or where frames are slow (a busy phone, a test browser drawing in software) up to half
 * a frame, at most 50 ms. One 8 ms slice a frame at 300 ms a frame left a build of 30 steps taking 9 s. */
const lengthOf = (budget: number) => (frameMs > 2 * budget ? Math.min(50, Math.max(budget, frameMs / 2)) : budget);

export interface Building<T> {
  readonly done: Promise<T>;
  /** the rest of it now, and the result */
  finish(): T;
  /** not wanted after all: stops it if none of it has run yet (true), and `done` never settles; once under way it runs
   * to its end, for its owner to dispose of (a renderer half made would stay counted against the budget, env.ts) */
  cancel(): boolean;
}

/** A slice at a time, `budget` ms each. A step over 30 ms is logged under `name` (trace.ts): it wants splitting. */
export function sliced<T>(g: Steps<T>, budget = 8, name = "a build"): Building<T> {
  let n = 0, off = false;
  let state: { v: T } | { e: unknown } | null = null;
  let res!: (v: T) => void, rej!: (e: unknown) => void;
  const done = new Promise<T>((a, b) => { res = a; rej = b; });
  done.catch(() => {}); // a failure is read through finish() or done; neither need be listening
  const end = (r: IteratorResult<unknown, T>) => { state = { v: r.value as T }; res(r.value as T); };
  const step = () => {
    if (state || off) return;
    const t0 = performance.now();
    try {
      for (;;) {
        const s0 = performance.now(), r = g.next(), ms = performance.now() - s0; n++;
        if (ms > 30) trace(`${name}: step ${n} took ${Math.round(ms)} ms`);
        if (r.done) { end(r); return; }
        if (r.value instanceof Promise) { r.value.then(() => post(step), () => post(step)); return; }
        if (performance.now() - t0 > lengthOf(budget)) break;
      }
    } catch (e) { state = { e }; rej(e); return; }
    post(step);
  };
  post(step);
  return {
    done,
    finish() {
      if (!state) {
        try { const r = run(g as Steps<T>); state = { v: r }; res(r); }
        catch (e) { state = { e }; rej(e); }
      }
      if ("e" in state!) throw state.e;
      return (state as { v: T }).v;
    },
    cancel() { if (n || state) return false; off = true; return true; },
  };
}

/**
 * A section's scene: `start()` builds it in slices, `now()` returns it, finishing it first if need be. `adopt` runs
 * once, with the scene, whichever finished it; `fail` once if it could not be built (no WebGL).
 */
export function staged<T>(make: () => Steps<T>, adopt: (v: T) => void, fail: () => void, name?: string) {
  let b: Building<T> | null = null, value: T | null = null, failed = false;
  const take = (v: T) => { if (!value) { value = v; adopt(v); } return value; };
  const lose = () => { if (!failed) { failed = true; fail(); } return null; };
  return {
    get value() { return value; },
    start() { if (value || failed || b) return; b = sliced(make(), 8, name); b.done.then(take, lose); },
    now(): T | null {
      if (value || failed) return value;
      try { return take(b ? b.finish() : run(make())); } catch { return lose(); }
    },
  };
}
