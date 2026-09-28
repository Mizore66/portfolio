// Phase 3 motion kit (throwaway prototypes). A paused GSAP timeline that plays live,
// or is seeked frame by frame when the page is opened with ?capture (see _capture.cjs).
import { gsap } from "/node_modules/gsap/index.js";
import { CustomEase } from "/node_modules/gsap/CustomEase.js";
gsap.registerPlugin(CustomEase);
export { gsap };

// House easing. One heavy in-out for everything that travels (the seam, the camera);
// one out-only for arrivals. Nothing overshoots: an eval bar never passes its value.
CustomEase.create("seam", "M0,0 C0.7,0 0.13,1 1,1");
CustomEase.create("arrive", "M0,0 C0.16,0.84 0.3,1 1,1");
// The seam stepping to a new evaluation: a critically damped spring (fast, then settles, no overshoot).
const K = 7, NORM = 1 - (1 + K) * Math.exp(-K);
export const evalStep = (t) => (1 - (1 + K * t) * Math.exp(-K * t)) / NORM;

/** Phones get their own composition: the seam turns horizontal, white on top. */
export const mobile = innerWidth < 600;
export const capture = new URLSearchParams(location.search).has("capture");
export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).has("reduced");

/** Eval (centipawns, White's view) to the share of the screen that is white, as the hero uses. */
export const share = (cp) => .5 + .5 * Math.tanh(.00368208 * cp / 2);

/** A seam that can move. Paints the dark side (or the white side when under:true) and an inverted clone of #ink. */
export function liveSeam(root, { dir = "v", under = false, dark = "var(--ink)", light = "var(--paper)" } = {}) {
  const ink = root.querySelector("#ink"), bg = document.createElement("div");
  bg.className = "seam-bg"; bg.style.cssText = `position:absolute;inset:0;background:${under ? light : dark};z-index:${under ? 1 : 0}`;
  ink.before(bg);
  const inv = ink.cloneNode(true); inv.id = "ink-inv"; inv.setAttribute("aria-hidden", "true");
  inv.style.cssText += ";--fg:var(--paper);--fg2:#b9b5ad"; ink.after(inv);
  const state = { at: .5, tilt: 0 };
  function set(at = state.at, tilt = state.tilt) {
    state.at = at; state.tilt = tilt;
    const W = root.clientWidth, H = root.clientHeight;
    let d, l;
    if (dir === "h") { const y = at * H, o = Math.tan(tilt * Math.PI / 180) * W / 2; d = `polygon(0 ${y - o}px,${W}px ${y + o}px,${W}px ${H + 400}px,0 ${H + 400}px)`; l = `polygon(0 -400px,${W}px -400px,${W}px ${y + o}px,0 ${y - o}px)`; }
    else { const x = at * W, o = Math.tan(tilt * Math.PI / 180) * H / 2; d = `polygon(${x - o}px 0,${W + 400}px 0,${W + 400}px ${H}px,${x + o}px ${H}px)`; l = `polygon(-400px 0,${x - o}px 0,${x + o}px ${H}px,-400px ${H}px)`; }
    bg.style.clipPath = under ? l : d; inv.style.clipPath = d;
  }
  set();
  return { set, state, inv, bg };
}

/** Wire a paused timeline: plays in real time normally; exposes window.__seek for capture. */
export function run(tl, { render = () => {}, loop = false } = {}) {
  window.__duration = tl.duration();
  window.__seek = (t) => { tl.seek(t, false); render(); };
  if (capture) { tl.pause(0); render(); window.__ready = true; return; }
  if (reduced) { tl.progress(1); render(); window.__ready = true; return; }
  if (loop) tl.repeat(-1).repeatDelay(1.2);
  gsap.ticker.add(render); tl.play(0); window.__ready = true;
}

/** Tween the same selector in both seam layers, staggered within each layer, so the inverted copy moves in step. */
export function both(tl, sel, vars, pos) {
  for (const id of ["ink", "ink-inv"]) { const els = document.querySelectorAll(`#${id} ${sel}`); if (els.length) tl.to(els, { ...vars }, pos); }
  return tl;
}

/** A stagger that counts within each seam layer: pass as `stagger: per(.05)`. */
export const per = (each) => (i, el, list) => { const L = !!el.closest("#ink-inv"); let k = 0; for (let j = 0; j < i; j++) if (!!list[j].closest("#ink-inv") === L) k++; return k * each; };
