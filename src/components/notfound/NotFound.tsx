"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { registerEases, perLayer } from "@/lib/motion/ease";
import { restColours, setSeam } from "@/lib/seam/seam";
import type { pawn } from "./pawn";
import "./notfound.css";

export interface NotFoundCopy { title: string; line: string; note: string; back: string }

/** The 404 (key frame 404-c, "Taken"): the gallery, all black (no paper edge, as on Work), and one captured pawn. */
export function NotFound({ copy }: { copy: NotFoundCopy }) {
  const path = usePathname(), el = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const root = el.current!;
    setSeam(0); restColours(true);
    let scene: ReturnType<typeof pawn> | null = null, dead = false;
    // its scene comes in its own chunk (pawn.ts), so the three.js in it is not part of every page's first load
    import("./pawn").then((m) => { if (dead) return; try { scene = m.pawn(canvas.current!); } catch { root.dataset.gl = "off"; } }, () => { root.dataset.gl = "off"; });
    const onResize = () => scene?.draw();
    window.addEventListener("resize", onResize);
    let tw: gsap.core.Tween | undefined;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      registerEases();
      const rise = root.querySelectorAll("[data-rise]");
      gsap.set(rise, { yPercent: 135 });
      tw = gsap.to(rise, { yPercent: 0, duration: 0.7, ease: "arrive", delay: 0.25, stagger: perLayer(0.08) });
    }
    return () => { dead = true; tw?.kill(); window.removeEventListener("resize", onResize); scene?.dispose(); };
  }, [path]);
  return (
    <main ref={el} id="main" tabIndex={-1} className="nf" data-seam-rest="0" data-seam-rest-phone="0">
      {/* the first paint, before the seam is driven from script: all gallery */}
      <style>{".site:not([data-seam-bound]){--seam:0%!important}"}</style>
      <canvas ref={canvas} className="nf-canvas" aria-hidden="true" />
      <div className="nf-paper" />
      <div className="nf-type">
        <h1 className="nf-ttl display"><span className="ln"><span data-rise="">{copy.title}</span></span></h1>
        <p className="nf-line"><span className="ln"><span data-rise="">{copy.line.replace("{path}", path)}</span></span></p>
        <p className="nf-note mono"><span className="ln"><span data-rise="">{copy.note}</span></span></p>
        <p className="nf-back"><span className="ln"><span data-rise=""><Link href="/">{copy.back}</Link></span></span></p>
      </div>
    </main>
  );
}
