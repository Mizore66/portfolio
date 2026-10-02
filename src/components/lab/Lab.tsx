"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { PHONE, restColours, restFor, seam as live, setSeam, unit } from "@/lib/seam/seam";
import { arrival, navigating } from "@/lib/seam/sweep";
import { registerBlock, refresh } from "@/lib/seam/blocks";
import { firstView } from "@/lib/motion/firstView";
import { claim, keep, sleeper, type Sleeper } from "@/lib/three/keep";
import Link from "next/link";
import type { TreeNode } from "@/content/lab-tree.gen";
import { layout, type Line } from "./tree";
import { warm, type Chapter, type ChapterFactory, type Tag } from "./kit";
import type { PlayStage } from "./ch7";
import { SPECS as specs, EXTRAS as extras } from "./chapters";
import "./lab.css";
import { trace } from "@/lib/perf/trace";
import { sliced, type Building } from "@/lib/three/steps";

export interface Note { head: string; text: string }
export interface ChapterCopy { n: string; title?: string[]; big?: string; notes: Note[]; notesPhone?: Note[]; [k: string]: unknown }
export interface LabCopy {
  open: { num: string; pm: string; qualifier: string; qualifierPhone: string; lede: string; body: string; voice: string; share: string; record: string };
  chapters: ChapterCopy[];
  /** the one page's Lab section: the way into the six chapters, on /lab */
  toChapters?: string;
}
/** one chapter: its scene, its copy, and how many screens it is pinned for */
export interface Spec { id: number; make: ChapterFactory | null; screens: number; night: boolean }

const OPEN_AT = 0.305;

/** The opening (lab-a): the match score, and the engine's search tree growing from its root on the seam. */
function Open({ copy, tree, more }: { copy: LabCopy["open"]; tree: TreeNode; more?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [g, setG] = useState<{ W: number; H: number; lines: Line[]; pv: [number, number][] } | null>(null);
  useLayoutEffect(() => {
    const draw = () => {
      const el = svg.current!, W = el.clientWidth, H = el.clientHeight, phone = window.matchMedia(PHONE).matches, u = unit();
      // on phones the seam is horizontal and the tree grows down from a root below it, at the right (lab-a-m)
      const t = phone
        ? layout(tree, { x: 0.72 * W, y: OPEN_AT * H + 92 * u, dir: Math.PI / 2 + 0.12, len: 0.09 * H, bounds: [150 * u, OPEN_AT * H + 92 * u, W - 6 * u, H - 160 * u] })
        : layout(tree, { x: OPEN_AT * W, y: 0.66 * H, len: 0.1 * W, bounds: [OPEN_AT * W, 0.34 * H, W - 30, H - 40] });
      setG({ W, H, ...t });
    };
    const id = requestAnimationFrame(draw); // measured once laid out
    addEventListener("resize", draw);
    return () => { cancelAnimationFrame(id); removeEventListener("resize", draw); };
  }, [tree]);
  const type = (inv: boolean) => (
    <div className={`lab-type${inv ? " seam-dark" : ""}`} data-layer={inv ? "inv" : "ink"} aria-hidden={inv || undefined} inert={inv || undefined}>
      {inv ? <p className="op-num display"><span className="ln" data-vt-line=""><span data-rise="">{copy.num}</span></span></p>
        : more ? <h2 className="op-num display"><span className="ln" data-vt-line=""><span data-rise="">{copy.num}</span></span></h2>
        : <h1 className="op-num display"><span className="ln" data-vt-line=""><span data-rise="">{copy.num}</span></span></h1>}
      <div className="op-pm"><span className="ln" data-vt-line=""><span data-rise="">{copy.pm}</span></span><span className="ln q" data-vt-line=""><span data-rise=""><span className="wide">{copy.qualifier}</span><span className="narrow">{copy.qualifierPhone}</span></span></span></div>
      <p className="op-lede"><span className="ln" data-vt-line=""><span data-rise="">{copy.lede}</span></span></p>
      <p className="op-body"><span className="ln" data-vt-line=""><span data-rise="">{copy.body}</span></span></p>
      <p className="op-voice"><span className="ln" data-vt-line=""><span data-rise="">{copy.voice}</span></span></p>
      <p className="op-sc mono"><span className="ln" data-vt-line=""><span data-rise="">{copy.share}</span></span></p>
      <p className="op-rec mono"><span className="ln" data-vt-line=""><span data-rise="">{copy.record}</span></span></p>
      {more ? <p className="op-more"><span className="ln" data-vt-line=""><span data-rise=""><Link href="/lab" tabIndex={inv ? -1 : undefined}>{more}</Link></span></span></p> : null}
    </div>
  );
  return (
    <section className="lab-open" data-ch="0">
      <div className="lab-dark seam-dark" />
      <svg ref={svg} className="op-tree" aria-hidden="true" viewBox={g ? `0 0 ${g.W} ${g.H}` : undefined}>
        {g ? (<>
          {g.lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} data-d={l.depth} pathLength={1}
              strokeOpacity={Math.min(0.1 + 0.075 * l.remaining, 0.8).toFixed(2)} strokeWidth={(0.35 + 0.11 * l.remaining).toFixed(2)} />
          ))}
          <polyline className="pv" points={g.pv.map((p) => p.join(",")).join(" ")} pathLength={1} />
          <circle className="pv-end" cx={g.pv.at(-1)![0]} cy={g.pv.at(-1)![1]} r={5} />
          <circle className="root" cx={g.pv[0][0]} cy={g.pv[0][1]} r={6} />
        </>) : null}
      </svg>
      {type(false)}
      {type(true)}
    </section>
  );
}

