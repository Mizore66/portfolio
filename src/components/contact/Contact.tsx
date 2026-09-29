"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { roomFor } from "@/lib/seam/seam";
import { arrival } from "@/lib/seam/sweep";
import "./contact.css";

export interface ContactCopy {
  move: string; yourMove: string; email: string; reply: string;
  links: { label: string; href: string; external?: boolean }[];
  you: string; anas: string; zone: string; zoneLabel: string;
  copy: string; copied: string; copyFailed: string;
}

// The chess clock (contact-a; motion.md §6): both faces run, yours to the second with its flag lit, because it is your
// move, and Anas's in Kuala Lumpur (the owner's choice at the Contact gate). Reduced motion: it updates each minute.
const hm = (d: Date, zone?: string) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: zone });
function useNow(reduced: boolean) {
  return useSyncExternalStore(
    (f) => { const id = setInterval(f, reduced ? 60_000 : 1000); return () => clearInterval(id); },
    () => Math.floor(Date.now() / (reduced ? 60_000 : 1000)),
    () => 0,
  );
}
const noReduce = () => () => {};
function Clock({ copy }: { copy: ContactCopy }) {
  const reduced = useSyncExternalStore(noReduce, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const tick = useNow(reduced);
  // the server has no clock to show: both faces read --:-- until the first client tick
  const now = tick ? new Date() : null, kl = now ? hm(now, copy.zone) : null;
  return (
    <div className="clock" aria-label={now ? `${copy.you} ${hm(now)}, ${copy.anas} ${kl} ${copy.zoneLabel}` : undefined} role="img">
      <div className="face on"><small>{copy.you}</small><b className="mono">{now ? hm(now) : "--:--"}</b>{!reduced ? <sup className="mono">{now ? String(now.getSeconds()).padStart(2, "0") : "--"}</sup> : null}<i className="flag" /></div>
      <div className="face"><small>{copy.anas}, {copy.zoneLabel}</small><b className="mono">{kl ?? "--:--"}</b></div>
    </div>
  );
}

/**
 * Contact, the ending (contact-a; motion.md §6): the game's next move number and an open move, the address, and a
 * chess clock on the seam at the position after 10…Bg4 (55.9%). The type is drawn twice, in ink and in paper
 * clipped to the dark side; the clock is an object, drawn once above both.
 */
export function Contact({ copy }: { copy: ContactCopy }) {
  const path = usePathname(), el = useRef<HTMLElement>(null);
  // Copy email: "Copied" for two seconds; if the clipboard refuses, the reply line asks for the address to be selected
  const [copyState, setCopy] = useState<"idle" | "done" | "failed">("idle"), reset = useRef(0);
  const copyEmail = () => {
    clearTimeout(reset.current);
    navigator.clipboard.writeText(copy.email).then(() => setCopy("done"), () => setCopy("failed"))
      .finally(() => { reset.current = window.setTimeout(() => setCopy("idle"), 2000); });
  };
  useLayoutEffect(() => {
    const root = el.current!, a = arrival(path);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || a?.reduced) { root.dataset.caret = "on"; return; }
    registerEases();
    const q = (s: string) => root.querySelectorAll(s);
    const mv = q(".ct-mv [data-rise]"), lines = q(".ct-line [data-rise]"), links = q(".ct-links [data-rise]"), clock = root.querySelector(".clock");
    gsap.set([...mv, ...lines, ...links], { yPercent: 135 }); gsap.set(clock, { y: 60, rotation: 5, opacity: 0 });
    let tl: gsap.core.Timeline | undefined;
    // from the seam's landing: 11. (550 ms into the sweep), then the move, the address and the reply, the links at
    // 50 ms apart, the clock straightening from 5° as it lands, and the caret
    const play = (d: number) => {
      tl = gsap.timeline({ delay: d })
        .to(mv, { yPercent: 0, duration: 0.75, ease: "arrive", stagger: perLayer(0.05) }, 0)
        .to(lines, { yPercent: 0, duration: 0.6, ease: "arrive", stagger: perLayer(0.07) }, 0.4)
        .to(links, { yPercent: 0, duration: 0.5, ease: "arrive", stagger: perLayer(0.05) }, 0.5)
        .to(clock, { y: 0, rotation: 0, opacity: 1, duration: 0.8, ease: "arrive" }, 0.55)
        .call(() => { root.dataset.caret = "on"; }, undefined, 0.75);
    };
    const cancel = a ? a.rise((d) => play(Math.max(0, d - 0.1))) : (play(0.2), () => {});
    return () => { cancel(); tl?.kill(); delete root.dataset.caret; gsap.set([...mv, ...lines, ...links, clock], { clearProps: "transform,opacity" }); };
  }, [path]);

  const layer = (inv: boolean) => (
    <div className={`ct-layer${inv ? " seam-dark" : ""}`} data-layer={inv ? "inv" : "ink"} aria-hidden={inv || undefined} inert={inv || undefined}>
      {inv ? <p className="ct-mv display"><span className="ln" data-vt-line=""><span data-rise="">{copy.move}</span></span></p>
        : <h1 className="ct-mv display"><span className="ln" data-vt-line=""><span data-rise="">{copy.move}</span></span></h1>}
      <span className="caret" aria-hidden="true" />
      <p className="ct-line ct-yours display"><span className="ln" data-vt-line=""><span data-rise="">{copy.yourMove}</span></span></p>
      <p className="ct-line ct-mail"><span className="ln" data-vt-line=""><span data-rise=""><a href={`mailto:${copy.email}`}>{copy.email}</a><button type="button" className="ct-copy" onClick={copyEmail}>{copyState === "done" ? copy.copied : copy.copy}</button></span></span></p>
      <p className="ct-line ct-reply"><span className="ln" data-vt-line=""><span data-rise="" aria-live={inv ? undefined : "polite"}>{copyState === "failed" ? copy.copyFailed : copy.reply}</span></span></p>
      <ul className="ct-links">
        {copy.links.map((l) => (
          <li key={l.label} className="ln" data-vt-line=""><span data-rise="">
            {l.external ? <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
              : l.href.startsWith("/") ? <Link href={l.href}>{l.label}</Link> : <a href={l.href}>{l.label}</a>}
          </span></li>
        ))}
      </ul>
    </div>
  );
  return (
    <main ref={el} id="main" tabIndex={-1} className="contact" style={{ "--dark": roomFor(path)?.dark } as React.CSSProperties}>
      <div className="ct-dark seam-dark" />
      {layer(false)}
      {layer(true)}
      <Clock copy={copy} />
    </main>
  );
}
