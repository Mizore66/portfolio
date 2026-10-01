/**
 * Page changes (design/motion.md, "Navigation" and sections 3 to 6). The seam travels from where it is
 * to the arriving page's resting position. The leaving page is a View Transition snapshot: it keeps
 * the side the seam closes over, its lines rise out of their masks, and whatever it still covers when
 * the seam lands slides up and away. The arriving page is live beneath, drawn by the same live seam.
 * Back and Forward are the same sweep, from where the seam is to where the page rests.
 */
import { gsap } from "gsap";
import { registerEases } from "@/lib/motion/ease";
import { now } from "@/lib/motion/slowmo";
import { seam, setSeam, sides, css, intersect, isPhone, restFor, restColours } from "./seam";
import { cue } from "@/lib/sound/sound";
import { wakeNear } from "@/lib/three/keep";
import { trace } from "@/lib/perf/trace";

export interface Plan {
  from: string; to: string; A: number; B: number; phone: boolean;
  /** seconds from the start of the sweep */
  dur: number; tilt: number; typeAt: number; liftAt: number; liftDur: number; rise: number; total: number;
  /** Work to one of its projects: what is left of the old page is cut when the seam lands, not lifted */
  cut: boolean;
}

/** The storyboard's hero-to-Work numbers (1.15 s, 13 degrees at a 0.44 travel) scaled by distance. */
export function plan(from: string, to: string, A: number, B: number, phone: boolean): Plan {
  const d = B - A, k = Math.min(1, Math.abs(d) / 0.44), moving = Math.abs(d) > 0.02;
  const dur = moving ? 0.8 + 0.35 * k : 0;
  const tilt = moving ? Math.sign(d) * (phone ? 8 : 13) * k : 0;
  const typeAt = moving ? 0.73 * (dur / 1.15) : 0;
  // with nothing to travel, the whole page leaves upward once its lines have gone
  const liftAt = moving ? dur - 0.15 : 0.3, liftDur = moving ? 0.5 : 0.6;
  const rise = moving ? dur - 0.02 : from === "/roles" && to.startsWith("/roles/") ? 0.1 : 0.7;
  // The owner's call at step 4a: from the gallery into a project the camera has already stepped down to the
  // project's framing, so the piece stays put and the rest is a cut (only the plinth and the light change).
  // At step 4b the same for the hall: sitting down at a table has already brought the camera to the role page's view.
  const cut = (moving && from === "/work" && to.startsWith("/work/")) || (from === "/roles" && to.startsWith("/roles/"));
  const total = Math.max(dur, cut ? 0 : liftAt + liftDur, typeAt + 0.9);
  return { from, to, A, B, phone, dur, tilt, typeAt, liftAt, liftDur, rise, total, cut };
}

interface Line { name: string; ink: boolean; x: number; y: number; w: number; h: number; order: number; /** an object drawn once above both layers (Contact's clock): not clipped to a side */ whole: boolean }
interface Pending { plan: Plan; page: { x: number; y: number } | null; lines: Line[]; reduced: boolean; started: Promise<number>; start: (t0: number) => void }

/**
 * A line's clip: its side of the seam, cut to the line's own box. Chrome paints a clip's mask as large as the
 * clip's polygon, so the side itself (a half screen) gave each of Contact's 43 lines a mask a screen in size, over
 * 500 MB of tiles at 2x, past Chrome's tile budget: frames drawn between the painted ones showed the snapshot's
 * lines missing, or the page black (the owner's Mac, Contact to the colophon). Always 8 points, so that one keyframe
 * eases into the next whatever the cut leaves.
 */
export function lineClip(side: [number, number][], l: Pick<Line, "x" | "y" | "w" | "h">) {
  const m = 2, box: [number, number][] = [[l.x - m, l.y - m], [l.x + l.w + m, l.y - m], [l.x + l.w + m, l.y + l.h + m], [l.x - m, l.y + l.h + m]];
  const cut = intersect(side, box), pts = cut.length ? cut : [[l.x, l.y], [l.x, l.y], [l.x, l.y]] as [number, number][];
  while (pts.length < 8) pts.push(pts[pts.length - 1]);
  return css(pts.slice(0, 8), l.x, l.y);
}

const pathOf = (to: string) => to.split("#")[0] || "/";
let pending: Pending | null = null;
let running: { plan: Plan; tl: gsap.core.Timeline } | null = null;
let token = 0; // a sweep queued to start, cancelled when another navigation begins
let current: Pending | null = null; // the page change under way, from beginNav until its sweep is over
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrolls = new Map<string, number>();
let restoreTo: number | null = null;

/**
 * Called just before a navigation commits (a link click, Back or Forward), while the old page is still in
 * the DOM. `restoreScroll`: Back or Forward, so the arriving page returns to where it was left.
 */
