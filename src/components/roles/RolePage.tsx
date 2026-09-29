"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { PHONE } from "@/lib/seam/seam";
import { arrival } from "@/lib/seam/sweep";
import type { Fact, GamePly } from "@/content/roles";
import { createReplay, type Replay } from "./replay";
import { cue } from "@/lib/sound/sound";
import "./roles.css";

export interface RoleView {
  slug: string; title: string; sub: string;
  facts: Fact[];
  game: { title: string; plies: GamePly[]; famous: number; labels: string[] };
  next: { slug: string; title: string; label: string };
  copy: { start: string; next: string; back: string };
}

/** the replay's share of the pinned scroll: to the famous position, then the rest of the game */
const TO_FAMOUS = 0.8, TO_END = 0.97, HAND = 0.38;
/** how many screens the pinned first screen scrolls through (motion.md §10: about 4 to the famous position, then 1) */
const SCREENS = 5;

const REDUCED = "(prefers-reduced-motion: reduce)";
const onReduced = (fn: () => void) => { const q = window.matchMedia(REDUCED); q.addEventListener("change", fn); return () => q.removeEventListener("change", fn); };
/** reduced motion: the famous position still, every fact listed (motion.md §10); false while rendering on the server */
const useStill = () => useSyncExternalStore(onReduced, () => window.matchMedia(REDUCED).matches, () => false);

function Scrub({ plies, labels, count, onJump, title, start }: { plies: GamePly[]; labels: string[]; count: number; onJump: (m: number) => void; title: string; start: string }) {
  const moves = Math.ceil(plies.length / 2), cur = Math.ceil(count / 2);
  return (
    <div className="scrub">
      <p className="mv mono" aria-live="polite">{count ? labels[count - 1] : start}</p>
      <ol className="ticks" aria-label={title}>
        {Array.from({ length: moves }, (_, i) => (
          <li key={i}><button type="button" className={i + 1 < cur ? "p" : i + 1 === cur && count ? "c" : ""} aria-label={labels[Math.min(plies.length, (i + 1) * 2) - 1]} onClick={() => onJump(i + 1)} /></li>
        ))}
      </ol>
      <p className="g mono">{title}</p>
    </div>
  );
}

/**
 * A role page (key frame role-a; design/motion.md §10). The first screen is pinned and scrolling replays the
 * table's game to its famous position, each move played whole as its scroll point is crossed; the role's facts
 * arrive one at a time in the left margin, like a chess book's annotations. The rest of the game plays over the
 * last screen, then the page continues to the next table.
 */