/** A chapter's type, in ink and again in paper on the dark side. `body` lays it out, per chapter (lab.css). */
function Type({ copy, extra }: { copy: ChapterCopy; extra?: (inv: boolean) => React.ReactNode }) {
  const layer = (inv: boolean) => {
    const H = inv ? "p" : "h2";
    return (
      <div className={`lab-type${inv ? " seam-dark" : ""}`} data-layer={inv ? "inv" : "ink"} aria-hidden={inv || undefined} inert={inv || undefined}>
        {copy.n ? <p className="chap mono">{copy.n}</p> : null}
        {copy.title ? <H className="ttl display">{copy.title.map((t, i) => <span key={i} className="ln"><span>{t}</span></span>)}</H> : null}
        {copy.big ? (copy.title ? <p className="big display">{copy.big}</p> : <H className="big display">{copy.big}</H>) : null}
        {copy.notes.map((n, i) => <p key={i} className={`note dk n${i + 1}`}>{n.head ? <b>{n.head}</b> : null}{n.text}</p>)}
        {(copy.notesPhone ?? []).map((n, i) => <p key={`p${i}`} className={`note ph p${i + 1}`}>{n.head ? <b>{n.head}</b> : null}{n.text}</p>)}
        {extra?.(inv)}
      </div>
    );
  };
  return <>{layer(false)}{layer(true)}</>;
}

/**
 * The Lab (Gate 2, "the engine from the inside"; motion.md §5 and §11): the match score and the search tree, then
 * six pinned chapters and Play. Each chapter scrubs its object with its scroll, and the seam carries its meaning:
 * the page owns the seam between sweeps, easing to each chapter's share as it takes over (1,100 ms, `seam`).
 */
