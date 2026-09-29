"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { bindSeam, restColours, restFor, roomFor, setSeam } from "@/lib/seam/seam";
import { beginNav } from "@/lib/seam/sweep";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { Chrome, type SoundLabels } from "./Chrome";
import { Cursor } from "./Cursor";
import "./shell.css";

/** The site frame: the live seam, the chrome, the cursor, and the hooks that start a page change. */
export function Shell({ children, sound }: { children: React.ReactNode; sound: SoundLabels }) {
  const path = usePathname(), router = useRouter();
  const site = useRef<HTMLDivElement>(null), current = useRef(path);
  // The resting seam is server-rendered for the first paint; after that, the seam is driven from script only.
  const [initial] = useState(() => roomFor(path)?.at ?? 0.5);
  // the page on screen; updated after each commit, so Back still sees the page it is leaving
  useLayoutEffect(() => { current.current = path; }, [path]);

  useLayoutEffect(() => {
    bindSeam(site.current, initial);
    const rest = restFor(current.current);
    if (rest != null) setSeam(rest);
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      // a link that plays its own exit first (a piece in the Work room) begins the page change itself
      if (!a || a.target || a.hasAttribute("download") || a.hasAttribute("data-nav-hold")) return;
      const u = new URL(a.href);
      if (u.origin === location.origin && u.pathname !== current.current) beginNav(u.pathname, current.current);
    };
    // Back and Forward. The URL has already changed; the old page is still on screen. The router applies a
    // history restore at once, without a transition, so nothing would sweep. This listener (capture phase,
    // ahead of the router's) holds the event and navigates to the entry the browser has moved to: an
    // ordinary navigation, which sweeps exactly like a click. Scroll positions are kept per page instead.
    const onPop = (e: PopStateEvent) => {
      const to = location.pathname, from = current.current;
      if (to === from) return;
      if (!("startViewTransition" in document) || restFor(to) == null || restFor(from) == null) { beginNav(to, from); return; }
      e.stopImmediatePropagation();
      beginNav(to, from, { restoreScroll: true });
      router.replace(location.pathname + location.search + location.hash, { scroll: false });
    };
    // Smooth wheel scrolling (design/motion.md: Lenis at lerp .1). Touch scroll stays native, and under
    // reduced motion the scroll is the browser's own. The scroll never stops answering the trackpad.
    const lenis = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? null : new Lenis({ autoRaf: true, lerp: 0.1, stopInertiaOnNavigate: true });
    const onResize = () => { if (!site.current?.hasAttribute("data-seam-moving")) restColours(true); };
    document.fonts.ready.then(onResize);
    window.addEventListener("resize", onResize);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop, true);
    return () => { window.removeEventListener("resize", onResize); document.removeEventListener("click", onClick, true); window.removeEventListener("popstate", onPop, true); lenis?.destroy(); bindSeam(null, 0.5); };
  }, [initial, router]);

  return (
    <div ref={site} className="site" style={{ "--seam": `${initial * 100}%`, "--seam-o": "0px" } as React.CSSProperties}>
      {/* first in the tab order: the skip link, then the nav */}
      <Chrome sound={sound} />
      {children}
      <Cursor />
    </div>
  );
}
