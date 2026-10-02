"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { roomFor } from "@/lib/seam/seam";
import { arrival } from "@/lib/seam/sweep";
import "./colophon.css";

export interface ColophonCopy {
  title: string; lede: string;
  specimen: { name: string; note: string }[]; sample: string;
  sections: { heading: string; body: string }[];
  perft: { lead: string; depth: string; rows: { depth: number; nodes: string }[] };
  testsHeading: string; tests: string[];
  credits: { label: string; text: string }[]; by: string;
}

// The specimen's A at rest (colophon-a): Archivo's heaviest and widest the site uses. It arrives from the thin, narrow
// end of both axes, so the page's one moving thing is the typeface itself.
const REST = { w: 900, s: 112 }, FROM = { w: 100, s: 62 };
const fmt = new Intl.NumberFormat("en-GB"); // one formatter: toLocaleString makes a new one on every call, every frame
const axes = (w: number, s: number) => `"wght" ${w.toFixed(0)}, "wdth" ${s.toFixed(1)}`;

/**
 * The colophon (key frame colophon-a, "the last page"): how the site was made, with its credits and licences. Paper
 * floods (100%). The title and a type specimen on the left, the notes in two columns on the right, the credits below
 * them as a printer's imprint. The first screen is drawn twice, in ink and in paper clipped to the dark side, for
 * the sweep in.
 */
