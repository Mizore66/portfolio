"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { PHONE, restColours, setSeam } from "@/lib/seam/seam";
import { arrival } from "@/lib/seam/sweep";
import { lockScroll } from "@/lib/motion/scroll";
import { gsap } from "gsap";
import { registerEases, share, perLayer } from "@/lib/motion/ease";
import { stageSteps, T, type Stage } from "./stage";
import { claim, keep, sleeper } from "@/lib/three/keep";
import { run, sliced } from "@/lib/three/steps";
import { cue } from "@/lib/sound/sound";
import "./hero.css";
import { timed, trace } from "@/lib/perf/trace";

/** The eval after 10…Bg4, where the hero settles (content.json chess.careerEvals.faultline). */
const SETTLE_CP = 64;
const SEEN = "hero-opening-seen";

function Letters({ word }: { word: string }) {
  return <>{[...word].map((c, i) => <span key={i} className="ch" aria-hidden="true">{c}</span>)}</>;
}

/**
 * One copy of the hero's type. It is drawn twice: in ink, and in paper clipped to the black side of the seam.
 * `data-vt-line` marks each masked line, which rises out of its mask when the page is left (sweep.ts).
 */
function Type({ first, last, headline, inverted }: { first: string; last: string; headline: string[]; inverted?: boolean }) {
  return (
    <div className="hero-layer" data-layer={inverted ? "inv" : "ink"} aria-hidden={inverted || undefined} inert={inverted || undefined}>
      <div className="hero-type">
        <Link className="skip-resume mono" href="/resume">Skip to résumé</Link>
        <p className="ply mono" aria-hidden="true" />
        <h1 className="name display" aria-label={`${first} ${last}`}>
          <span className="ln" data-vt-line=""><Letters word={first} /></span>
          <span className="ln l2" data-vt-line=""><Letters word={last} /></span>
        </h1>
        <p className="line">{headline.map((l) => <span key={l} data-vt-line=""><i>{l}</i></span>)}</p>
        <p className="ev mono" data-vt-line="">10…Bg4 +0.64</p>
      </div>
    </div>
  );
}