export function beginNav(to: string, from: string, { restoreScroll = false } = {}) {
  trace(`page change to ${to}: clicked`);
  // scroll positions are kept per document path (the one page is "/", whichever section it is left on)
  scrolls.set(location.pathname, window.scrollY);
  restoreTo = restoreScroll ? scrolls.get(pathOf(to)) ?? null : null;
  const B = restFor(to);
  if (B == null || restFor(from) == null || to === from) { pending = current = null; return; }
  running?.tl.progress(1); token++;
  const phone = isPhone(), reduced = reducedMotion();
  const p = plan(from, to, seam.at, B, phone);
  // name the old page's lines so the browser captures each one on its own, and remember where they were
  document.querySelectorAll<HTMLElement>("[data-vt-line]").forEach((e) => { e.style.viewTransitionName = ""; });
  const page = document.querySelector<HTMLElement>("[data-vt-page]");
  const lines: Line[] = [];
  if (!reduced && page) {
    const count = { ink: 0, inv: 0 };
    page.querySelectorAll<HTMLElement>("[data-vt-line]").forEach((e, i) => {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      if (r.width < 1 || r.bottom < 0 || r.top > innerHeight || cs.visibility === "hidden" || +cs.opacity < 0.05) return;
      // paper type on the dark side: the inverted copy, or a page's only copy where it never meets the seam
      const ink = !e.closest("[data-layer=inv], [data-on=dark]"), name = `vl-${i}`;
      e.style.viewTransitionName = name; (e.style as CSSStyleDeclaration & { viewTransitionClass: string }).viewTransitionClass = "vt-line";
      lines.push({ name, ink, x: r.left, y: r.top, w: r.width, h: r.height, order: ink ? count.ink++ : count.inv++, whole: e.hasAttribute("data-vt-whole") });
    });
  }
  restColours(false); // the leaving copy is captured as it looks while the seam crosses it
  const r = page?.getBoundingClientRect();
  let start: (t0: number) => void = () => {};
  const started = new Promise<number>((res) => { start = res; });
  if (reduced) start(now());
  begun = now();
  pending = current = { plan: p, page: r ? { x: r.left, y: r.top } : null, lines, reduced, started, start };
}

export interface Arrival { reduced: boolean; /** runs `fn(delay)` when the seam starts: delay is seconds until the type should rise */ rise: (fn: (delay: number) => void) => () => void }

/**
 * The arriving page asks when its own type should rise, or gets null when nothing is arriving. Ask from a
 * layout effect: during a view transition React runs passive effects only once it has finished. The answer
 * holds until the sweep is over, so an effect that runs again gets it again, with the time already gone
 * taken off. `rise` returns a cancel for the effect's cleanup.
 */
export function arrival(path: string): Arrival | null {
  const job = current;
  if (!job || pathOf(job.plan.to) !== path) return null;
  return {
    reduced: job.reduced,
    rise: (fn) => {
      let live = true;
      job.started.then((t0) => { if (live) fn(job.reduced ? 0 : Math.max(0, job.plan.rise - (now() - t0) / 1000)); });
      return () => { live = false; };
    },
  };
}

/** A page change is under way (from the click until its sweep is over): the seam belongs to the sweep. */
export const navigating = () => current != null && (running != null || now() - begun < 6000); // a change that never commits lets go
let begun = 0;

/** The arriving page has mounted: put the live seam where the old page left it. */
export function arrived(path: string) {
  trace(`page change to ${path}: new page mounted`);
  if (restoreTo != null) { window.scrollTo(0, restoreTo); restoreTo = null; }
  else if (current && pathOf(current.plan.to) === path && current.plan.to.includes("#")) {
    // a section of the one page: land on it (the page's own glide would be seen; this is under the snapshot)
    const el = document.getElementById(current.plan.to.split("#")[1]);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  }
  wakeNear(); // a scene the jump brought near gets its buffers before this frame (keep.ts)
  if (current && pathOf(current.plan.to) === path) {
    if (pending !== current) return; // already under way (an effect that runs twice)
    if (pending.reduced) { setSeam(pending.plan.B); pending = current = null; requestAnimationFrame(() => restColours(true)); return; }
    setSeam(pending.plan.A);
    return;
  }
  // arrived without a sweep (first load, or from résumé mode): the page's own resting seam
  const rest = restFor(path);
  if (rest != null && !running) { setSeam(rest); requestAnimationFrame(() => restColours(true)); }
}

/**
 * Starts the sweep. `oldGroup` is the leaving page's view-transition name, or null where the browser has
 * no View Transitions (the live seam still travels; there is no old page to see).
 */
