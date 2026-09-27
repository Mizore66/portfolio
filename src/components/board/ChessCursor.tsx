"use client";

import { useEffect, useRef } from "react";

/**
 * The analysis-board cursor (brief §4, from Revelatio's dot). Fine pointers
 * only, never under reduced motion, never eased, never hiding the pointer.
 *
 * - Over a board box: the legal-move dot sits exactly on the pointer (the box
 *   hides the system arrow, the dot replaces it) and the 3D view lights the square.
 * - Over `[data-cursor="piece"]` (nav, calls to action, cards, graph marks): a
 *   small knight rides beside the system pointer and steps one square on click.
 * - Everywhere else, including body text and inline links: the system cursor only.
 */
export function ChessCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const piece = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;
    const d = dot.current;
    const p = piece.current;
    if (!d || !p) return;
    document.documentElement.dataset.chessCursor = "";
    let mode: "none" | "board" | "piece" = "none";
    const set = (m: typeof mode) => {
      if (m === mode) return;
      mode = m;
      d.dataset.on = m === "board" ? "1" : "0";
      p.dataset.on = m === "piece" ? "1" : "0";
    };
    const move = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest?.("[data-cursor]");
      const kind = t?.getAttribute("data-cursor");
      set(kind === "board" ? "board" : kind === "piece" ? "piece" : "none");
      d.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      p.style.transform = `translate3d(${e.clientX + 14}px, ${e.clientY + 12}px, 0)`;
    };
    const down = () => {
      if (mode !== "piece") return;
      p.dataset.step = "1";
      setTimeout(() => (p.dataset.step = "0"), 400);
    };
    const leave = () => set("none");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      delete document.documentElement.dataset.chessCursor;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="chess-cursor-dot" aria-hidden="true" data-on="0" />
      <div ref={piece} className="chess-cursor-piece" aria-hidden="true" data-on="0">
        <span>{"\u2658\uFE0E"}</span>
      </div>
    </>
  );
}
