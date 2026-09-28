/**
 * Development only: slow motion for frame-by-frame evidence on machines that draw WebGL on the CPU
 * (design/build/_frames.cjs). sessionStorage "slowmo" = N runs every page change N times slower: GSAP
 * through its global timeline, the page-change clocks here, and WAAPI through the capture script (CDP).
 * In production SLOW is always 1.
 */
import { gsap } from "gsap";

export const SLOW: number = (() => {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return 1;
  const n = Number(sessionStorage.getItem("slowmo"));
  if (!(n > 1)) return 1;
  gsap.globalTimeline.timeScale(1 / n);
  gsap.ticker.lagSmoothing(0);
  return n;
})();

/** Milliseconds on the page-change clock. */
export const now = () => performance.now() / SLOW;
export const after = (fn: () => void, ms: number) => window.setTimeout(fn, ms * SLOW);
