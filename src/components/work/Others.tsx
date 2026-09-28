"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { beginNav, navigating } from "@/lib/seam/sweep";
import { PHONE, restFor } from "@/lib/seam/seam";
import { after } from "@/lib/motion/slowmo";
import { createSideboard, FRAME, type Frame, type Sideboard } from "./sideboard";

export interface Other { slug: string; name: string; square: string | null; move: string | null; result: string; qualifier: string; aside: boolean }
export interface OthersCopy { title: string; label: string; noMove: string; aside: string }

/**
 * The seven other projects, below the gallery (step 4a, comp A; the old /archive lands here). The scoresheet
 * is the list and every row is a real link; the board beside it shows each line's move at once. Reading a row
 * (hover or focus) lifts its piece into its own light. Opening one steps down to it before the paper sweeps in.
 */
export function Others({ list, copy }: { list: Other[]; copy: OthersCopy }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const b = useRef<Sideboard | null>(null), frame = useRef(0), leaving = useRef(false), arriving = useRef<gsap.core.Timeline | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});

  const draw = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => { frame.current = 0; b.current?.render(); });
  };

  useLayoutEffect(() => {
    const el = root.current!, c = canvas.current!;
    registerEases();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = () => window.matchMedia(PHONE).matches;
    const rise = el.querySelectorAll("[data-rise]"), rows = el.querySelectorAll(".sheet li");
    const setView = (s: Sideboard, f: Frame) => Object.assign(s.cam, { ...f, pos: [...f.pos], look: [...f.look] });
    let board: Sideboard | null = null, failed = false, shown = false, tl: gsap.core.Timeline | undefined;
    const aside = new Set(list.filter((o) => o.aside).map((o) => o.slug));
    const place = () => board && setPos(board.anchors());
    const build = () => {
      if (board || failed) return board;
      try { board = createSideboard(c, list, aside); } catch { failed = true; el.dataset.gl = "off"; return null; }
      b.current = board; setView(board, phone() ? FRAME.phone : FRAME.desk);
      if (!shown && !reduced) board.room.k = 0;
      place(); board.ready.then(draw);
      return board;
    };

    // The type waits below its masks until the board comes into view; then the lamp comes up as the camera
    // settles from higher up, and the lines rise (design/motion.md §3, as the Work room arrives).
    if (!reduced) { gsap.set(rise, { yPercent: 135 }); gsap.set(rows, { opacity: 0, y: 12 }); }
    const arrive = () => {
      if (shown) return;
      shown = true; el.dataset.shown = ""; // the tags come up with the lamp (others.css)
      const s = build();
      if (reduced) { if (s) { s.room.k = 1; draw(); } return; }
      tl = arriving.current = gsap.timeline({ onUpdate: draw });
      if (s) {
        const f = phone() ? FRAME.phone : FRAME.desk;
        s.cam.pos = [f.pos[0], f.pos[1] + 3.2, f.pos[2] + 2.2];
        tl.to(s.cam.pos, { 0: f.pos[0], 1: f.pos[1], 2: f.pos[2], duration: 1.6, ease: "arrive" }, 0).to(s.room, { k: 1, duration: 1.1, ease: "arrive" }, 0.15);
      }
      tl.to(rise, { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.08) }, 0.1)
        .to(rows, { opacity: 1, y: 0, duration: 0.6, ease: "arrive", stagger: 0.06 }, 0.3);
    };
    // built a screen ahead, so the scroll never waits on it; arriving once it is well in view
    const near = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) requestAnimationFrame(build); }, { rootMargin: "100% 0px" });
    const seen = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) arrive(); }, { threshold: 0.3 });
    near.observe(el); seen.observe(el);

    const onResize = () => { if (!board) return; board.resize(); setView(board, phone() ? FRAME.phone : FRAME.desk); place(); draw(); };
    window.addEventListener("resize", onResize);
    return () => {
      near.disconnect(); seen.disconnect(); tl?.kill();
      gsap.set([...rise, ...rows], { clearProps: "transform,opacity" });
      window.removeEventListener("resize", onResize); cancelAnimationFrame(frame.current); frame.current = 0;
      b.current = null; board?.dispose();
    };
  }, [list]);

  // Reading a row: its piece rises into its own light, and the light passes on with no dark gap (motion.md §7).
  useEffect(() => {
    const s = b.current;
    if (!s || leaving.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches, d = reduced ? 0 : 0.4;
    // the lamp eases down a little while a line is read, so the piece in its own light stands out
    const tws = [gsap.to(s.room, { lamp: focus ? 0.62 : 1, duration: d * 1.5, ease: "arrive", onUpdate: draw }), ...list.flatMap((o) => [
      gsap.to(s.lights, { [o.slug]: o.slug === focus ? 1 : 0, duration: d, ease: "arrive", onUpdate: draw }),
      gsap.to(s.lift, { [o.slug]: o.slug === focus && !reduced ? 1 : 0, duration: d * 1.2, ease: "arrive", onUpdate: draw }),
    ])];
    return () => tws.forEach((t) => t.kill());
  }, [focus, list]);

  /** Opening a piece: the camera steps down to it, the rest of the set goes, then the paper sweeps in. */
  const open = (slug: string) => {
    const s = b.current, href = `/work/${slug}`;
    let gone = false;
    const go = () => { if (gone) return; gone = true; beginNav(href, "/work"); router.push(href); };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!s || reduced || leaving.current || navigating()) { go(); return; }
    leaving.current = true; setFocus(slug);
    const phone = window.matchMedia(PHONE).matches, to = s.facing(slug, restFor(href) ?? 0.5, phone);
    s.keep = slug;
    arriving.current?.progress(1).kill(); // a row opened while the board is still arriving: the arrival ends at once
    after(go, 1000); // the page changes on the clock, not on the tween
    const el = root.current!;
    gsap.timeline({ onUpdate: draw })
      .to(s.cam.pos, { 0: to.pos[0], 1: to.pos[1], 2: to.pos[2], duration: 1, ease: "seam" }, 0)
      .to(s.cam.look, { 0: to.look[0], 1: to.look[1], 2: to.look[2], duration: 1, ease: "seam" }, 0)
      .to(s.cam, { fov: to.fov, sx: to.sx, sy: to.sy, duration: 1, ease: "seam" }, 0)
      .to(s.lights, { [slug]: 1, duration: 0.4, ease: "arrive" }, 0)
      .to(s.lift, { [slug]: 0, duration: 0.6, ease: "arrive" }, 0)
      .to(s.spin, { k: 1, duration: 1, ease: "seam" }, 0)
      .to(s.room, { lamp: 0.12, rest: 0, duration: 0.7, ease: "arrive" }, 0)
      .to(el.querySelectorAll("[data-rise]"), { yPercent: -135, duration: 0.5, ease: "seam" }, 0)
      .to(el.querySelectorAll(".sheet li, .others-tags > *"), { opacity: 0, y: -12, duration: 0.3, ease: "seam", stagger: 0.03 }, 0);
  };

  const onPointer = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || leaving.current || !b.current) return;
    const r = canvas.current!.getBoundingClientRect(), s = b.current.pick(e.clientX - r.left, e.clientY - r.top);
    canvas.current!.toggleAttribute("data-hot", !!s);
    setFocus(s);
  };
  const onCanvasClick = (e: React.MouseEvent) => {
    const r = canvas.current!.getBoundingClientRect(), s = b.current?.pick(e.clientX - r.left, e.clientY - r.top);
    if (s) open(s);
  };
  const read = (slug: string | null) => () => { if (!leaving.current) setFocus(slug); };

  return (
    <section ref={root} id="archive" className="others" aria-labelledby="others-title">
      <canvas ref={canvas} className="others-canvas" aria-hidden="true" onPointerMove={onPointer} onPointerLeave={read(null)} onClick={onCanvasClick} />
      <div className="others-paper" />
      <div className="others-layer" data-on="dark">
        <h2 id="others-title" className="others-title display"><span className="ln" data-vt-line=""><span data-rise="">{copy.title}</span></span></h2>
        <ol className="sheet" aria-label={copy.label} onMouseLeave={read(null)}>
          {list.map((o) => (
            <li key={o.slug} data-on={o.slug === focus || undefined}>
              <Link href={`/work/${o.slug}`} data-nav-hold="" onMouseEnter={read(o.slug)} onFocus={read(o.slug)} onBlur={read(null)}
                onClick={(e) => { if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; e.preventDefault(); open(o.slug); }}>
                <span className="mv mono">{o.move ?? "-"}</span>
                <b>{o.name}</b>
                <span className="r">{o.result}</span>
                <span className="q">{o.qualifier}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="others-tags" aria-hidden="true">
          {list.map((o) => {
            const at = pos[o.slug];
            if (!at) return null;
            return (
              <div key={o.slug} className="tag mono" data-on={o.slug === focus || undefined} style={{ left: at.x, top: at.y + 6 }}>
                <span>{o.move ?? copy.noMove}</span>
                {o.aside && o.move ? <span className="aside">{copy.aside}</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
