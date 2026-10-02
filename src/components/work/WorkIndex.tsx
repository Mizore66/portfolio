"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { beginNav } from "@/lib/seam/sweep";
import { buildAhead, firstView, nearScreen } from "@/lib/motion/firstView";
import { PHONE, restFor, TABLET } from "@/lib/seam/seam";
import { after } from "@/lib/motion/slowmo";
import { gallerySteps, VIEW, type Gallery, type View } from "./gallery";
import { staged } from "@/lib/three/steps";
import { claim, keep, sleeper } from "@/lib/three/keep";
import "./work.css";
import { timed, trace } from "@/lib/perf/trace";

export interface Piece { slug: string; name: string; square: string; move: string; result: string; qualifier: string }

const FOCUS = "faultline"; // work-c: the latest move is lit
const DIM = 0.42;

/**
 * The Work room (key frame work-c; design/motion.md §3 and §7). The gallery floor is the board: each
 * project stands on the square its move landed on. Hover or focus a piece to light it; opening one steps
 * down to it before the paper sweeps in. Every label is a real link, and everything the 3D shows is in them.
 */
export function WorkIndex({ pieces }: { pieces: Piece[] }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null), canvas = useRef<HTMLDivElement>(null); // the canvas's slot (keep.ts)
  const g = useRef<Gallery | null>(null), frame = useRef(0);
  const [focus, setFocus] = useState(FOCUS);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const leaving = useRef(false);

  const away = useRef({ near: true, owed: false }); // off screen, a frame is owed, not drawn (nearScreen)
  const draw = useCallback(() => {
    if (!away.current.near) { away.current.owed = true; return; }
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => { frame.current = 0; g.current?.render(); });
  }, []);

  // A layout effect, so the type is hidden before the first paint and the arrival is known at once (during a
  // view transition React holds passive effects until it has finished). The room itself is built on the next
  // frame, outside the commit: on a slow device building it inside would outlast the browser's view-transition
  // timeout. The sweep waits two frames before it starts, and the leaving page's snapshot covers the wait.
  useLayoutEffect(() => {
    const el = root.current!, got = claim<Gallery>("work", [canvas.current!]), c = got.canvases[0];
    registerEases();
    const view = () => (window.matchMedia(TABLET).matches ? VIEW.tablet : window.matchMedia(PHONE).matches ? VIEW.phone : VIEW.desk);
    const arriving = !window.matchMedia("(prefers-reduced-motion: reduce)").matches; // its entrance, the first time it is seen
    const rise = el.querySelectorAll("[data-rise]"), labels = el.querySelectorAll(".piece");
    let gal: Gallery | null = null, failed = false, dead = false, tl: gsap.core.Timeline | undefined;
    const lit = (G: Gallery, k: number) => { for (const p of pieces) G.lights[p.slug] = (p.slug === FOCUS ? 1 : DIM) * k; };
    const setView = (G: Gallery, v: View) => { G.cam.pos.set(...v.pos); G.cam.look.set(...v.look); G.cam.fov = v.fov; G.cam.shift = 0.5; };
    const place = () => gal && setPos(gal.anchors(window.matchMedia(PHONE).matches));
    // its canvas holds its buffers only within a screen of view (keep.ts); a kept gallery wakes, and resizes, as it comes near
    const zz = sleeper(el, [c], () => { if (!gal) return; gal.resize(); draw(); }); // the labels stay where they were
    const adopt = (made: Gallery) => {
      if (dead) { made.dispose(); return; }
      gal = made; trace("work: built");
      // back from a project, the gallery built last time: its view, lights and room are set again below
      if (got.stage) { gal.room.fill = 1; gal.cam.phone = false; } // opening one frames it for phones (open, below)
      g.current = gal; setView(gal, view());
      if (arriving) { gal.room.k = 0; lit(gal, 0); const v = view(); gal.cam.pos.set(v.pos[0], v.pos[1] + 4.8, v.pos[2] + 3.2); } // lights off, camera high
      else { gal.room.k = 1; lit(gal, 1); }
      place(); gal.ready.then(() => { trace("work: compiled"); return got.stage ? undefined : g.current?.warm(); }).then(() => { trace("work: warmed"); timed("work: first draw", () => g.current?.render()); }); // its first frame, drawn ahead wherever the page is
      zz.built(); // one built far off gives its buffers up; a kept one wakes once the page has its scroll (keep.ts)
    };
    // built ahead in slices (steps.ts); reached before it is in, the rest of it at once
    const scene = staged(() => gallerySteps(c, pieces), adopt, () => { failed = true; el.dataset.gl = "off"; }, "work");
    const build = () => { if (!gal && !failed && !dead) { if (got.stage) adopt(got.stage); else scene.now(); } return gal; };
    const start = () => { if (got.stage) build(); else if (!dead) scene.start(); };
    // on the one page the room is built when it comes within a screen, not at load (seven scenes would compile at once)
    if (got.stage) build();
    const stopAhead = buildAhead(el, start, { order: 1 }), stopNear = nearScreen(el, away.current, draw);

    let cancel = () => {};
    if (arriving) {
      gsap.set(rise, { yPercent: 135 }); gsap.set(labels, { opacity: 0, y: 12 });
      // called as the seam starts to move; `delay` is when the type should rise, as it lands
      cancel = firstView(el, () => {
        const delay = 0.15;
        const G = build();
        tl = gsap.timeline({ onUpdate: draw });
        if (G) {
          // the camera settles from higher and further out as the lights come up, FaultLine's first (motion.md §3)
          const v = view(), lights: Record<string, number> = Object.fromEntries(pieces.map((p) => [p.slug, 0]));
          tl.to(G.cam.pos, { x: v.pos[0], y: v.pos[1], z: v.pos[2], duration: 1.8, ease: "arrive" }, 0)
            .to(G.room, { k: 1, duration: 1.1, ease: "arrive" }, 0.4);
          for (const p of pieces) {
            const on = p.slug === FOCUS;
            tl.to(lights, { [p.slug]: on ? 1 : DIM, duration: 1.1, ease: "arrive", onUpdate: () => { G.lights[p.slug] = lights[p.slug]; } }, on ? 0.2 : 0.4);
          }
        }
        tl.to(rise, { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.08) }, delay)
          .to(labels, { opacity: 1, y: 0, duration: 0.6, ease: "arrive", stagger: 0.08 }, delay + 0.2);
      });
    }

    const onResize = () => { if (!gal) return; if (!zz.asleep) gal.resize(); setView(gal, view()); place(); draw(); };
    window.addEventListener("resize", onResize);
    return () => {
      dead = true; stopAhead(); stopNear(); zz.stop();
      cancel(); tl?.kill(); gsap.set(rise, { clearProps: "transform" }); gsap.set(labels, { clearProps: "opacity,transform" });
      window.removeEventListener("resize", onResize); cancelAnimationFrame(frame.current); frame.current = 0;
      g.current = null;
      const kept = gal; if (kept) keep("work", [c], kept, () => kept.dispose());
    };
  }, [pieces, draw]);

  // Hover: the light passes from one piece to the next with no dark gap (motion.md §7).
  useEffect(() => {
    const gal = g.current;
    if (!gal || leaving.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tws = pieces.map((p) => gsap.to(gal.lights, { [p.slug]: p.slug === focus ? 1 : DIM, duration: reduced ? 0 : 0.4, ease: "arrive", onUpdate: draw }));
    return () => tws.forEach((t) => t.kill());
  }, [focus, pieces, draw]);

  /** Opening a piece: the camera steps down to it and the other lights go out, then the paper sweeps in. */
  const open = (slug: string) => {
    const gal = g.current, href = `/work/${slug}`;
    let gone = false;
    const go = () => { if (gone) return; gone = true; beginNav(href, "/work"); router.push(href); };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!gal || reduced || leaving.current) { go(); return; }
    leaving.current = true; setFocus(slug);
    const phone = window.matchMedia(PHONE).matches, to = gal.facing(slug, restFor(href) ?? 0.5, phone);
    gal.cam.phone = phone;
    const el = root.current!;
    // the page changes on the clock, not on the tween: a slow frame must not hold the visitor in the room
    after(go, 1000);
    gsap.timeline({ onUpdate: draw })
      .to(gal.cam.pos, { x: to.pos[0], y: to.pos[1], z: to.pos[2], duration: 1, ease: "seam" }, 0)
      .to(gal.cam.look, { x: to.look[0], y: to.look[1], z: to.look[2], duration: 1, ease: "seam" }, 0)
      .to(gal.cam, { fov: to.fov, shift: to.shift, duration: 1, ease: "seam" }, 0)
      .to(gal.lights, { ...Object.fromEntries(pieces.map((p) => [p.slug, p.slug === slug ? 1 : 0])), duration: 0.6, ease: "arrive" }, 0)
      .to(gal.room, { fill: 0.15, duration: 0.8, ease: "arrive" }, 0)
      // the room's type leaves as everything does: upward, out of its masks
      .to(el.querySelectorAll(".work-title [data-rise]"), { yPercent: -135, duration: 0.5, ease: "seam" }, 0)
      .to(el.querySelectorAll(".piece"), { opacity: 0, y: -12, duration: 0.3, ease: "seam", stagger: 0.05 }, 0);
  };

  const onPointer = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || leaving.current || !g.current) return;
    const s = g.current.pick(e.clientX, e.clientY - canvas.current!.getBoundingClientRect().top);
    canvas.current!.toggleAttribute("data-hot", !!s);
    if (s && s !== focus) setFocus(s);
  };
  const onCanvasClick = (e: React.MouseEvent) => {
    const s = g.current?.pick(e.clientX, e.clientY - canvas.current!.getBoundingClientRect().top);
    if (s) open(s);
  };

  return (
    <section ref={root} id="work" className="work" data-rest="0" data-rest-phone="0" aria-labelledby="work-title">
      <div ref={canvas} className="work-canvas keep-slot" aria-hidden="true" onPointerMove={onPointer} onClick={onCanvasClick} />
      <div className="work-paper" />
      <div className="work-layer" data-on="dark">
        <h2 id="work-title" className="work-title display"><span className="ln" data-vt-line=""><span data-rise="">Work</span></span></h2>
        <ul className="work-pieces" aria-label="Selected work">
          {pieces.map((p) => {
            const at = pos[p.slug];
            return (
              <li key={p.slug} className="piece" data-on={p.slug === focus || undefined} data-placed={at ? "" : undefined} style={at ? { "--x": `${at.x}px`, "--y": `${at.y}px` } as React.CSSProperties : undefined}>
                <Link href={`/work/${p.slug}`} data-nav-hold="" onMouseEnter={() => !leaving.current && setFocus(p.slug)} onFocus={() => !leaving.current && setFocus(p.slug)}
                  onClick={(e) => { if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; e.preventDefault(); open(p.slug); }}>
                  <span className="ln" data-vt-line=""><b>{p.name}</b></span>
                  <span className="more">
                    <span className="n">{p.result}</span>
                    <span className="q">{p.qualifier}</span>
                    <span className="sq mono">{p.square}, where {p.move} landed</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <noscript><style>{".work .work-pieces{position:absolute;left:64px;top:22vh;display:grid;gap:28px}html .work:not([data-gl]) .piece:not([data-placed]){visibility:visible}.work .piece .more{opacity:1}@media (max-width:600px){.work .work-pieces{left:20px;top:190px}.work .piece{left:auto;max-width:none;transform:none}}"}</style></noscript>
    </section>
  );
}
