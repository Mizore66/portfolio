/**
 * What the page did, and when: a short log of the heavy moments (a scene built, warmed or handed back, its buffers
 * given back, a page change's steps), for the frame readout (FrameMeter), which names what ran in each of the slowest
 * frames (phase 6, step 5: single frames of 0.8-0.9 s on the owner's Mac that could not be reproduced here).
 * Always on and cheap: a push per event, and the last few hundred kept.
 */
const log: { t: number; what: string }[] = [];

export function trace(what: string) {
  log.push({ t: performance.now(), what });
  if (log.length > 400) log.splice(0, 200);
}

/** Runs `fn` and logs how long it took on the main thread. */
export function timed<T>(what: string, fn: () => T): T {
  const t0 = performance.now();
  try { return fn(); } finally { trace(`${what} ${Math.round(performance.now() - t0)} ms`); }
}

/** The events logged between two times (performance.now()). */
export const traced = (from: number, to: number) => log.filter((e) => e.t >= from && e.t <= to).map((e) => e.what);
