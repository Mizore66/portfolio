"use client";

import { useLayoutEffect, useRef } from "react";
import { driveBlocks, registerBlock } from "@/lib/seam/blocks";
import { section } from "@/lib/seam/section";
import { glideTo } from "@/lib/motion/scroll";

/** The nav's four sections, and the parts of the page each one covers (Other Projects is Work's). */
const OWNER: Record<string, string> = { top: "top", roles: "roles", work: "work", archive: "work", lab: "lab", contact: "contact" };

/**
 * The one page's conductor: it registers the sections' resting seams with the blocks (blocks.ts; the Lab registers
 * its own), glides to a section when the nav asks, keeps the address on the section in view (/#work …) and tells
 * the nav which one that is.
 */
export function OnePage() {
  const mark = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const main = mark.current!.closest("main")!, site = main.closest<HTMLElement>(".site")!;
    const parts = [...main.querySelectorAll<HTMLElement>(":scope > [data-rest]")];
    const stop = driveBlocks(site);
    const unblock = parts.map((el) => registerBlock(el, () => Number(window.matchMedia("(max-width: 600px)").matches ? el.dataset.restPhone : el.dataset.rest)));
    const tops = () => [...main.querySelectorAll<HTMLElement>(":scope > section[id]")];
    const at = (id: string) => { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top + window.scrollY : null; };

    // the address and the underline follow the section under the middle of the screen
    let raf = 0;
    const follow = () => {
      raf = 0;
      const mid = innerHeight / 2;
      let id = "top";
      for (const s of tops()) if (s.getBoundingClientRect().top <= mid) id = OWNER[s.id] ?? id;
      section.set(id);
      const want = id === "top" ? "/" : `/#${id}`;
      if (location.pathname === "/" && location.pathname + location.hash !== want) history.replaceState(history.state, "", want);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(follow); };

    // the nav's sections: a glide, not a jump, and no page change
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target) return;
      const u = new URL(a.href);
      if (u.origin !== location.origin || u.pathname !== "/") return;
      const id = u.hash.slice(1) || "top", y = at(id);
      if (y == null) return;
      e.preventDefault(); e.stopPropagation();
      glideTo(id === "top" ? 0 : y);
      history.replaceState(history.state, "", id === "top" ? "/" : `/#${id}`);
    };

    // arriving on a section's address: straight there, before the first frame is seen
    const hash = location.hash.slice(1);
    if (hash) { const y = at(hash); if (y != null) glideTo(y, { immediate: true }); }
    follow();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); document.removeEventListener("click", onClick, true);
      unblock.forEach((u) => u()); stop(); section.set("top");
    };
  }, []);
  return <span ref={mark} hidden />;
}
