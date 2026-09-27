/**
 * Main-thread scheduling for the lazy layers (brief §8: everything heavy loads
 * after the page is interactive). Work queued here waits for `load` and the
 * first paint, then runs one job per idle period, so the 3D board and the
 * motion system never pile into the same stretch of main-thread time.
 */

let chain: Promise<void> = Promise.resolve();

function loaded(): Promise<void> {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
}

/**
 * Resolves once the page has painted. Idle time can arrive after `load` but
 * before the first frame is on screen; canvas and WebGL work started then
 * queues the first paint behind it in the GPU process.
 */
function painted(): Promise<void> {
  return new Promise((resolve) => {
    const done = () => requestAnimationFrame(() => setTimeout(resolve, 0));
    if (performance.getEntriesByName("first-contentful-paint").length) return done();
    try {
      const po = new PerformanceObserver(() => {
        po.disconnect();
        done();
      });
      po.observe({ type: "paint", buffered: true });
    } catch {
      done();
    }
  });
}

function idle(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout });
    else setTimeout(resolve, Math.min(timeout, 1200));
  });
}

/** Runs `job` in its own idle period after `load` and first paint, once every job queued before it has finished. */
export function whenIdle(job: () => Promise<void> | void, timeout = 2500): Promise<void> {
  const run = chain
    .then(loaded)
    .then(painted)
    .then(() => idle(timeout))
    .then(job)
    .catch(() => {});
  chain = run;
  return run;
}

type Scheduler = { yield?: () => Promise<void> };

/** Ends the current task so input and paint can run before the next step. */
export function yieldToMain(): Promise<void> {
  const s = (globalThis as { scheduler?: Scheduler }).scheduler;
  if (s?.yield) return s.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
