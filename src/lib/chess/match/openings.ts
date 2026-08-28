/**
 * Versioned opening suite for engine-vs-engine matches.
 * Changing this file invalidates Elo comparisons that cite openings-v1.
 */
export const OPENING_SUITE_ID = "openings-v1";

/** UCI plies from the start position. Short, varied, both colors get a chance. */
export const OPENING_SUITE_V1: string[][] = [
  ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
  ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"],
  ["e2e4", "e7e5", "g1f3", "g8f6"],
  ["e2e4", "e7e5", "f2f4"],
  ["e2e4", "c7c5"],
  ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4"],
  ["e2e4", "c7c6"],
  ["e2e4", "e7e6"],
  ["e2e4", "d7d5"],
  ["e2e4", "g8f6"],
  ["e2e4", "d7d6"],
  ["e2e4", "g7g6"],
  ["e2e4", "b8c6"],
  ["d2d4", "d7d5"],
  ["d2d4", "d7d5", "c2c4"],
  ["d2d4", "d7d5", "c2c4", "e7e6"],
  ["d2d4", "d7d5", "c2c4", "c7c6"],
  ["d2d4", "g8f6"],
  ["d2d4", "g8f6", "c2c4", "g7g6"],
  ["d2d4", "g8f6", "c2c4", "e7e6"],
  ["d2d4", "g8f6", "c2c4", "c7c5"],
  ["d2d4", "f7f5"],
  ["d2d4", "d7d6"],
  ["d2d4", "e7e6"],
  ["c2c4", "e7e5"],
  ["c2c4", "c7c5"],
  ["c2c4", "g8f6"],
  ["g1f3", "d7d5"],
  ["g1f3", "g8f6"],
  ["g1f3", "c7c5"],
  ["b2b3", "e7e5"],
  ["g2g3", "d7d5"],
  ["e2e4", "e7e5", "d2d4"],
  ["e2e4", "e7e5", "g1f3", "b8c6", "d2d4"],
  ["e2e4", "c7c5", "c2c3"],
  ["e2e4", "c7c5", "b1c3"],
  ["e2e4", "e7e6", "d2d4", "d7d5"],
  ["e2e4", "c7c6", "d2d4", "d7d5"],
  ["d2d4", "d7d5", "g1f3", "g8f6", "c2c4"],
  ["d2d4", "g8f6", "g1f3", "g7g6"],
  ["d2d4", "g8f6", "c2c4", "e7e6", "b1c3", "f8b4"],
  ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"],
  ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6"],
  ["e2e4", "c7c5", "g1f3", "b8c6"],
  ["e2e4", "c7c5", "g1f3", "e7e6"],
  ["g1f3", "d7d5", "c2c4"],
  ["c2c4", "e7e5", "b1c3"],
  ["d2d4", "d7d5", "c2c4", "d5c4"],
  ["e2e4", "e7e5", "g1f3", "d7d6"],
  ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3", "d7d5"],
];

export const OPENING_SUITE_MINI: string[][] = OPENING_SUITE_V1.slice(0, 8);

export function suiteByName(name: string): { id: string; openings: string[][] } {
  if (name === "mini") return { id: `${OPENING_SUITE_ID}-mini`, openings: OPENING_SUITE_MINI };
  return { id: OPENING_SUITE_ID, openings: OPENING_SUITE_V1 };
}
