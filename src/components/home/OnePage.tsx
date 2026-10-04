"use client";

import { useLayoutEffect, useRef } from "react";
import { driveBlocks, registerBlock } from "@/lib/seam/blocks";
import { section } from "@/lib/seam/section";
import { PHONE } from "@/lib/seam/seam";
import { glideTo } from "@/lib/motion/scroll";
import "./home.css";

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
    const unblock = parts.map((el) => registerBlock(el, () => Number(window.matchMedia(PHONE).matches ? el.dataset.restPhone : el.dataset.rest)));
    const tops = () => [...main.querySelectorAll<HTMLElement>(":scope > section[id]")];
    const at = (id: string) => { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top + window.scrollY : null; };

    // the address and the underline follow the section under the middle of the screen: the address names the part
    // itself (/#archive for Other Projects, so a shared link comes back to it), the underline the nav item it is under
    let raf = 0;
    const follow = () => {
      raf = 0;
      const mid = innerHeight / 2;
      let id = "top";
      for (const s of tops()) if (s.getBoundingClientRect().top <= mid && s.id in OWNER) id = s.id;
      section.set(OWNER[id]);
      const want = id === "top" ? "/" : `/#${id}`;
      if (location.pathname === "/" && location.pathname + location.hash !== want) history.replaceState(history.state, "", want);
    };
    // the nav steps away while the page scrolls down under it, and comes back on the way up, at the top, or when the
    // page comes to rest on a section's top (a nav glide lands there). The résumé link never moves (motion.md).
    let lastY = window.scrollY, still = 0;
    const away = (on: boolean) => site.toggleAttribute("data-nav-away", on);
    const onTop = () => tops().some((s) => Math.abs(s.getBoundingClientRect().top) < 40);
    const steer = () => {
      const y = window.scrollY, d = y - lastY;
      if (y < 80) away(false); else if (d > 6) away(true); else if (d < -6) away(false);
      if (Math.abs(d) > 6) lastY = y;
      clearTimeout(still); still = window.setTimeout(() => { if (onTop()) away(false); }, 180);
    };
    const onScroll = () => { steer(); if (!raf) raf = requestAnimationFrame(follow); };

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
    // the Lab's italic line, once the page's own files are in (lab.css): straight away when arriving at a section
    const italic = () => document.documentElement.setAttribute("data-italic", "");
    if (hash || document.readyState === "complete") italic(); else window.addEventListener("load", italic, { once: true });
    return () => {
      window.removeEventListener("load", italic);
      cancelAnimationFrame(raf); clearTimeout(still); away(false); window.removeEventListener("scroll", onScroll); document.removeEventListener("click", onClick, true);
      unblock.forEach((u) => u()); stop(); section.set("top");
    };
  }, []);
  return <span ref={mark} hidden />;
}