export function Lab({ copy, tree, section = false }: { copy: LabCopy; tree: TreeNode; section?: boolean }) {
  const path = usePathname();
  const root = useRef<HTMLElement>(null);
  const [tags, setTags] = useState<Record<number, Tag[]>>({});

  useLayoutEffect(() => {
    const el = root.current!, site = el.closest<HTMLElement>(".site")!;
    registerEases();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia(PHONE).matches;
    const sections = [...el.querySelectorAll<HTMLElement>("[data-ch]")];
    // measured from the document: on the one page the Lab is not at its top
    const top = (s: HTMLElement) => s.getBoundingClientRect().top + window.scrollY;
    const live3d = new Map<number, Chapter>();
    let dead = false;
    // a built chapter's canvases hold their buffers only within a screen of view (keep.ts): all seven held them at
    // once, 2.8 GB at 2×. A chapter's render sets its size, so one drawn while far off (warm, below) sleeps again after.
    const sleepers = new Map<number, Sleeper>();
    // On the one page, Play's scene is kept while a detail page is visited, like the page's other scenes (keep.ts):
    // building it again on every return cost the owner's Mac an 800 ms frame each time (the frame report).
    const pin7 = section ? el.querySelector<HTMLElement>('[data-ch="7"] .ch-pin') : null;
    const play = pin7 ? claim<Chapter>("lab-play", [...pin7.querySelectorAll<HTMLElement>(".keep-slot")]) : null;
    play?.canvases.forEach((c, i) => { c.className = i ? "night seam-dark" : "day"; c.setAttribute("aria-hidden", "true"); });
    let raf = 0;
    // only the chapters on screen are drawn; one coming on screen is drawn as it arrives
    const onScreen = new Set<number>();
    // a chapter's scene is a function of its scroll progress: it is drawn again only when that has moved (a canvas
    // keeps its last frame), or when forced, after a build, a resize or a return to the screen. Play draws itself
    // as its board changes (ch7); a scroll through the Lab section redrew its two boards every frame for nothing.
    const drawn = new Map<number, number>();
    let forced = false;
    const drawAll = (force = false) => {
      forced ||= force;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0; const all = forced; forced = false;
        live3d.forEach((c, id) => {
          if (!onScreen.has(id)) return;
          const p = c.still ? 0 : progressOf(sections.find((x) => +x.dataset.ch! === id)!);
          if (!all && drawn.get(id) === p) return;
          drawn.set(id, p); c.render();
        });
      });
    };
    const seen = new IntersectionObserver((es) => {
      for (const e of es) { const id = +(e.target as HTMLElement).dataset.ch!; if (e.isIntersecting) { onScreen.add(id); if (pending.has(id)) build(id, true); } else onScreen.delete(id); }
      drawAll(true);
    });

    const progressOf = (s: HTMLElement) => { const run = s.offsetHeight - innerHeight, t = top(s); return run > 0 ? Math.min(1, Math.max(0, (window.scrollY - t) / run)) : window.scrollY >= t ? 1 : 0; };
    // the chapter in charge: the last one whose top has reached the middle of the screen
    const active = () => { let a = 0; for (const s of sections) if (top(s) <= window.scrollY + innerHeight * 0.5) a = +s.dataset.ch!; return a; };
    const want = (id: number) => {
      if (id === 0) return OPEN_AT;
      const c = live3d.get(id), s = sections.find((x) => +x.dataset.ch! === id)!;
      return c ? c.seam(progressOf(s)) : 0.5;
    };

    // Build a chapter's scene when it is within a screen; let it go when it is two away (WebGL contexts are few). It is
    // built in slices (steps.ts), so no frame waits on it for long; one on screen before it is in is finished at once.
    const pending = new Map<number, Building<Chapter>>();
    const adopt = (id: number, s: HTMLElement, c: Chapter, kept: boolean) => {
      if (kept) (c as PlayStage).restore();
      live3d.set(id, c); c.progress(progressOf(s));
      const zz = sleeper(s, [...s.querySelectorAll("canvas")], () => { if (live3d.get(id) === c) { c.resize(); drawAll(true); } });
      sleepers.get(id)?.stop(); sleepers.set(id, zz); zz.built();
      c.ready.then(() => {
        // warm it: its end state, with everything in it, drawn through warm() (one instance each, one pixel), so shadow
        // programs and buffers are ready before it is first seen (that first draw cost the scroll up to 270 ms)
        if (live3d.get(id) !== c || onScreen.has(id) || kept) return;
        return warm([...s.querySelectorAll("canvas")], () => c.render(), { before: () => c.progress(1), after: () => c.progress(progressOf(s)), name: `lab chapter ${id}: warm` }).then(() => trace(`lab chapter ${id}: warmed`));
      }).then(() => { if (live3d.get(id) !== c) return; zz.built(); hud(s, c); place(); drawAll(true); if (!blend) tick(); });
    };
    const build = (id: number, now = false) => {
      const spec = specs.find((x) => x.id === id);
      if (!spec?.make || live3d.has(id) || dead) return;
      const s = sections.find((x) => +x.dataset.ch! === id)!;
      if (id === 7 && play?.stage) { adopt(id, s, play.stage, true); return; }
      let b = pending.get(id);
      if (!b) {
        const day = s.querySelector<HTMLCanvasElement>("canvas.day")!, night = s.querySelector<HTMLCanvasElement>("canvas.night"), t0 = performance.now();
        const mine = b = sliced(spec.make(day, night, { phone, reduced }), 8, `lab chapter ${id}`); pending.set(id, b);
        b.done.then((c) => {
          if (pending.get(id) !== mine) { if (!live3d.has(id) || live3d.get(id) !== c) c.dispose(); return; } // let go before it was in
          pending.delete(id); trace(`lab chapter ${id}: built in slices, ${Math.round(performance.now() - t0)} ms`); adopt(id, s, c, false); again();
        }, () => { pending.delete(id); s.dataset.gl = "off"; });
      }
      if (now) {
        try { const c = b.finish(); if (!live3d.has(id)) { pending.delete(id); trace(`lab chapter ${id}: finished at once`); adopt(id, s, c, false); } }
        catch { pending.delete(id); s.dataset.gl = "off"; }
      }
    };
    const near = new IntersectionObserver((es) => {
      for (const e of es) {
        const id = +(e.target as HTMLElement).dataset.ch!;
        if (e.isIntersecting) build(id);

      }
    }, { rootMargin: "150% 0px" });
    // Scenes are built ahead, one per idle slot (never during the hero's opening), nearest first: a chapter built as it
    // came near cost the scroll up to 600 ms. On /lab desktop builds all seven while the opening is read, and keeps them;
    // phones build two ahead and let go of one more than three away (their WebGL contexts are fewer). A build
    // waits until the scroll has been still for 300 ms; the queue runs again as the
    // chapter in charge changes. A chapter reached before its turn is built at once. On the one page, Play is kept.
    const AHEAD = phone ? 2 : Infinity, KEEP = phone ? 3 : Infinity; // desktop builds all seven and keeps them
    let idle = 0, queued = false;
    const again = () => { if (queued) return; queued = true; idle = window.setTimeout(() => { queued = false; queue(); }, 120); };
    const release = () => {
      if (section) return;
      const at = active();
      for (const [id, c] of live3d) if (Math.abs(id - at) > KEEP) { c.dispose(); live3d.delete(id); sleepers.get(id)?.stop(); sleepers.delete(id); }
    };
    const queue = () => {
      // not during the hero's opening, nor a page change (a chapter's build is a long task; it held a sweep 130-520 ms)
      if (document.querySelector('.hero:is([data-intro="play"], [data-intro="pending"])') || navigating()) { idle = window.setTimeout(queue, 600); return; }
      const mid = window.scrollY + innerHeight / 2, at = active();
      if (pending.size) return; // one at a time: the one in slices queues the next when it is in
      const next = sections.filter((x) => { const id = +x.dataset.ch!, sp = specs.find((q) => q.id === id); return sp?.make && !live3d.has(id) && x.dataset.gl !== "off" && Math.abs(id - at) <= AHEAD; })
        .sort((a, b) => Math.abs(top(a) - mid) - Math.abs(top(b) - mid))[0];
      if (!next) return;
      const run = () => { if (performance.now() - scrolled < 300) { again(); return; } build(+next.dataset.ch!); if (!pending.size) again(); }; // only once the scroll is still
      idle = typeof requestIdleCallback === "function" ? requestIdleCallback(run, { timeout: 1000 }) : window.setTimeout(run, 120);
    };
    idle = window.setTimeout(queue, section ? 800 : reduced ? 300 : 1500); // on /lab, once the tree has grown
    sections.forEach((s) => { near.observe(s); seen.observe(s); });
    if (play?.stage) build(7); // handed back: nothing to build, so it is there at once

    const place = () => setTags(Object.fromEntries([...live3d].map(([id, c]) => [id, c.tags()])));

    // The seam: when the chapter in charge changes it eases from where it is to the new one's share; after that it
    // follows the chapter directly (its stack falling, its checkpoints). It never fights a sweep.
    let who = -1, from = restFor("/lab") ?? OPEN_AT, t0 = 0, blend = 0, settle = 0;
    const ease = gsap.parseEase("seam");
    const tick = () => {
      if (section) { blend = 0; refresh(); return; } // on the one page the seam belongs to the blocks (blocks.ts)
      if (site.hasAttribute("data-seam-moving") || navigating()) { blend = 0; return; }
      const id = active();
      if (id !== who) { from = live.at; who = id; t0 = performance.now(); }
      const q = reduced ? 1 : Math.min(1, (performance.now() - t0) / 1100), target = want(id);
      setSeam(from + (target - from) * ease(q));
      clearTimeout(settle); settle = window.setTimeout(() => restColours(true), 150);
      if (q < 1) blend = requestAnimationFrame(tick); else blend = 0;
    };
    // what a chapter reports beyond its scene: Gate C's running counter, and whether its last game has landed
    const hud = (s: HTMLElement, c: Chapter) => {
      const x = c as Chapter & { counter?: () => string; phase?: () => number };
      if (x.counter) { const t = x.counter(); s.querySelectorAll(".ctr").forEach((e) => { if (e.textContent !== t) e.textContent = t; }); }
      if (x.phase) s.toggleAttribute("data-done", x.phase() > 0.05);
    };
    let lastActive = -1, scrolled = 0;
    const onScroll = () => {
      scrolled = performance.now();
      const at = active();
      if (at !== lastActive) { lastActive = at; release(); again(); }
      for (const s of sections) { const c = live3d.get(+s.dataset.ch!); if (c) { c.progress(progressOf(s)); hud(s, c); } }
      drawAll(); place();
      if (!blend) tick();
    };
    const moving = new MutationObserver(() => { if (!site.hasAttribute("data-seam-moving")) { who = -1; onScroll(); } });
    moving.observe(site, { attributes: true, attributeFilter: ["data-seam-moving"] });
    window.addEventListener("scroll", onScroll, { passive: true });
    // Play moves the seam with the eval between scrolls (ch7); follow it
    const onEval = () => { if (!blend) tick(); };
    window.addEventListener("lab:seam", onEval);
    const onResize = () => { live3d.forEach((c, id) => { if (!sleepers.get(id)?.asleep) c.resize(); }); place(); drawAll(true); };
    window.addEventListener("resize", onResize);

    // On the one page the opening and Play are blocks: the opening rests at the match score, Play at its eval.
    const unblock = section ? [
      registerBlock(el.querySelector<HTMLElement>(".lab-open")!, OPEN_AT),
      ...sections.filter((s) => s.dataset.ch === "7").map((s) => registerBlock(s.querySelector<HTMLElement>(".ch-pin")!, () => want(7))),
    ] : [];

    // Arriving: the tree grows from its root on the seam, one depth at a time (60 ms per depth), the principal
    // variation lights amber last (300 ms), then −143.3 rises, then ±35.4 Elo, then the record.
    const a = arrival(path), open = el.querySelector<HTMLElement>(".lab-open")!;
    // the tree is measured a frame after mount, so its lines are found when the growth starts; until then CSS holds them
    // undrawn (lab.css, [data-grow])
    const rise = open.querySelectorAll("[data-rise]");
    const svgTree = () => ({ lines: open.querySelectorAll<SVGLineElement>(".op-tree line"), pv: open.querySelectorAll(".op-tree .pv, .op-tree .pv-end") });
    let tl: gsap.core.Timeline | undefined, cancel = () => {}, wait = 0;
    const grow = (delay: number) => {
      const { lines, pv } = svgTree();
      if (!lines.length) { wait = requestAnimationFrame(() => grow(delay)); return; }
      tl = gsap.timeline({ delay });
      lines.forEach((l) => { const d = +(l.dataset.d ?? 0); tl!.fromTo(l, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.06, ease: "none" }, d * 0.06); });
      tl.fromTo(pv, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "arrive" }, 9 * 0.06)
        .to(rise, { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.1) }, 9 * 0.06 + 0.15);
    };
    if (!reduced) {
      gsap.set(rise, { yPercent: 135 }); open.dataset.grow = "";
      if (section) cancel = firstView(open, () => grow(0.15)); // on the one page, the first time it is seen
      else if (a && !a.reduced) cancel = a.rise((d) => grow(Math.max(0, d - 0.3)));
      else requestAnimationFrame(() => grow(0.2));
    }
    if (!a) onScroll();
    return () => {
      unblock.forEach((u) => u()); cancel(); tl?.kill(); near.disconnect(); seen.disconnect(); clearTimeout(idle); if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle); moving.disconnect(); cancelAnimationFrame(raf); cancelAnimationFrame(blend); clearTimeout(settle);
      cancelAnimationFrame(wait); delete open.dataset.grow;
      // what the growth and the rise set, taken off directly: gsap's clearProps reads each element's computed style,
      // and the tree has some 2,000 lines, which made leaving the one page a long frame (phase 6, step 5)
      const t = svgTree();
      for (const e of [...rise, ...t.lines, ...t.pv]) { e.removeAttribute("style"); Reflect.deleteProperty(e, "_gsap"); }
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); window.removeEventListener("lab:seam", onEval);
      dead = true; pending.clear(); // a chapter still in slices is let go as it comes in
      sleepers.forEach((z) => z.stop());
      live3d.forEach((c, id) => { if (id === 7 && play) keep("lab-play", play.canvases, c, () => c.dispose()); else c.dispose(); });
    };
  }, [path, section]);

  const Root = section ? "section" : "main";
  return (
    <Root ref={root} {...(section ? { id: "lab", "aria-label": "Lab" } : { id: "main", tabIndex: -1 })} className="lab">
      <Open copy={copy.open} tree={tree} more={section ? copy.toChapters : undefined} />
      {(section ? specs.filter((x) => x.id === 7) : specs).map((s) => (
        <section key={s.id} className="ch" data-ch={s.id} data-night={s.night || undefined} style={{ "--screens": s.screens } as React.CSSProperties}>
          <div className="ch-pin">
            <div className="lab-dark seam-dark" />
            {section ? <><div className="keep-slot" />{s.night ? <div className="keep-slot" /> : null}</> : <>
              <canvas className="day" aria-hidden="true" />
              {s.night ? <canvas className="night seam-dark" aria-hidden="true" /> : null}
            </>}
            <Type copy={copy.chapters[s.id - 1]} extra={(inv) => (<>
              <div className="tags" aria-hidden="true">{(tags[s.id] ?? []).map((t) => <div key={t.key} className={`tag ${t.cls ?? ""}`} style={{ left: t.x, top: t.y }} dangerouslySetInnerHTML={{ __html: t.html }} />)}</div>
              {extras[s.id]?.(inv, copy.chapters[s.id - 1])}
            </>)} />
          </div>
        </section>
      ))}
    </Root>
  );
}
