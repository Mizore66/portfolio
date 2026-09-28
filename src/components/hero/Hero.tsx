"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { registerEases, share, perLayer } from "@/lib/motion/ease";
import { createStage, T, type Stage } from "./stage";
import "./hero.css";

/** The eval after 10…Bg4, where the hero settles (content.json chess.careerEvals.faultline). */
const SETTLE_CP = 64;
const SEEN = "hero-opening-seen";
const NAV = [["Roles", "/roles"], ["Work", "/work"], ["Lab", "/lab"], ["Contact", "/contact"]] as const;

function Letters({ word }: { word: string }) {
  return <>{[...word].map((c, i) => <span key={i} className="ch" aria-hidden="true">{c}</span>)}</>;
}

/** One copy of the hero's type. It is drawn twice: in ink, and in paper clipped to the black side of the seam. */
function Type({ first, last, headline, inverted }: { first: string; last: string; headline: string[]; inverted?: boolean }) {
  return (
    <div className="hero-layer" data-layer={inverted ? "inv" : "ink"} aria-hidden={inverted || undefined} inert={inverted || undefined}>
      <div className="hero-type">
        <nav aria-label="Primary"><ul className="nav">{NAV.map(([l, h]) => <li key={h}><Link href={h}>{l}</Link></li>)}</ul></nav>
        <Link className="skip-resume mono" href="/resume">Skip to résumé</Link>
        <p className="ply mono" aria-hidden="true" />
        <h1 className="name display" aria-label={`${first} ${last}`}>
          <span className="ln"><Letters word={first} /></span>
          <span className="ln l2"><Letters word={last} /></span>
        </h1>
        <p className="line">{headline.map((l) => <span key={l}><i>{l}</i></span>)}</p>
        <p className="ev mono">10…Bg4 +0.64</p>
        <p className="sound">Sound off</p>
      </div>
    </div>
  );
}

export function Hero({ first, last, headline }: { first: string; last: string; headline: string[] }) {
  const root = useRef<HTMLElement>(null);
  const day = useRef<HTMLCanvasElement>(null), night = useRef<HTMLCanvasElement>(null);
  const [mobile, setMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const on = () => setMobile(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (mobile === null) return;
    const el = root.current!, q = (s: string) => el.querySelectorAll<HTMLElement>(s);
    registerEases();
    let stage: Stage;
    try { stage = createStage(day.current!, night.current!, mobile); }
    catch { el.dataset.intro = "done"; return; } // no WebGL: the CSS end state stands in
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SEEN) === "1";
    const st = { t: 0, at: 0 };
    const draw = () => {
      el.style.setProperty("--seam", `${st.at * 100}%`);
      stage.render(st.t);
      const ply = stage.ply(st.t);
      q(".ply").forEach((p) => { p.textContent = ply; p.style.opacity = String(st.t < T.blast ? 1 : Math.max(0, 1 - (st.t - T.blast) * 3)); });
    };

    // idle: the field bobs slowly at 30 fps, only while the hero is on screen and the tab is visible.
    // Where a frame takes over 250 ms, the bob would only cost the page its responsiveness: it stops on a still frame.
    let raf = 0, last = 0, visible = true, idleFrom = 0, drew = false, heavy = 0;
    const idle = (now: number) => {
      if (drew) { heavy = now - last > 250 ? heavy + 1 : 0; drew = false; }
      if (heavy >= 3) return;
      raf = requestAnimationFrame(idle);
      if (!visible || document.hidden || now - last < 33) return;
      last = now; st.t = T.total + (now - idleFrom) / 1000; draw(); drew = true;
    };
    const startIdle = () => { if (reduced) return; idleFrom = performance.now(); raf = requestAnimationFrame(idle); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(el);

    const finish = () => {
      st.t = T.total; st.at = share(SETTLE_CP);
      gsap.set(q(".ch"), { yPercent: 0 }); gsap.set(q(".line i"), { yPercent: 0 });
      gsap.set(q(".nav, .sound, .ev"), { opacity: 1 }); gsap.set(q(".skip-resume"), { opacity: 0 });
      draw(); el.dataset.intro = "done"; startIdle();
    };
    // Quality stepping (brief: >= 45 fps on a mid-range phone). Every 20 frames of the opening, a mean frame
    // over 22 ms steps the resolution down. A device that cannot draw it at ~4 fps would watch it in slow
    // motion, so it goes straight to the end state.
    let slow = 0, prev = 0, n = 0, sum = 0;
    const guard = () => {
      const now = performance.now(), dt = prev ? now - prev : 0; prev = now;
      if (!dt) return;
      slow = dt > 250 ? slow + 1 : 0;
      if (slow >= 3) { tl.progress(1); return; }
      sum += dt; if (++n < 20) return;
      if (sum / n > 22) stage.lower();
      n = 0; sum = 0;
    };
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => { gsap.ticker.remove(guard); sessionStorage.setItem(SEEN, "1"); el.dataset.intro = "done"; startIdle(); },
    });

    if (reduced || seen) finish();
    else {
      gsap.set(q(".ch"), { yPercent: 135 }); gsap.set(q(".line i"), { yPercent: 130 }); gsap.set(q(".nav, .sound, .ev"), { opacity: 0 });
      draw(); el.dataset.intro = "play";
      tl.to(st, { t: T.total, duration: T.total, ease: "none", onUpdate: draw }, 0)
        .to(st, { at: share(SETTLE_CP), duration: 0.9, ease: "seam", onUpdate: draw }, T.paper)
        .to(q(".ch"), { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.028) }, T.name)
        .to(q(".skip-resume"), { opacity: 0, duration: 0.25 }, T.name)
        .to(q(".line i"), { yPercent: 0, duration: 0.6, ease: "arrive", stagger: perLayer(0.08) }, T.name + 0.45)
        .to(q(".ev"), { opacity: 1, duration: 0.4 }, T.name + 0.6)
        .to(q(".nav, .sound"), { opacity: 1, duration: 0.4, ease: "arrive", stagger: perLayer(0.05) }, T.name + 0.7);
      // The first 0.7 s is the loader: hold until the fonts are in (at most 2.5 s), then play.
      const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
      if (process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("capture")) {
        // development only: frame-exact seeking for side-by-side checks against the approved prototype
        const w = window as unknown as { __seek: (t: number) => void; __ready: boolean; __total: number };
        w.__seek = (t) => { tl.seek(t, false); draw(); }; w.__total = tl.duration();
        fonts.then(() => { w.__ready = true; });
      } else fonts.then(() => { gsap.ticker.add(guard); tl.play(0); });
    }

    const onResize = () => { stage.resize(); draw(); };
    window.addEventListener("resize", onResize);
    return () => { tl.kill(); gsap.ticker.remove(guard); cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", onResize); stage.dispose(); };
  }, [mobile]);

  return (
    <section ref={root} className="hero" data-intro="pending" aria-label="Introduction">
      <canvas ref={day} className="day" aria-hidden="true" key={`d${mobile}`} />
      <canvas ref={night} className="night" aria-hidden="true" key={`n${mobile}`} />
      <Type first={first} last={last} headline={headline} />
      <Type first={first} last={last} headline={headline} inverted />
      <Link className="resume-link" href="/resume">Résumé</Link>
      <noscript><style>{".hero[data-intro]{--seam:55.9%}.hero[data-intro] .hero-type{visibility:visible}.hero .skip-resume{display:none}"}</style></noscript>
    </section>
  );
}
