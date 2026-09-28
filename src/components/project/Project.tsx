"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { PHONE, restColours, restFor, setSeam } from "@/lib/seam/seam";
import { arrival, navigating } from "@/lib/seam/sweep";
import { createProjectStage, type ProjectStage } from "./stage";
import "./project.css";

export interface ProjectHead { slug: string; name: string[]; meta: string; subtitle: string; claim: string; qualifier: string; move: string }

const TURN = (20 * Math.PI) / 180, SWING = (15 * Math.PI) / 180;
/** how far down the page (in screens) the seam starts to narrow, and where it is a hairline */
const NARROW = [0.45, 1.0];

function Letters({ word }: { word: string }) {
  return <>{[...word].map((c, i) => <span key={i} className="ch" aria-hidden="true">{c}</span>)}</>;
}

/** One copy of the first screen's type: in ink, or in paper clipped to the dark side. */
function Type({ head, inv }: { head: ProjectHead; inv?: boolean }) {
  const H = inv ? "p" : "h1";
  return (
    <div className={`proj-layer${inv ? " seam-dark" : ""}`} data-layer={inv ? "inv" : "ink"} aria-hidden={inv || undefined} inert={inv || undefined}>
      <div className="proj-head">
        <H className="proj-name display" aria-label={inv ? undefined : head.name.join(" ")}>
          {head.name.map((w) => <span key={w} className="ln" data-vt-line=""><Letters word={w} /></span>)}
        </H>
        <p className="proj-meta"><span className="ln" data-vt-line=""><span data-rise="">{head.meta}</span></span></p>
      </div>
      <div className="proj-foot">
        <p className="proj-sub"><span className="ln" data-vt-line=""><span data-rise="">{head.subtitle}</span></span></p>
        <p className="proj-claim"><span className="ln" data-vt-line=""><span data-rise="">{head.claim}</span></span></p>
        <p className="proj-q"><span className="ln" data-vt-line=""><span data-rise="">{head.qualifier}</span></span></p>
      </div>
      <p className="proj-ev mono"><span className="ln" data-vt-line=""><span data-rise="">{head.move}</span></span></p>
    </div>
  );
}

/**
 * A project page (key frame proj-a; design/motion.md §8). The piece stands on the seam at its move's eval
 * and inverts like the name. Scrolling turns it 20°, then the seam narrows to a hairline at the left edge
 * and the case study rises on the gallery black. The pointer moves the key light (fine pointers only).
 */
export function Project({ head, children }: { head: ProjectHead; children: React.ReactNode }) {
  const path = usePathname();
  const root = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const el = root.current!, site = el.closest<HTMLElement>(".site")!;
    registerEases();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phoneQ = window.matchMedia(PHONE);
    const rest = () => restFor(path) ?? 0.5;
    // The stage is built on the next frame, outside the commit (see WorkIndex): the snapshot covers the wait.
    let stage: ProjectStage | null = null, failed = false, dead = false, raf = 0;
    const draw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; stage?.render(); }); };
    const seat = () => stage?.seat(rest(), phoneQ.matches);
    const build = () => {
      if (stage || failed || dead) return;
      try { stage = createProjectStage(canvas.current!, head.slug); } catch { failed = true; el.dataset.gl = "off"; return; }
      seat(); stage.pose.turn = reduced ? 0 : TURN * Math.min(1, Math.max(0, window.scrollY / innerHeight)); stage.ready.then(draw);
    };
    const buildId = requestAnimationFrame(build);

    // the arriving name rises across the seam, letter by letter, then the rest line by line
    const a = arrival(path);
    let tl: gsap.core.Timeline | undefined, cancel = () => {};
    const ch = el.querySelectorAll(".proj-name .ch"), lines = el.querySelectorAll("[data-rise]");
    if (a && !a.reduced) {
      gsap.set(ch, { yPercent: 135 }); gsap.set(lines, { yPercent: 135 });
      cancel = a.rise((d) => {
        build();
        tl = gsap.timeline()
          .to(ch, { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.028) }, d)
          .to(lines, { yPercent: 0, duration: 0.6, ease: "arrive", stagger: perLayer(0.07) }, d + 0.3);
      });
    }

    // Scroll: the turn, then the seam narrows to a hairline. It never fights a sweep: while the seam is
    // travelling between pages it is the sweep's; the page takes it back once the sweep is over.
    let settle = 0, last = -1;
    const hair = () => (phoneQ.matches ? 3 / innerHeight : 3 / innerWidth);
    const ease = gsap.parseEase("seam");
    const onScroll = () => {
      if (site.hasAttribute("data-seam-moving") || navigating()) return;
      const p = window.scrollY / innerHeight;
      el.toggleAttribute("data-deep", p > 0.95);
      if (stage && !reduced) { stage.pose.turn = TURN * Math.min(1, Math.max(0, p)); draw(); }
      const q = Math.min(1, Math.max(0, (p - NARROW[0]) / (NARROW[1] - NARROW[0])));
      const at = rest() + (hair() - rest()) * ease(q);
      if (Math.abs(at - last) < 1e-4) return;
      last = at; setSeam(at);
      clearTimeout(settle); settle = window.setTimeout(() => restColours(true), 120);
    };
    const moving = new MutationObserver(() => { if (!site.hasAttribute("data-seam-moving")) { last = -1; onScroll(); } });
    moving.observe(site, { attributes: true, attributeFilter: ["data-seam-moving"] });
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!a) onScroll();
    else if (a.reduced) requestAnimationFrame(() => { last = -1; onScroll(); }); // a cut: the page takes its seam once it has landed

    // the key light follows a fine pointer within ±15°, eased at lerp .08
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced;
    let want = 0, loop = 0;
    const follow = () => {
      if (!stage) return;
      stage.pose.light += (want - stage.pose.light) * 0.08; stage.render();
      loop = Math.abs(want - stage.pose.light) > 1e-4 ? requestAnimationFrame(follow) : 0;
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      want = ((e.clientX / innerWidth) * 2 - 1) * SWING;
      if (!loop) loop = requestAnimationFrame(follow);
    };
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    const onResize = () => { stage?.resize(); seat(); last = -1; onScroll(); draw(); };
    window.addEventListener("resize", onResize);
    return () => {
      dead = true; cancelAnimationFrame(buildId);
      cancel(); tl?.kill(); gsap.set([...ch, ...lines], { clearProps: "transform" });
      moving.disconnect(); clearTimeout(settle); cancelAnimationFrame(raf); cancelAnimationFrame(loop);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onPointer); window.removeEventListener("resize", onResize);
      stage?.dispose();
    };
  }, [path, head.slug]);

  return (
    <main ref={root} id="main" tabIndex={-1} className="proj" data-project={head.slug}>
      <section className="proj-top">
        <div className="proj-pin">
          <div className="proj-dark" />
          <canvas ref={canvas} className="proj-canvas" aria-hidden="true" />
          <Type head={head} />
          <Type head={head} inv />
        </div>
      </section>
      <div className="proj-veil" aria-hidden="true" />
      {children}
    </main>
  );
}
