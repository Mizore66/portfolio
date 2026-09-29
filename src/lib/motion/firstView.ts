/**
 * On the one page a section makes its entrance the first time it scrolls into view (its old page made it on
 * arrival). `fn` runs once, when `threshold` of the element is on screen; returns the cancel.
 */
export function firstView(el: Element, fn: () => void, { threshold = 0.3 } = {}): () => void {
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold });
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Build a scene ahead of need: when the page is idle after load (never during the hero's opening, which owns the main
 * thread), or when the element comes within `margin` of the screen, whichever is first. A scene built as it scrolls
 * in costs the scroll a hitch. `order` staggers several scenes so each has an idle slot of its own. Returns the cancel.
 */
export function buildAhead(el: Element, build: () => void, { order = 0, margin = "100% 0px" } = {}): () => void {
  let done = false, t = 0, idle = 0;
  const go = () => { if (done) return; done = true; stop(); build(); };
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) go(); }, { rootMargin: margin });
  io.observe(el);
  const wait = () => {
    if (document.querySelector('.hero[data-intro="play"]')) { t = window.setTimeout(wait, 600); return; }
    idle = typeof requestIdleCallback === "function" ? requestIdleCallback(go, { timeout: 4000 }) : window.setTimeout(go, 200);
  };
  t = window.setTimeout(wait, 800 + order * 450);
  function stop() { io.disconnect(); clearTimeout(t); if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle); else clearTimeout(idle); }
  return () => { done = true; stop(); };
}
