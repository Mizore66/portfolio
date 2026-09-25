import type { Ply } from "@/lib/opening/types";

/** D19, confirmed by the owner on 2026-09-25 (7. Bb5 and 10. Nbxd2 readings, D23). */
export const LINE_UCI = [
  "e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3", "g8f6", "d2d4", "e5d4",
  "e4e5", "d7d5", "c4b5", "f6e4", "c3d4", "c5b4", "c1d2", "b4d2", "b1d2", "c8g4",
] as const;

export const LINE_PLIES: readonly Ply[] = LINE_UCI.map((u) => ({ from: u.slice(0, 2), to: u.slice(2, 4) }));

export const LINE_SAN =
  "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. e5 d5 7. Bb5 Ne4 8. cxd4 Bb4+ 9. Bd2 Bxd2+ 10. Nbxd2 Bg4";

export const LINE_NAME = "Italian Game: Classical Variation, Greco Gambit, Anderssen Variation";
