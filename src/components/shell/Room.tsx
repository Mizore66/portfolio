"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { roomFor } from "@/lib/seam/seam";
import { arrival } from "@/lib/seam/sweep";

/**
 * A room that is not built yet (Phase 5, step 4): its resting seam, its title and a note, so every
 * page change can be seen and tested. The type is drawn twice, like every page: in ink, and in paper
 * clipped to the dark side.
 */
export function Room({ id, title, note }: { id: string; title: string; note: string }) {
  const path = usePathname(), el = useRef<HTMLElement>(null);
  // A layout effect: during a view transition React holds passive effects until it has finished.
  useLayoutEffect(() => {
    const a = arrival(path);
    if (!a || a.reduced) return;
    registerEases();
    const rise = el.current!.querySelectorAll("[data-rise]");
    gsap.set(rise, { yPercent: 135 }); // hidden until the seam lands
    let tw: gsap.core.Tween | undefined;
    const cancel = a.rise((delay) => { tw = gsap.to(rise, { yPercent: 0, duration: 0.7, ease: "arrive", delay, stagger: perLayer(0.08) }); });
    return () => { cancel(); tw?.kill(); gsap.set(rise, { clearProps: "transform" }); };
  }, [path]);
  const type = (inv: boolean) => (
    <div key={String(inv)} className={`room-layer${inv ? " seam-dark" : ""}`} data-layer={inv ? "inv" : "ink"} aria-hidden={inv || undefined} inert={inv || undefined}>
      {inv ? <p className="room-title display"><span className="ln" data-vt-line=""><span data-rise="">{title}</span></span></p>
        : <h1 className="room-title display"><span className="ln" data-vt-line=""><span data-rise="">{title}</span></span></h1>}
      <p className="room-note mono"><span className="ln" data-vt-line=""><span data-rise="">{note}</span></span></p>
    </div>
  );
  return (
    <main ref={el} id="main" tabIndex={-1} className="room" data-room={id} style={{ "--dark": roomFor(path)?.dark } as React.CSSProperties}>
      <div className="room-dark seam-dark" />
      {type(false)}
      {type(true)}
    </main>
  );
}
