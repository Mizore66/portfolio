// The opening's clock (design/motion.md §1), apart from the stage so the hero can read it before three.js is loaded.
import line from "@/content/opening-line.json";

export const PLIES = line.plies;

// ---- timing: the game accelerates 7% a move ----
export const T_PLAY = 0.75;
export const D = PLIES.map((_, i) => 0.21 * Math.pow(0.93, i));
export const T_AT: number[] = []; { let t = T_PLAY; for (const d of D) { T_AT.push(t); t += d; } }
export const T_END = T_AT[T_AT.length - 1] + D[D.length - 1];
export const T = { play: T_PLAY, blast: T_END + 0.28, paper: T_END + 1.13, name: T_END + 1.53, total: T_END + 4.73 };
