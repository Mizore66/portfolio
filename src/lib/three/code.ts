// The scenes' code (scenes.ts, with three.js): fetched once the page has painted, not with its own scripts. Their
// 880 KB came down before the hero's name could count as painted (Lighthouse's LCP on a phone, 5.4 s); asked for
// as the page's scripts ran, they still could land before a busy phone's first paint, and counted again (FCP 3.0 s).
import { lazy } from "./steps";

const FCP = "first-contentful-paint";
/** After the first paint with content in it (or 1.5 s, where that is never reported). */
export const painted = typeof window === "undefined" ? Promise.resolve() : new Promise<void>((done) => {
  const go = () => setTimeout(done, 0);
  if (performance.getEntriesByName(FCP).length) { go(); return; }
  try {
    const po = new PerformanceObserver((l) => { if (l.getEntriesByName(FCP).length) { po.disconnect(); go(); } });
    po.observe({ type: "paint", buffered: true });
  } catch { /* no paint timing: the timer below */ }
  setTimeout(done, 1500);
});

export const scenes = lazy(() => painted.then(() => import("./scenes")));
