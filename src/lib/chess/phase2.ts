/** Phase 2 exhibits. LEARNED is the playing eval; PeSTO remains a comparison toggle. */

export const PHASE2_EXHIBITS = true;
export const PHASE2_DEFAULT_EVAL = "learned" as const;
export const PHASE2_NET_ID = "nnue-lichess-cc0-768x2x256-32-1-2026-08-29";
export const PHASE2_WEIGHTS_URL = `/engine/${PHASE2_NET_ID}.bin`;

/**
 * From matches/gate-c-v1-50000-sprt.json.
 * Continuation of the 100-game 50 000-node match to the SPRT bound.
 * H0 = 0 Elo, H1 = +10 Elo. Decision h0. Gate A at the same cap was 0.0 Elo.
 */
export const PHASE2_MATCH = {
  netId: PHASE2_NET_ID,
  suiteId: "openings-v1",
  nodes: 50_000,
  games: 128,
  wdl: { w: 2, d: 74, l: 52 },
  elo: -143.3,
  eloErr: 35.4,
  llr: -2.99,
  sprtLine: "sprt: -143.3 ±35.4 Elo, 128 games, LLR -2.99 (h0)",
  reportLine: "sprt: −143.3 ±35.4 Elo @ 50000 nodes, 128 games, LLR −2.99 (h0)",
  regime: "openings-v1 · 50000 nodes/move · 128 games · SPRT h0",
  decision: "h0" as "h0" | "h1" | "inconclusive",
};
