/**
 * On the one page a section makes its entrance the first time it scrolls into view (its old page made it on
 * arrival). `fn` runs once, when `threshold` of the element is on screen; returns the cancel.
 */
export function firstView(el: Element, fn: () => void, { threshold = 0.3 } = {}): () => void {
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold });
  io.observe(el);
  return () => io.disconnect();
}
