/**
 * The eval graph's numbers: the vendored engine's handcrafted search of each career position at
 * CAREER_EVAL_NODES nodes (White's view, centipawns). The search is node-limited and deterministic,
 * so the values are fixed; they are stored here rather than searched on every server cold start.
 * `game.test.ts` re-runs the search and fails if any value drifts, e.g. after a change to the line.
 */
export const CAREER_EVAL_NODES = 6000;

export const CAREER_EVALS: Readonly<Record<string, number>> = {
  nf3: 27,
  bc4: -2,
  elephant: 51,
  nf6: 37,
  alekhine: 18,
  nc6: 27,
  bb6: 27,
  closed: 232,
  "e5-push": 4,
  "skribble-lab": -8,
  bc5: 49,
  teleportal: -18,
  d4: 37,
  graduation: -18,
  deriv: 38,
  faultline: 64,
};
