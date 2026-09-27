import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { yieldToMain } from "@/lib/idle";
import { PLACE_PATH, T } from "@/lib/motion/tokens";

/**
 * The motion system (brief §7, Phase 3), loaded lazily after the page is
 * interactive. Lenis and every tween share one clock (GSAP's ticker, as in
 * the PX PUSH case study). Effects are declared with `data-fx` in the markup
 * and attached by one registrar that runs after each route change and cleans
 * up on the next. The reveals play once on entry, so an IntersectionObserver
 * starts them: no scroll-position measuring, no page-wide refresh. The one
 * scrubbed effect (the scoresheet settling) is a CSS scroll-driven animation.
 * Nothing here hides content before it runs, and under reduced motion
 * nothing runs at all.
 */

gsap.registerPlugin(SplitText, CustomEase);
CustomEase.create("place", PLACE_PATH);

const s = (ms: number) => ms / 1000;

type Effect = (el: HTMLElement) => (() => void) | void;

/** Already on screen when the page arrived: leave it alone; motion is for what comes into view. */
function seen(el: HTMLElement, at = 0.88): boolean {
  return el.getBoundingClientRect().top < window.innerHeight * at;
}

/** Calls `play` once, when the element's top crosses `at` of the viewport height. */
function onEnter(el: HTMLElement, at: number, play: () => void): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      play();
    },
    { rootMargin: `0px 0px -${Math.round((1 - at) * 100)}% 0px` },
  );
  io.observe(el);
  return () => io.disconnect();
}

const EFFECTS: Record<string, Effect> = {
  /**
   * Section titles as annotations: the move number, then the move, then the
   * glyph where there is one, then the title's words, each behind a mask.
   */
  annotate(el) {
    if (seen(el)) return;
    const parts = [...el.querySelectorAll<HTMLElement>("[data-fx-part]")];
    const title = el.querySelector<HTMLElement>("[data-fx-title]") ?? el;
    const split = SplitText.create(title, { type: "words", mask: "words", aria: "none" });
    gsap.set(parts, { yPercent: 105 });
    gsap.set(split.words, { yPercent: 105 });
    const tl = gsap.timeline({ paused: true, defaults: { duration: s(T.move), ease: "place" } });
    parts.forEach((p, i) => tl.to(p, { yPercent: 0 }, i * 0.08));
    tl.to(split.words, { yPercent: 0, stagger: 0.05 }, parts.length ? parts.length * 0.08 + 0.04 : 0);
    const stop = onEnter(el, 0.88, () => tl.play());
    return () => {
      stop();
      tl.kill();
      split.revert();
      gsap.set(parts, { clearProps: "transform" });
    };
  },

  /**
   * Margin annotations (from Illoca's sidebars): slide in once from the
   * margin at reading pace and stay. Only where there is a margin to come from.
   */
  margin(el) {
    if (!window.matchMedia("(min-width: 1280px)").matches || seen(el, 0.85)) return;
    gsap.set(el, { x: 24, opacity: 0 });
    let tween: gsap.core.Tween | null = null;
    const stop = onEnter(el, 0.85, () => {
      tween = gsap.to(el, { x: 0, opacity: 1, duration: s(T.reframe), ease: "place" });
    });
    return () => {
      stop();
      tween?.kill();
      gsap.set(el, { clearProps: "transform,opacity" });
    };
  },
};

export type MotionController = { attach: (root: ParentNode) => Promise<void>; destroy: () => void };

export function startMotion(): MotionController {
  const smooth = window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1024;
  let lenis: Lenis | null = null;
  let tick: ((time: number) => void) | null = null;
  if (smooth) {
    lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.14 });
    tick = (time: number) => lenis!.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }
  let cleanups: (() => void)[] = [];
  // Each attach supersedes the last; a stale one stops at its next yield.
  let generation = 0;
  return {
    async attach(root) {
      const mine = ++generation;
      cleanups.forEach((c) => c());
      cleanups = [];
      for (const el of root.querySelectorAll<HTMLElement>("[data-fx]")) {
        const fx = EFFECTS[el.dataset.fx ?? ""];
        const done = fx?.(el);
        if (done) cleanups.push(done);
        // One effect per task: splitting and measuring every title at once is a long task on a phone.
        await yieldToMain();
        if (mine !== generation) return;
      }
    },
    destroy() {
      generation++;
      cleanups.forEach((c) => c());
      cleanups = [];
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    },
  };
}
