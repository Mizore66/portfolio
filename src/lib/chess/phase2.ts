/** Phase 2 exhibits. PeSTO remains the default eval until the owner flips this. */

export const PHASE2_EXHIBITS = false;
export const PHASE2_DEFAULT_EVAL = "handcrafted" as const;
export const PHASE2_NET_ID = "nnue-lichess-cc0-768x2x256-32-1-2026-08-28";
export const PHASE2_WEIGHTS_URL = `/engine/${PHASE2_NET_ID}.bin`;

/** Filled from matches/*.json after Gate C. Deltas are rigorous; the 2200 is an anchor. */
export const PHASE2_MATCH = {
  netId: PHASE2_NET_ID,
  suiteId: "openings-v1",
  nodes: 50_000,
  games: 0,
  elo: 0,
  eloErr: 0,
  sprtLine: "",
  decision: "inconclusive" as "h0" | "h1" | "inconclusive",
};