export function Colophon({ copy }: { copy: ColophonCopy }) {
  const path = usePathname(), el = useRef<HTMLElement>(null);
  // The notes scroll under the chrome: the nav steps away on the way down (as on the one page) and a paper veil
  // shows beneath the résumé link, which never moves. Neither shows at the top, where a sweep lands.
  useLayoutEffect(() => {
    const root = el.current!, site = document.querySelector(".site");
    // the distance run in one direction, so smooth scrolling's small last steps still count
    let last = window.scrollY, run = 0;
    const onScroll = () => {
      const y = window.scrollY, d = y - last; last = y;
      run = d > 0 ? Math.max(0, run) + d : Math.min(0, run) + d;
      root.toggleAttribute("data-deep", y > 8);
      if (y < 80 || run < -24) site?.toggleAttribute("data-nav-away", false); else if (run > 24) site?.toggleAttribute("data-nav-away", true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); site?.toggleAttribute("data-nav-away", false); };
  }, [path]);
  useLayoutEffect(() => {
    const root = el.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    registerEases();
    const q = (s: string) => [...root.querySelectorAll<HTMLElement>(s)];
    const rise = q("[data-rise]"), notes = q("[data-note]"), aa = q(".co-aa b"), counts = q("[data-count]");
    gsap.set(rise, { yPercent: 135 }); gsap.set(notes, { y: 28, opacity: 0 });
    const axis = { w: FROM.w, s: FROM.s }, paint = () => aa.forEach((a) => (a.style.fontVariationSettings = axes(axis.w, axis.s)));
    paint();
    const n = { v: 0 }, target = counts.map((c) => Number(c.dataset.count));
    const count = () => counts.forEach((c, i) => (c.textContent = fmt.format(Math.round(n.v * target[i]))));
    count();
    let tl: gsap.core.Timeline | undefined;
    const play = (delay: number) => {
      tl = gsap.timeline({ delay })
        .to(rise, { yPercent: 0, duration: 0.75, ease: "arrive", stagger: perLayer(0.06) }, 0)
        .to(axis, { w: REST.w, s: REST.s, duration: 1.4, ease: "arrive", onUpdate: paint }, 0.2)
        .to(notes, { y: 0, opacity: 1, duration: 0.8, ease: "arrive", stagger: 0.05 }, 0.35)
        .to(n, { v: 1, duration: 1.1, ease: "power2.out", onUpdate: count }, 0.6);
    };
    // after a sweep, when the seam lands; on a first visit straight to the page, a moment after it paints
    const a = arrival(path), cancel = a ? a.rise(play) : (play(0.25), () => {});
    // the specimen answers the pointer: across is width, down is weight, back to rest on leaving
    const spec = root.querySelector<HTMLElement>(".co-spec[data-layer-ink]");
    const fine = window.matchMedia("(pointer: fine)").matches;
    const move = (e: PointerEvent) => {
      const r = spec!.getBoundingClientRect(), x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      gsap.to(axis, { s: FROM.s + (125 - FROM.s) * x, w: FROM.w + (REST.w - FROM.w) * (1 - y * 0.8), duration: 0.5, ease: "power3.out", onUpdate: paint, overwrite: true });
    };
    const leave = () => gsap.to(axis, { w: REST.w, s: REST.s, duration: 0.9, ease: "arrive", onUpdate: paint, overwrite: true });
    if (fine && spec) { spec.addEventListener("pointermove", move); spec.addEventListener("pointerleave", leave); }
    return () => {
      cancel(); tl?.kill(); gsap.killTweensOf(axis);
      spec?.removeEventListener("pointermove", move); spec?.removeEventListener("pointerleave", leave);
      gsap.set([...rise, ...notes], { clearProps: "transform,opacity" }); aa.forEach((b) => (b.style.fontVariationSettings = "")); target.forEach((t, i) => (counts[i].textContent = fmt.format(t)));
    };
  }, [path]);

  // two lines, as colophon-a sets them: "How this site / was made."
  const cut = copy.title.indexOf(" was "), title = cut > 0 ? [copy.title.slice(0, cut), copy.title.slice(cut + 1)] : [copy.title];
  const line = (text: React.ReactNode, key?: string) => <span key={key} className="ln" data-vt-line=""><span data-rise="">{text}</span></span>;
  const body = (inv: boolean) => (
    <div className={`co-layer${inv ? " seam-dark" : ""}`} data-layer={inv ? "inv" : "ink"} aria-hidden={inv || undefined} inert={inv || undefined}>
      <div className="co-left">
        {inv ? <p className="co-title display">{title.map((t, i) => [i ? " " : null, line(t, t)])}</p> : <h1 className="co-title display">{title.map((t, i) => [i ? " " : null, line(t, t)])}</h1>}
        <p className="co-lede">{line(copy.lede)}</p>
        <div className="co-spec" data-note="" {...(inv ? {} : { "data-layer-ink": "" })}>
          <p className="co-aa display" aria-hidden="true"><b>A</b><i>a</i></p>
          <dl>
            {copy.specimen.map((s, i) => (
              <div key={s.name}>
                <dt className={i ? "mono" : undefined}>{s.name}</dt><dd>{s.note}</dd>
                {i === copy.specimen.length - 1 ? <dd className="mono co-sample">{copy.sample}</dd> : null}
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="co-col">
        <div className="co-notes">
          {copy.sections.map((s) => (
            <section key={s.heading} data-note="">
              <h2>{s.heading}</h2><p>{s.body}</p>
              {s.heading === "The engine" ? (
                <p className="co-perft mono">
                  <span className="co-sr">{`${copy.perft.lead} ${copy.perft.rows.map((r) => `${copy.perft.depth} ${r.depth}, ${r.nodes}`).join("; ")}.`}</span>
                  {copy.perft.rows.map((r) => <span key={r.depth} aria-hidden="true"><span>{copy.perft.depth} {r.depth}</span><b data-count={r.nodes.replace(/,/g, "")}>{r.nodes}</b></span>)}
                </p>
              ) : null}
            </section>
          ))}
          <section data-note=""><h2>{copy.testsHeading}</h2><p>{copy.tests.join(" ")}</p></section>
        </div>
        <div className="co-imprint" data-note="">
          {copy.credits.map((c) => <p key={c.label}><b>{c.label}.</b> {c.text}</p>)}
        </div>
        <p className="co-by" data-note="">{copy.by}</p>
      </div>
    </div>
  );
  return (
    <main ref={el} id="main" tabIndex={-1} className="colophon" style={{ "--dark": roomFor("/colophon")?.dark } as React.CSSProperties}>
      <div className="co-dark seam-dark" />
      <div className="co-veil" aria-hidden="true" />
      {body(false)}
      {body(true)}
    </main>
  );
}
