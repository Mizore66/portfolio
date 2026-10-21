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

/** What a build cannot go on without (a scene's code, still downloading): built in slices it waits, as for a promise;
 * straight through it stops with NotYet, and the build stays where it was, to go on once the code is in. */
export class Need { constructor(readonly p: Promise<unknown>) {} }
export class NotYet extends Error { constructor() { super("not loaded yet"); } }

/** All of it now. */
export function run<T>(g: Steps<T>): T {
  for (;;) { const r = g.next(); if (r.done) return r.value; if (r.value instanceof Need) throw new NotYet(); }
}

/**
 * A scene's module, fetched when it is first wanted rather than with the page: three.js and the scenes were 880 KB
 * of the first load's scripts, all of it downloaded before the name could count as painted (Lighthouse's LCP on a
 * phone, 5.4 s). `get()` starts the download; `steps()` waits for it, then builds.
 */
export function lazy<M>(fetch: () => Promise<M>) {
  let mod: M | null = null, failed: unknown = null, p: Promise<M> | null = null;
  const load = () => (p ??= fetch().then((m) => (mod = m), (e) => { failed = e ?? new Error("load failed"); throw failed; }));
  const get = () => { load().catch(() => {}); };
  return {
    get,
    /** the module, once it is in (rejects if it could not be fetched) */
    load,
    get now() { return mod; },
    *steps<T>(make: (m: M) => Steps<T>): Steps<T> {
      while (!mod) { if (failed) throw failed; yield new Need(load().catch(() => {})); }
      return yield* make(mod);
    },
  };
}

/** Its first `n` steps now (a scene's renderers, made while the page change can still make room for them, env.ts),
 * the rest as a build that carries on from there: a promise the last of them yielded is yielded first. */
export function ahead<T>(g: Steps<T>, n: number): Steps<T> {
  let r: IteratorResult<unknown, T> | null = null;
  for (let i = 0; i < n && !(r = g.next()).done; i++) if (r.value instanceof Promise || r.value instanceof Need) break;
  const last = r;
  return (function* () {
    if (last?.done) return last.value;
    if (last?.value instanceof Promise || last?.value instanceof Need) yield last.value;
    return yield* g;
  })();
}

const channel = typeof MessageChannel === "function" ? new MessageChannel() : null, queue: (() => void)[] = [];
if (channel) channel.port1.onmessage = () => queue.shift()?.();
/** The next slice runs once the next frame has been drawn: a task posted at the frame's start runs after its paint.
 * Posting task after task straight away let Chrome hold its frames back behind them (one load drew no frame for
 * 219 ms of slices); one slice a frame, the frames come first. A hidden tab draws no frames: there it is a timer. */
let lastFrame = 0, frameMs = 0, frameNo = 0;
const post = (fn: () => void) => {
  if (!channel || typeof requestAnimationFrame !== "function" || document.hidden) { setTimeout(() => { frameNo++; fn(); }, 0); return; }
  requestAnimationFrame((t) => { if (t !== lastFrame) { frameMs = lastFrame ? t - lastFrame : 0; lastFrame = t; frameNo++; } queue.push(fn); channel.port2.postMessage(0); });
};
/** The frame a slice last ran after: one slice a frame across every build on the page, not one each. Three or four
 * scenes building at once each took their slice of the same frame (docs/perf-audit/01-runtime-trace.md: building and
 * warming were 81% of the first scroll's slow frames). The first build posted keeps its turn until it is done. */
let sliceIn = -1;
/** A slice's length: `budget`, or where frames are slow (a busy phone, a test browser drawing in software) up to half
 * a frame, at most 10 ms. One 8 ms slice a frame at 300 ms a frame left a build of 30 steps taking 9 s. Lighthouse
 * counts a task four times as long as it ran (its phone's CPU): over 12.5 ms is a long task. At most 50 ms, a phone's
 * slices were long tasks of 100-270 ms, most of its 1.3 s of blocking time; at most 16 ms, 60-150 ms, still 0.6 s. */
const lengthOf = (budget: number) => (frameMs > 2 * budget ? Math.min(10, Math.max(budget, frameMs / 2)) : budget);

export interface Building<T> {
  readonly done: Promise<T>;
  /** the rest of it now, and the result; NotYet if its code is still downloading (it carries on in slices) */
  finish(): T;
  /** not wanted after all: stops it if none of it has run yet (true), and `done` never settles; once under way it runs
   * to its end, for its owner to dispose of (a renderer half made would stay counted against the budget, env.ts) */
  cancel(): boolean;
}

/** A slice at a time, `budget` ms each. A step over 12 ms is logged (a long task at Lighthouse's 4× CPU) under `name` (trace.ts): it wants splitting. A test page can lower the bar (`__stepLog`, scripts/.lag/phonesteps.mjs LOG). */
export function sliced<T>(g: Steps<T>, budget = 8, name = "a build"): Building<T> {
  let n = 0, off = false;
  let state: { v: T } | { e: unknown } | null = null;
  let res!: (v: T) => void, rej!: (e: unknown) => void;
  const done = new Promise<T>((a, b) => { res = a; rej = b; });
  done.catch(() => {}); // a failure is read through finish() or done; neither need be listening
  const end = (r: IteratorResult<unknown, T>) => { state = { v: r.value as T }; res(r.value as T); };
  const step = () => {
    if (state || off) return;
    if (sliceIn === frameNo) { post(step); return; } // another build had this frame
    sliceIn = frameNo;
    const t0 = performance.now();
    try {
      for (;;) {
        const s0 = performance.now(), r = g.next(), ms = performance.now() - s0;
        if (!(r.value instanceof Need)) n++; // waiting for its code is not under way: it can still be cancelled
        if (ms > ((globalThis as { __stepLog?: number }).__stepLog ?? 12)) trace(`${name}: step ${n} took ${Math.round(ms)} ms`);
        if (r.done) { end(r); return; }
        const wait = r.value instanceof Need ? r.value.p : r.value;
        if (wait instanceof Promise) { wait.then(() => post(step), () => post(step)); return; }
        if (performance.now() - t0 + ms > lengthOf(budget)) break; // the next step taken to cost what this one did
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
        catch (e) { if (e instanceof NotYet) throw e; state = { e }; rej(e); }
      }
      if ("e" in state!) throw state.e;
      return (state as { v: T }).v;
    },
    cancel() { if (n || state) return false; off = true; return true; },
  };
}

/**
 * A section's scene: `start()` builds it in slices, `now()` returns it, finishing it first if need be (null if its
 * code is still downloading: it is adopted once it is in). `adopt` runs
 * once, with the scene, whichever finished it; `fail` once if it could not be built (no WebGL).
 */
export function staged<T>(make: () => Steps<T>, adopt: (v: T) => void, fail: () => void, name?: string) {
  let b: Building<T> | null = null, value: T | null = null, failed = false;
  const take = (v: T) => { if (!value) { value = v; adopt(v); } return value; };
  const lose = () => { if (!failed) { failed = true; fail(); } return null; };
  const start = () => { if (value || failed || b) return; b = sliced(make(), 8, name); b.done.then(take, lose); };
  return {
    get value() { return value; },
    start,
    now(): T | null {
      if (value || failed) return value;
      start();
      try { return take(b!.finish()); } catch (e) { return e instanceof NotYet ? null : lose(); }
    },
  };
}
