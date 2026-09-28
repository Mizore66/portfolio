"use client";

import { useEffect, useRef } from "react";

const CLICKABLE = "a[href], button, [role=button], input, select, textarea, label, summary, [data-hot]";

/**
 * The legal-move dot from an analysis board (design/motion.md, "Cursor"): 8 px amber, exactly on the
 * pointer with no easing. Over anything clickable it becomes the 24 px capture ring; over body text
 * and inline links the native cursor returns. Mouse and pen only, and off under reduced motion.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)"), reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const el = dot.current!, html = document.documentElement;
    let on = false;
    const sync = () => { on = fine.matches && !reduced.matches; html.classList.toggle("has-cursor", on); if (!on) el.dataset.state = "off"; };
    const move = (e: PointerEvent) => {
      if (!on || e.pointerType === "touch") return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const t = e.target as Element | null;
      el.dataset.state = t?.closest?.("p, li, dd, blockquote") && !t.closest("nav") ? "off" : t?.closest?.(CLICKABLE) ? "ring" : "dot";
    };
    const leave = () => { el.dataset.state = "off"; };
    sync(); fine.addEventListener("change", sync); reduced.addEventListener("change", sync);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      fine.removeEventListener("change", sync); reduced.removeEventListener("change", sync);
      window.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave);
      html.classList.remove("has-cursor");
    };
  }, []);
  return <div ref={dot} className="cursor" data-state="off" aria-hidden="true" />;
}
