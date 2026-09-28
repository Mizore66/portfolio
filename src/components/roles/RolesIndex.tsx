"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { arrival, beginNav, navigating } from "@/lib/seam/sweep";
import { PHONE } from "@/lib/seam/seam";
import { after } from "@/lib/motion/slowmo";
import { createHall, FRAME, type Frame, type Hall } from "./hall";
import "./roles.css";

export interface HallTable { slug: string; name: string; when: string; current: boolean; fen: string; last: string[] }

/**
 * The Roles index (key frame roles-b, "along the row"; design/motion.md §4 and §9): the day hall seen along its
 * row of seven tables, Deriv's in front. Reading a name lights that table's lamp and eases the camera toward it;
 * opening one sits down at it: the camera drops to the low corner the role page is seen from, then the page cuts in.
 */
export function RolesIndex({ list, copy }: { list: HallTable[]; copy: { title: string; sub: string; now: string; label: string } }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const h = useRef<Hall | null>(null), frame = useRef(0), leaving = useRef(false), home = useRef<Frame>(FRAME.desk);
  const [focus, setFocus] = useState<string | null>(null);

  const draw = () => { if (!frame.current) frame.current = requestAnimationFrame(() => { frame.current = 0; h.current?.render(); }); };

  useLayoutEffect(() => {
    const el = root.current!, c = canvas.current!;
    registerEases();
    const phone = () => window.matchMedia(PHONE).matches;
    const setView = (s: Hall, f: Frame) => { home.current = f; Object.assign(s.cam, { ...f, pos: [...f.pos], look: [...f.look] }); };
    const a = arrival("/roles"), arriving = !!a && !a.reduced;
    const rise = el.querySelectorAll("[data-rise]"), names = el.querySelectorAll(".names li");
    let hall: Hall | null = null, failed = false, dead = false, tl: gsap.core.Timeline | undefined;
    const build = () => {
      if (hall || failed || dead) return hall;
      try { hall = createHall(c, list); } catch { failed = true; el.dataset.gl = "off"; return null; }
      h.current = hall; setView(hall, phone() ? FRAME.phone : FRAME.desk);
      if (arriving) { const f = home.current; hall.cam.pos = [f.pos[0], f.pos[1] + 3, f.pos[2]]; } // from 3 units higher (motion.md §4)
      hall.ready.then(draw);
      return hall;
    };
    const id = requestAnimationFrame(build);
    let cancel = () => {};
    if (arriving) {
      gsap.set(rise, { yPercent: 135 }); gsap.set(names, { opacity: 0, y: 10 });
      cancel = a!.rise((delay) => {
        const s = build();
        tl = gsap.timeline({ onUpdate: draw });
        if (s) { const f = home.current; tl.to(s.cam.pos, { 1: f.pos[1], duration: 1.8, ease: "arrive" }, 0); }
        tl.to(rise, { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.08) }, delay)
          .to(names, { opacity: 1, y: 0, duration: 0.5, ease: "arrive", stagger: 0.05 }, delay + 0.25);
      });
    }
    const onResize = () => { if (!hall) return; hall.resize(); setView(hall, phone() ? FRAME.phone : FRAME.desk); draw(); };
    window.addEventListener("resize", onResize);
    return () => {
      dead = true; cancelAnimationFrame(id); cancel(); tl?.kill();
      gsap.set([...rise, ...names], { clearProps: "transform,opacity" });
      window.removeEventListener("resize", onResize); cancelAnimationFrame(frame.current); frame.current = 0;
      h.current = null; hall?.dispose();
    };
  }, [list]);

  // Reading a name: its table's lamp brightens and the camera eases toward it by up to 1.5 units along the row.
  useEffect(() => {
    const s = h.current;
    if (!s || leaving.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lamps = list.map((t) => gsap.to(s.lamps, { [t.slug]: t.slug === focus ? 1 : 0, duration: reduced ? 0 : 0.7, ease: "arrive", onUpdate: draw }));
    if (reduced) return () => lamps.forEach((t) => t.kill());
    const f = home.current, to = [...f.pos], look = [...f.look];
    if (focus) {
      const t = s.at(focus), dx = t.x - f.look[0], dz = t.z - f.look[2], d = Math.hypot(dx, dz), k = Math.min(1.5, d) / (d || 1);
      to[0] += dx * k; to[2] += dz * k; look[0] += dx * k; look[2] += dz * k;
    }
    const cam = [gsap.to(s.cam.pos, { 0: to[0], 2: to[2], duration: 0.7, ease: "arrive", onUpdate: draw }), gsap.to(s.cam.look, { 0: look[0], 2: look[2], duration: 0.7, ease: "arrive", onUpdate: draw })];
    return () => [...lamps, ...cam].forEach((t) => t.kill());
  }, [focus, list]);

  /** Sitting down: the camera drops from standing height to the table's low corner, then the page cuts in. */
  const open = (slug: string) => {
    const s = h.current, href = `/roles/${slug}`;
    let gone = false;
    const go = () => { if (gone) return; gone = true; beginNav(href, "/roles"); router.push(href); };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!s || reduced || leaving.current || navigating()) { go(); return; }
    leaving.current = true; setFocus(slug);
    const to = s.seat(slug, window.matchMedia(PHONE).matches);
    after(go, 1400);
    const el = root.current!;
    // The camera circles the table as it comes down, at a closing distance from the board, so it never passes
    // through a table and never looks down onto one from close up: radius, turn and height are eased together.
    const L = to.look, rel = (p: number[]) => [p[0] - L[0], p[1] - L[1], p[2] - L[2]];
    const polar = (v: number[]) => ({ r: Math.hypot(v[0], v[1], v[2]), az: Math.atan2(v[2], v[0]), el: Math.asin(v[1] / Math.hypot(v[0], v[1], v[2])) });
    const A = polar(rel(s.cam.pos)), B = polar(rel(to.pos));
    let dAz = B.az - A.az; if (dAz > Math.PI) dAz -= 2 * Math.PI; if (dAz < -Math.PI) dAz += 2 * Math.PI;
    const path = { t: 0 };
    gsap.timeline({ onUpdate: draw })
      .to(path, { t: 1, duration: 1.4, ease: "seam", onUpdate: () => {
        const t = path.t, r = A.r + (B.r - A.r) * t, az = A.az + dAz * t, el = A.el + (B.el - A.el) * t;
        s.cam.pos = [L[0] + r * Math.cos(el) * Math.cos(az), L[1] + r * Math.sin(el), L[2] + r * Math.cos(el) * Math.sin(az)];
      } }, 0)
      .to(s.cam.look, { 0: to.look[0], 1: to.look[1], 2: to.look[2], duration: 0.7, ease: "arrive" }, 0)
      .to(s.cam, { fov: to.fov, sx: to.sx, sy: to.sy, duration: 1.4, ease: "seam" }, 0)
      .to(s.lamps, { [slug]: 0, duration: 0.8, ease: "arrive" }, 0.4)
      .to(el.querySelectorAll("[data-rise]"), { yPercent: -135, duration: 0.5, ease: "seam" }, 0)
      .to(el.querySelectorAll(".names li"), { opacity: 0, y: -10, duration: 0.3, ease: "seam", stagger: 0.03 }, 0);
  };

  const onPointer = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || leaving.current || !h.current) return;
    const r = canvas.current!.getBoundingClientRect(), s = h.current.pick(e.clientX - r.left, e.clientY - r.top);
    canvas.current!.toggleAttribute("data-hot", !!s);
    setFocus(s);
  };
  const onCanvasClick = (e: React.MouseEvent) => {
    const r = canvas.current!.getBoundingClientRect(), s = h.current?.pick(e.clientX - r.left, e.clientY - r.top);
    if (s) open(s);
  };
  const read = (slug: string | null) => () => { if (!leaving.current) setFocus(slug); };

  return (
    <main ref={root} id="main" tabIndex={-1} className="roles">
      <canvas ref={canvas} className="roles-canvas" aria-hidden="true" onPointerMove={onPointer} onPointerLeave={read(null)} onClick={onCanvasClick} />
      <div className="roles-dark" />
      <div className="roles-layer">
        <h1 className="roles-title display"><span className="ln" data-vt-line=""><span data-rise="">{copy.title}</span></span></h1>
        <p className="roles-sub"><span className="ln" data-vt-line=""><span data-rise="">{copy.sub}</span></span></p>
        <ol className="names" aria-label={copy.label} onMouseLeave={read(null)}>
          {list.map((t) => (
            <li key={t.slug} data-on={t.slug === focus || undefined} data-now={t.current || undefined}>
              <Link href={`/roles/${t.slug}`} data-nav-hold="" onMouseEnter={read(t.slug)} onFocus={read(t.slug)} onBlur={read(null)}
                onClick={(e) => { if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; e.preventDefault(); open(t.slug); }}>
                <b>{t.name}</b>
                <span className="when">{t.current ? copy.now : t.when}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
