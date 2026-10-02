/**
 * House motion (design/motion.md). One heavy in-out for anything that travels, one out-only for
 * arrivals, and a critically damped step for the seam. Nothing overshoots: an eval bar never passes its value.
 */
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

let registered = false;
export function registerEases(): void {
  if (registered) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create("seam", "M0,0 C0.7,0 0.13,1 1,1");
  CustomEase.create("arrive", "M0,0 C0.16,0.84 0.3,1 1,1");
  registered = true;
}

const K = 7, NORM = 1 - (1 + K) * Math.exp(-K);
export const evalStep = (t: number): number => (1 - (1 + K * t) * Math.exp(-K * t)) / NORM;

/** An evaluation (centipawns, White's view) as the share of the screen that is white. */
export const share = (cp: number): number => 0.5 + 0.5 * Math.tanh((0.00368208 * cp) / 2);

/** A stagger that counts within each seam layer, so a letter and its inverted copy move together. */
export const perLayer = (each: number) => (i: number, el: Element, list: Element[]): number => {
  const inv = !!el.closest("[data-layer='inv']");
  let k = 0;
  for (let j = 0; j < i; j++) if (!!list[j].closest("[data-layer='inv']") === inv) k++;
  return k * each;
};
