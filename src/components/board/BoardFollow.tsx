"use client";

import { useEffect } from "react";
import { boardStore } from "@/lib/board/store";

/**
 * Scroll selects a move (brief §4): the entry crossing the middle of the
 * viewport sets the board to its move. Entries carry `data-node`. A takeback in
 * progress is left to finish before scroll takes over again.
 */
export function BoardFollow() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-node]")];
    if (!els.length) return;
    const quietUntil = performance.now() + 1400;
    const io = new IntersectionObserver(
      (entries) => {
        if (performance.now() < quietUntil) return;
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const id = hit?.target.getAttribute("data-node");
        if (id && boardStore().getState().data?.nodes[id]) boardStore().getState().setNode(id, "scroll");
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