export function RolePage({ v }: { v: RoleView }) {
  const path = usePathname();
  const root = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const jump = useRef<(m: number) => void>(() => {});
  const [count, setCount] = useState(0), [fact, setFact] = useState(-1), still = useStill();
  const n = v.game.plies.length;

  useLayoutEffect(() => {
    const el = root.current!, c = canvas.current!;
    registerEases();
    const reduced = still;
    const phoneQ = window.matchMedia(PHONE);
    let rep: Replay | null = null, failed = false, raf = 0;
    const draw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; rep?.render(); }); };
    // where the board stands: `cur` plies played, and the one under way `f` of the way
    const st = { cur: reduced ? v.game.famous + 1 : 0, f: 0 };
    let target = st.cur, speed = 1, tw: gsap.core.Tween | null = null;
    const show = () => { rep?.show(st.cur, st.f); draw(); setCount(st.cur + (st.f >= 1 ? 1 : 0)); };
    const build = () => {
      if (rep || failed) return;
      try { rep = createReplay(c, v.game.plies); } catch { failed = true; el.dataset.gl = "off"; return; }
      rep.phone = phoneQ.matches; show(); rep.ready.then(draw);
    };
    const buildId = requestAnimationFrame(build);

    /** play toward `target`, one whole move at a time; a queue of more than one plays at double speed */
    const step = () => {
      if (tw || st.cur === target) return;
      const fwd = target > st.cur, gap = Math.abs(target - st.cur), k = speed * (gap > 1 ? 2 : 1);
      if (!fwd) { st.cur -= 1; st.f = 1; }
      tw = gsap.to(st, {
        f: fwd ? 1 : 0, duration: HAND / k, ease: "none", onUpdate: show,
        onComplete: () => { tw = null; if (fwd) { st.cur += 1; st.f = 0; } else st.f = 0; show(); cue("place", { gain: k > 1 ? 0.6 : 1 }); if (st.cur === target) speed = 1; step(); },
      });
    };
    const top = () => el.querySelector<HTMLElement>(".role-top")!;
    const progress = () => { const t = top(), run = t.offsetHeight - innerHeight; return run > 0 ? Math.min(1, Math.max(0, (window.scrollY - t.offsetTop) / run)) : 0; };
    // ply k is played once the scroll passes its point: 0..famous across the first 80%, the rest after
    const point = (k: number) => k <= v.game.famous ? (TO_FAMOUS * (k + 1)) / (v.game.famous + 1) : TO_FAMOUS + ((TO_END - TO_FAMOUS) * (k - v.game.famous)) / (n - 1 - v.game.famous);
    const played = (p: number) => { let k = 0; while (k < n && point(k) <= p + 1e-6) k++; return k; };
    const onScroll = () => {
      if (reduced) return;
      const p = progress();
      if (rep) { rep.orbit = p; draw(); }
      setFact(Math.min(v.facts.length - 1, Math.floor((p / TO_FAMOUS) * v.facts.length)));
      const t = played(p);
      if (t !== target) { target = t; step(); }
    };
    jump.current = (m: number) => {
      const k = Math.min(n, m * 2);
      if (reduced) { tw?.kill(); tw = null; st.cur = k; st.f = 0; target = k; show(); return; }
      speed = 4; // the moves between replay at 4x
      const t = top(), p = k ? point(k - 1) : 0;
      window.scrollTo({ top: t.offsetTop + p * (t.offsetHeight - innerHeight) + 1, behavior: "instant" as ScrollBehavior });
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { if (rep) { rep.phone = phoneQ.matches; rep.resize(); } onScroll(); draw(); };
    window.addEventListener("resize", onResize);

    // the arriving title rises, then the line under it and the first fact
    const a = arrival(path);
    let tl: gsap.core.Timeline | undefined, cancel = () => {};
    const rise = el.querySelectorAll("[data-rise]");
    if (a && !a.reduced) {
      gsap.set(rise, { yPercent: 135 });
      cancel = a.rise((d) => { build(); tl = gsap.timeline().to(rise, { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.08) }, d); });
    }
    onScroll();
    return () => {
      cancelAnimationFrame(buildId); cancel(); tl?.kill(); tw?.kill(); gsap.set(rise, { clearProps: "transform" });
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); cancelAnimationFrame(raf);
      rep?.dispose();
    };
  }, [path, v, n, still]);

  // Facts: the one leaving goes 18 px right and fades (280 ms); then the next slides in 28 px (550 ms) and its rule draws.
  const facts = useRef<HTMLOListElement>(null), shown = useRef(-1);
  useLayoutEffect(() => {
    const list = facts.current;
    if (!list) return;
    const items = list.querySelectorAll<HTMLElement>(":scope > li");
    if (still) { gsap.set([...items, ...list.querySelectorAll("hr")], { clearProps: "opacity,transform" }); shown.current = -1; return; } // every fact, as it is
    if (shown.current < 0) gsap.set(items, { opacity: 0, x: -28 });
    const prev = shown.current, next = fact;
    if (prev === next) return;
    shown.current = next;
    const tl = gsap.timeline();
    if (prev >= 0) tl.to(items[prev], { opacity: 0, x: 18, duration: 0.28, ease: "seam" });
    if (next >= 0) {
      gsap.set(items[next].querySelector("hr"), { scaleX: 0 });
      tl.fromTo(items[next], { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: 0.55, ease: "arrive" }, prev >= 0 ? ">" : 0)
        .to(items[next].querySelector("hr"), { scaleX: 1, duration: 0.5, ease: "arrive" }, "<");
    }
    return () => { tl.progress(1); };
  }, [fact, still]);

  return (
    <main ref={root} id="main" tabIndex={-1} className="role" data-role={v.slug} data-still={still || undefined}>
      <section className="role-top" style={{ "--screens": still ? 1 : SCREENS } as React.CSSProperties}>
        <div className="role-pin">
          <canvas ref={canvas} className="role-canvas" aria-hidden="true" />
          <div className="role-dark" />
          <div className="role-layer">
            <header className="role-head">
              <h1 className="display"><span className="ln" data-vt-line=""><span data-rise="">{v.title}</span></span></h1>
              <p><span className="ln" data-vt-line=""><span data-rise="">{v.sub}</span></span></p>
            </header>
            <p className="count mono" aria-hidden="true">{!still && fact >= 0 ? `${fact + 1} / ${v.facts.length}` : ""}</p>
            <ol ref={facts} className="facts">
              {v.facts.map((f, i) => (
                <li key={i} className="fact" aria-current={!still && i === fact ? "step" : undefined}>
                  <hr />
                  <p>{f.text}</p>
                  {f.big ? <b>{f.big}</b> : null}
                  {f.qualifier ? <span className="q">{f.qualifier}</span> : null}
                </li>
              ))}
            </ol>
            <Scrub plies={v.game.plies} labels={v.game.labels} count={count} onJump={(m) => jump.current(m)} title={v.game.title} start={v.copy.start} />
          </div>
        </div>
      </section>
      <section className="role-end">
        <Link className="role-next" href={`/roles/${v.next.slug}`}>
          <span className="mono">{v.copy.next}</span>
          <span className="display">{v.next.title}</span>
          <span className="sub">{v.next.label}</span>
        </Link>
        <Link className="role-back" href="/#roles">{v.copy.back}</Link>
      </section>
    </main>
  );
}