export function startSweep(oldGroup: string | null) {
  if (!pending) return;
  trace("page change: snapshot taken");
  const job = pending, mine = token; pending = null;
  // Wait until the arriving page has painted twice: a page that builds a 3D scene can hold the main thread
  // for a moment, and the snapshot (frozen, whole) is a better thing to see meanwhile than a half-drawn
  // sweep. The hold keeps the view transition, which ends once its animations do, open until then.
  const root = document.documentElement;
  const hold = oldGroup ? root.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 10_000, pseudoElement: `::view-transition-group(${oldGroup})` }) : null;
  // Each line was captured on its own, without the clip its layer had, so the paper copy of a line would cover its ink
  // copy until the sweep starts. Hold every line to its own side of the seam as it stands, from the first frame.
  const W = innerWidth, H = innerHeight, sd = sides(job.plan.A, 0, W, H, job.plan.phone);
  const holds = oldGroup ? job.lines.filter((l) => !l.whole).map((l) => { const c = lineClip(l.ink ? sd.light : sd.dark, l);
    return root.animate([{ clipPath: c }, { clipPath: c }], { duration: 10_000, pseudoElement: `::view-transition-group(${l.name})` }); }) : [];
  const release = () => { hold?.cancel(); holds.forEach((h) => h.cancel()); };
  requestAnimationFrame(() => requestAnimationFrame(() => { if (mine === token) run(job, oldGroup, release); else release(); }));
}

function run(job: Pending, oldGroup: string | null, release: () => void) {
  const { plan: p, page, lines } = job;
  registerEases();
  job.start(now());
  if (p.dur) cue("seam", { gain: 0.7 }); // a felt swish under the sweep (a cut is silent)
  const ease = gsap.parseEase("seam"), W = innerWidth, H = innerHeight;
  const at = (t: number) => { const q = p.dur ? ease(Math.min(1, t / p.dur)) : 1; return { at: p.A + (p.B - p.A) * q, tilt: p.tilt * Math.sin(Math.PI * q) }; };
  const lift = (t: number) => (p.cut ? 0 : H * ease(Math.min(1, Math.max(0, (t - p.liftAt) / p.liftDur))));

  const st = { t: 0 };
  const site = document.querySelector<HTMLElement>(".site");
  site?.setAttribute("data-seam-moving", "");
  const tl = gsap.timeline({ onComplete: () => { setSeam(p.B); running = null; if (current === job) current = null; site?.removeAttribute("data-seam-moving"); restColours(true); } });
  tl.to(st, { t: p.total, duration: p.total, ease: "none", onUpdate: () => { const s = at(st.t); setSeam(s.at, s.tilt); } });
  running = { plan: p, tl };
  if (!oldGroup) { release(); return; }

  // Sample the seam at 30 fps into keyframes for the snapshot's pseudo-elements.
  const n = Math.max(2, Math.ceil(p.total * 30)), ms = p.total * 1000, root = document.documentElement;
  const frames = (fn: (t: number) => string) => Array.from({ length: n + 1 }, (_, i) => ({ clipPath: fn((i / n) * p.total), offset: i / n }));
  const closing = (t: number) => {
    const s = at(t), sd = sides(s.at, s.tilt, W, H, p.phone);
    if (Math.abs(p.B - p.A) <= 0.02) return [[-400, -400], [W + 400, -400], [W + 400, H], [-400, H]] as [number, number][];
    return p.B < p.A ? sd.light : sd.dark;
  };
  for (const n of ["chrome", "cursor"]) root.animate([{ opacity: 0 }, { opacity: 0 }], { duration: ms, fill: "both", pseudoElement: `::view-transition-old(${n})` });
  const dx = page?.x ?? 0, dy = page?.y ?? 0;
  // What is left rises out of its own region, as a line rises out of its mask: the image moves up, and
  // only what was inside the region stays visible (the region, intersected with itself shifted up).
  root.animate(frames((t) => { const r = closing(t), d = lift(t); return css(intersect(r, r.map(([x, y]) => [x, y - d] as [number, number])), dx, dy); }),
    { duration: ms, fill: "both", pseudoElement: `::view-transition-group(${oldGroup})` });
  if (p.cut) {
    const k = p.dur / p.total; // gone on the frame the seam lands
    root.animate([{ opacity: 1 }, { opacity: 1, offset: k }, { opacity: 0, offset: k }, { opacity: 0 }], { duration: ms, fill: "both", pseudoElement: `::view-transition-old(${oldGroup})` });
  } else root.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-H}px)` }], {
    duration: p.liftDur * 1000, delay: p.liftAt * 1000, fill: "both", easing: "cubic-bezier(.7,0,.13,1)", pseudoElement: `::view-transition-image-pair(${oldGroup})`,
  });
  for (const l of lines) {
    if (!l.whole) root.animate(frames((t) => { const s = at(t), sd = sides(s.at, s.tilt, W, H, p.phone); return lineClip(l.ink ? sd.light : sd.dark, l); }),
      { duration: ms, fill: "both", pseudoElement: `::view-transition-group(${l.name})` });
    root.animate([{ transform: "translateY(0)" }, { transform: "translateY(-135%)" }], {
      duration: 500, delay: (p.typeAt + (l.whole ? 0.05 : l.order * 0.05)) * 1000, fill: "both", easing: "cubic-bezier(.7,0,.13,1)", pseudoElement: `::view-transition-image-pair(${l.name})`,
    });
  }
  release();
}

/** Where the browser starts no view transition, begin the live sweep on the arriving page's first frame. */
export function sweepWithoutSnapshot(path: string) {
  if (pending && pending === current && pathOf(pending.plan.to) === path) startSweep(null);
}
