/** The page's smooth scroll (Lenis, created by the Shell), for code that scrolls on purpose: the one page's nav. */
import type Lenis from "lenis";

let lenis: Lenis | null = null, locked = false;
export const bindLenis = (l: Lenis | null) => { lenis = l; if (locked) l?.stop(); };

/** Glide to a document y: Lenis with the seam ease where it runs, otherwise the browser (reduced motion: a jump). */
export function glideTo(y: number, { immediate = false } = {}) {
  const d = Math.abs(y - window.scrollY);
  if (lenis && !immediate) lenis.scrollTo(y, { duration: Math.min(1.6, 0.7 + d / 4000), easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
}

/** Hold the page still (the hero's opening): no wheel, no touch scroll, no keys. */
export function lockScroll(on: boolean) {
  locked = on; // the Shell's Lenis may be made after the lock (the hero's effect runs first)
  if (on) lenis?.stop(); else lenis?.start();
  document.documentElement.style.overflow = on ? "hidden" : "";
}