export function Hero({ first, last, headline }: { first: string; last: string; headline: string[] }) {
  const root = useRef<HTMLElement>(null);
  const day = useRef<HTMLDivElement>(null), night = useRef<HTMLDivElement>(null); // the canvases' slots (keep.ts)
  // Known at once on the client, so an arriving hero builds its stage at commit (null only on the server).
  const [mobile, setMobile] = useState<boolean | null>(() => (typeof window === "undefined" ? null : window.matchMedia(PHONE).matches));
  // Arriving from another page, there is no opening: the seam is already on its way here.
  const [arriving] = useState(() => typeof window !== "undefined" && arrival("/") != null);

  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setMobile(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // A layout effect, so the stage exists while the seam sweeps in: during a view transition React holds
  // passive effects until it has finished.
  useLayoutEffect(() => {
    if (mobile === null) return;
    const el = root.current!, q = (s: string) => el.querySelectorAll<HTMLElement>(s);
    const nav = document.querySelectorAll<HTMLElement>(".chrome .nav"); // the site nav lives in the chrome
    const toggle = [...document.querySelectorAll<HTMLElement>(".chrome .sound-toggle")]; // and so does the sound toggle
    const site = el.closest<HTMLElement>(".site");
    registerEases();
    // back from a detail page, the stage built last time (keep.ts): nothing to build, no shader to compile
    const key = `hero-${mobile}`, got = claim<Stage>(key, [day.current!, night.current!]);
    const make = () => stageSteps(got.canvases[0], got.canvases[1], mobile);
    let dead = false, end = () => {};
    // Arriving from another page the stage is needed now, under the sweep; on a first load it is built in slices
    // (steps.ts) while the page is still black, so no frame waits on it for long, and the opening starts once it is in.
    if (got.stage || arrival("/")) {
      try { end = begin(got.stage ?? timed("hero: built", () => run(make()))); }
      catch { el.dataset.intro = "done"; } // no WebGL: the CSS end state stands in
    } else {
      // "pending" holds the page black (the seam at 0%) for the opening; when there will be none, or the page is
      // scrolled while the stage is built, the hero is done at once and its stage drawn when it is in
      const plays = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches && sessionStorage.getItem(SEEN) !== "1" && !location.hash && window.scrollY <= 8;
      const early = () => { if (!plays()) el.dataset.intro = "done"; };
      early(); window.addEventListener("scroll", early, { passive: true });
      const t0 = performance.now();
      const b = sliced(make(), 8, "hero");
      b.done.then((stage) => {
        window.removeEventListener("scroll", early);
        if (dead) { stage.dispose(); return; }
        trace(`hero: built in slices, ${Math.round(performance.now() - t0)} ms`); end = begin(stage);
      }, () => { window.removeEventListener("scroll", early); el.dataset.intro = "done"; });
      // gone before a slice ran (React mounts twice in development): no renderer is made for it, so it takes no WebGL
      // context (WebKit counts even lost ones until they are collected, and loses the oldest live one past 16)
      end = () => { window.removeEventListener("scroll", early); b.cancel(); };
    }
    return () => { dead = true; end(); };

    function begin(stage: Stage) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const seen = sessionStorage.getItem(SEEN) === "1";
      const arrive = arrival("/");
      const st = { t: 0, at: 0 };
      let heard = { t: -1, ply: "" }; // the cues play only while the game runs forward, not on a jump to its end
      const draw = () => {
        if (el.dataset.intro === "play") setSeam(st.at); // the opening owns the seam; after it, the scroll does (blocks.ts)
        stage.render(st.t);
        const ply = stage.ply(st.t), running = heard.t >= 0 && st.t > heard.t && st.t - heard.t < 0.5;
        if (running && ply && ply !== heard.ply) cue("place");
        if (running && heard.t < T.blast && st.t >= T.blast) cue("break");
        heard = { t: st.t, ply };
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
        if (!idleFrom) idleFrom = now; // the frame's own clock: under a recording it ran 24 s behind performance.now()
        last = now; st.t = T.total + (now - idleFrom) / 1000; draw(); drew = true;
      };
      const startIdle = () => { if (reduced) return; idleFrom = 0; raf = requestAnimationFrame(idle); };
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "-1px 0px" }); io.observe(el); // touching the screen's edge (at /#roles) is not on it

      const finish = () => {
        st.t = T.total; st.at = share(SETTLE_CP);
        gsap.set(q(".ch"), { yPercent: 0 }); gsap.set(q(".line i"), { yPercent: 0 });
        gsap.set(q(".ev"), { opacity: 1 }); gsap.set(toggle, { clearProps: "opacity" }); gsap.set(nav, { clearProps: "opacity" }); gsap.set(q(".skip-resume"), { autoAlpha: 0 }); // gone, and out of the tab order: the nav's Résumé is there
        draw(); el.dataset.intro = "done"; startIdle();
        if (!arrive) restColours(true);
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
        onComplete: () => { gsap.ticker.remove(guard); sessionStorage.setItem(SEEN, "1"); el.dataset.intro = "done"; lockScroll(false); site?.removeAttribute("data-seam-moving"); restColours(true); startIdle(); },
      });

      let rise: gsap.core.Timeline | undefined, cancelRise = () => {};
      if (arrive) {
        // the name rises as the seam lands, as every arriving page's title does
        sessionStorage.setItem(SEEN, "1"); finish();
        if (!arrive.reduced) {
          gsap.set(q(".ch"), { yPercent: 135 }); gsap.set(q(".line i"), { yPercent: 130 }); gsap.set([...q(".ev"), ...toggle], { opacity: 0 });
          cancelRise = arrive.rise((d) => {
            rise = gsap.timeline()
              .to(q(".ch"), { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.028) }, d)
              .to(q(".line i"), { yPercent: 0, duration: 0.6, ease: "arrive", stagger: perLayer(0.08) }, d + 0.3)
              .to(q(".ev"), { opacity: 1, duration: 0.4 }, d + 0.5).to(toggle, { opacity: 0.62, duration: 0.4, clearProps: "opacity" }, d + 0.5);
          });
        }
      } else if (reduced || seen || location.hash || window.scrollY > 8) finish(); // the opening plays only at the top of the page
      else {
        gsap.set(q(".ch"), { yPercent: 135 }); gsap.set(q(".line i"), { yPercent: 130 }); gsap.set([...q(".ev"), ...toggle], { opacity: 0 }); gsap.set(nav, { opacity: 0 });
        el.dataset.intro = "play"; draw(); site?.setAttribute("data-seam-moving", ""); restColours(false); lockScroll(true); // the page waits for its opening
        tl.to(st, { t: T.total, duration: T.total, ease: "none", onUpdate: draw }, 0)
          .to(st, { at: share(SETTLE_CP), duration: 0.9, ease: "seam", onUpdate: draw }, T.paper)
          .to(q(".ch"), { yPercent: 0, duration: 0.7, ease: "arrive", stagger: perLayer(0.028) }, T.name)
          .to(q(".skip-resume"), { autoAlpha: 0, duration: 0.25 }, T.name) // hidden once faded, so it leaves the tab order
          .to(q(".line i"), { yPercent: 0, duration: 0.6, ease: "arrive", stagger: perLayer(0.08) }, T.name + 0.45)
          .to(q(".ev"), { opacity: 1, duration: 0.4 }, T.name + 0.6)
          .to(nav, { opacity: 1, duration: 0.4, ease: "arrive", stagger: perLayer(0.05), clearProps: "opacity" }, T.name + 0.7).to(toggle, { opacity: 0.62, duration: 0.4, ease: "arrive", clearProps: "opacity" }, T.name + 0.75);
        // The first 0.7 s is the loader: hold until the fonts are in (at most 2.5 s), then play.
        const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
        if (process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("capture")) {
          // development only: frame-exact seeking for side-by-side checks against the approved prototype
          const w = window as unknown as { __seek: (t: number) => void; __ready: boolean; __total: number };
          w.__seek = (t) => { tl.seek(t, false); draw(); }; w.__total = tl.duration();
          fonts.then(() => { w.__ready = true; });
        } else fonts.then(() => { gsap.ticker.add(guard); tl.play(0); });
      }

      // its canvases hold their buffers only within a screen of view (keep.ts); a kept stage wakes, and resizes, here
      const zz = sleeper(el, got.canvases, () => { stage.resize(); draw(); });
      zz.built(); // a new stage built off screen gives its buffers up; a kept one wakes once the page has its scroll
      const onResize = () => { if (!zz.asleep) stage.resize(); draw(); };
      window.addEventListener("resize", onResize);
      return () => { lockScroll(false); tl.kill(); cancelRise(); rise?.kill(); gsap.set([...nav, ...toggle], { clearProps: "opacity" }); gsap.ticker.remove(guard); cancelAnimationFrame(raf); io.disconnect(); zz.stop(); window.removeEventListener("resize", onResize); keep(key, got.canvases, stage, () => stage.dispose()); };
    }
  }, [mobile]);

  return (
    <section ref={root} id="top" className="hero" data-rest="0.559" data-rest-phone="0.559" data-intro={arriving ? "done" : "pending"} aria-label="Introduction">
      <div ref={day} className="day keep-slot" aria-hidden="true" key={`d${mobile}`} />
      <div ref={night} className="night keep-slot" aria-hidden="true" key={`n${mobile}`} />
      <Type first={first} last={last} headline={headline} />
      <Type first={first} last={last} headline={headline} inverted />
      <noscript><style>{"html .site:has(.hero[data-intro]){--seam:55.9%!important}.hero[data-intro] .hero-type{visibility:visible!important}html .site:has(.hero[data-intro]) .chrome :is(.nav,.sound-toggle){visibility:visible!important}.hero .skip-resume{display:none}"}</style></noscript>
    </section>
  );
}
