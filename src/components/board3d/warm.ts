import type { PieceType } from "@/lib/chess/replay";
import { pieceGeometry } from "./geometry";
import { MATERIAL_STEPS } from "./materials";

/**
 * The board's CPU-heavy setup, one step per task (brief §8, INP): the loader
 * runs these with a yield between each before the canvas mounts, so the mount
 * itself is short and a tap during loading is answered promptly.
 */
export const WARM_STEPS: (() => void)[] = [
  ...(["P", "R", "B", "Q", "K", "N"] as PieceType[]).map((t) => () => void pieceGeometry(t)),
  ...MATERIAL_STEPS,
];
