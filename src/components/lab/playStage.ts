// Where Play.tsx finds the stage once the Lab has built it: apart from the scene (ch7.ts), so the game's controls do
// not bring three.js with them.
import type { PlayStage } from "./ch7";

let current: PlayStage | null = null;
const listeners = new Set<(p: PlayStage | null) => void>();

export const playStage = {
  get: () => current,
  on(fn: (p: PlayStage | null) => void) { listeners.add(fn); fn(current); return () => { listeners.delete(fn); }; },
  /** the game is listening: it sets its own position as it takes the board */
  taken: () => listeners.size > 0,
  /** a stage is in (or, given null, gone) */
  set(p: PlayStage | null) { current = p; listeners.forEach((fn) => fn(p)); },
};
