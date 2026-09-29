/**
 * The one page (owner direction, 2026-09-29): its parts are blocks, each with a resting seam, and the seam follows
 * the scroll between them. On desktop the seam is one vertical line for the whole screen, eased from one block's
 * rest to the next while the boundary between them crosses the middle 60% of the screen. On phones the seam is
 * horizontal, so each block carries its own split, at its own rest, and the black bands scroll with their sections;
 * the chrome's paper copy is clipped to the dark bands on screen. A sweep or the hero's opening owns the seam
 * while it runs (data-seam-moving), and the blocks stand aside.
 */
import { gsap } from "gsap";
import { registerEases } from "@/lib/motion/ease";
import { isPhone, restColours, seam, setDarkTest, setSeam } from "./seam";
import { navigating } from "./sweep";

export interface Block { el: HTMLElement; rest: () => number }
const blocks: Block[] = [];
let site: HTMLElement | null = null, raf = 0, settle = 0;
const order = () => blocks.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

/** Add a block (a static rest, or a function for a seam that moves, as Play's eval does). Returns the removal. */
export function registerBlock(el: HTMLElement, rest: number | (() => number)): () => void {
  const b = { el, rest: typeof rest === "number" ? () => rest : rest };
  blocks.push(b); order(); refresh();
  return () => { const i = blocks.indexOf(b); if (i >= 0) blocks.splice(i, 1); el.style.removeProperty("--seam"); refresh(); };
}

/** Re-place the seam on the next frame (a block's rest changed, or the page scrolled). */
export function refresh() { if (!raf && typeof window !== "undefined") raf = requestAnimationFrame(apply); }

const owned = () => !!site?.hasAttribute("data-seam-moving") || navigating();

function apply() {
  raf = 0;
  if (!site || !blocks.length || owned()) return;
  const H = innerHeight, W = innerWidth;
  if (isPhone()) {
    const bands: string[] = [];
    let mid: Block | null = null;
    for (const b of blocks) {
      const r = b.el.getBoundingClientRect(), at = b.rest();
      b.el.style.setProperty("--seam", `${at * 100}%`);
      if (r.top <= H / 2 && r.bottom > H / 2) mid = b;
      if (r.bottom < 0 || r.top > H) continue;
      const top = Math.max(0, r.top + at * r.height), bottom = Math.min(H, r.bottom);
      if (bottom > top) bands.push(`M0 ${top.toFixed(1)}H${W}V${bottom.toFixed(1)}H0Z`);
    }
    site.style.setProperty("--chrome-dark", bands.length ? `path("${bands.join("")}")` : "inset(0 0 100% 0)");
    // the page's seam, for what reads it (a sweep's start, the type colours): the block under the middle of the screen
    if (mid) setSeam(mid.rest());
  } else {
    const ease = gsap.parseEase("seam");
    let at: number | null = null;
    for (let i = 0; i < blocks.length; i++) {
      const r = blocks[i].el.getBoundingClientRect();
      if (at == null && r.top <= H / 2 && r.bottom > H / 2) at = blocks[i].rest();
      const next = blocks[i + 1];
      if (!next) continue;
      const y = next.el.getBoundingClientRect().top;
      if (y > 0.2 * H && y < 0.8 * H) { at = blocks[i].rest() + (next.rest() - blocks[i].rest()) * ease((0.8 * H - y) / (0.6 * H)); break; }
    }
    // what is on screen shares the one seam; what is off it keeps its own rest (audits and anchors see it as it will be)
    for (const b of blocks) {
      const r = b.el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= H) b.el.style.setProperty("--seam", `${b.rest() * 100}%`);
      else b.el.style.removeProperty("--seam");
    }
    if (at != null) setSeam(at);
  }
  clearTimeout(settle); settle = window.setTimeout(() => restColours(true), 150);
}

/** Which side a line of type rests on, on the one page: desktop, of the one seam; phones, of its own block's split. */
function dark(line: HTMLElement, r: DOMRect) {
  const b = blocks.find((x) => x.el.contains(line));
  if (!isPhone()) return r.left >= (b && b.el.style.getPropertyValue("--seam") ? b.rest() : seam.at) * innerWidth;
  if (!b) return false;
  const box = b.el.getBoundingClientRect();
  return r.top >= box.top + b.rest() * box.height;
}

/** Drive the seam from the scroll, for as long as the one page is mounted. */
export function driveBlocks(root: HTMLElement): () => void {
  registerEases();
  site = root; root.setAttribute("data-blocks", ""); setDarkTest(dark);
  const moving = new MutationObserver(refresh);
  moving.observe(root, { attributes: true, attributeFilter: ["data-seam-moving"] });
  window.addEventListener("scroll", refresh, { passive: true });
  window.addEventListener("resize", refresh);
  refresh();
  return () => {
    moving.disconnect(); window.removeEventListener("scroll", refresh); window.removeEventListener("resize", refresh);
    cancelAnimationFrame(raf); raf = 0; clearTimeout(settle); setDarkTest(null);
    root.removeAttribute("data-blocks"); root.style.removeProperty("--chrome-dark"); site = null;
  };
}
