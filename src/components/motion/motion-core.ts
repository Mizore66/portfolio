import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { PLACE_PATH, T } from "@/lib/motion/tokens";

/**
 * The motion system (brief §7, Phase 3), loaded lazily after the page is
 * interactive. Lenis and every ScrollTrigger share one clock (GSAP's ticker,
 * as in the PX PUSH case study). Effects are declared with `data-fx` in the
 * markup and attached by one registrar that runs after each route change and
 * cleans up on the next. Nothing here hides content before it runs, and under
 * reduced motion nothing runs at all.
 */

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("place", PLACE_PATH);

const s = (ms: number) => ms / 1000;

type Effect = (el: HTMLElement) => (() => void) | void;

/** Already on screen when the page arrived: leave it alone; motion is for what comes into view. */
function seen(el: HTMLElement, at = 0.88): boolean {
  return el.getBoundingClientRect().top < window.innerHeight * at;
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
    const st = ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => tl.play() });
    return () => {
      st.kill();
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
    const tween = gsap.from(el, {
      x: 24,
      opacity: 0,
      duration: s(T.reframe),
      ease: "place",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el, { clearProps: "transform,opacity" });
    };
  },

  /** The scoresheet slip (from Illoca's folders): arrives tilted and settles square as it rises. */
  settle(el) {
    const tween = gsap.fromTo(
      el,
      { rotation: -2.5, y: 32 },
      { rotation: 0, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 55%", scrub: true } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el, { clearProps: "transform" });
    };
  },
};

export type MotionController = { attach: (root: ParentNode) => void; destroy: () => void };

export function startMotion(): MotionController {
  const smooth = window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1024;
  let lenis: Lenis | null = null;
  let tick: ((time: number) => void) | null = null;
  if (smooth) {
    lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.14 });
    lenis.on("scroll", ScrollTrigger.update);
    tick = (time: number) => lenis!.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }
  let cleanups: (() => void)[] = [];
  return {
    attach(root) {
      cleanups.forEach((c) => c());
      cleanups = [];
      root.querySelectorAll<HTMLElement>("[data-fx]").forEach((el) => {
        const fx = EFFECTS[el.dataset.fx ?? ""];
        const done = fx?.(el);
        if (done) cleanups.push(done);
      });
      ScrollTrigger.refresh();
    },
    destroy() {
      cleanups.forEach((c) => c());
      cleanups = [];
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    },
  };
}
