/** Phase 2 exhibits. PeSTO remains the default eval. */

export const PHASE2_EXHIBITS = true;
export const PHASE2_DEFAULT_EVAL = "handcrafted" as const;
export const PHASE2_NET_ID = "nnue-lichess-cc0-768x2x128-32-1-2026-08-28";
export const PHASE2_WEIGHTS_URL = `/engine/${PHASE2_NET_ID}.bin`;

/**
 * From matches/gate-c-v1-1000.json.
 * Fixed-N at 1000 nodes/move — not a terminated SPRT, not the 50k standard regime.
 * The 128 net is the one that played; the 256 file is comparison only.
 * Deltas are rigorous; the 2200 is an anchor.
 */
export const PHASE2_MATCH = {
  netId: PHASE2_NET_ID,
  suiteId: "openings-v1",
  nodes: 1000,
  games: 100,
  wdl: { w: 5, d: 62, l: 33 },
  elo: -100.0,
  eloErr: 35.4,
  llr: -1.69,
  sprtLine: "sprt: -100.0 ±35.4 Elo, 100 games, LLR -1.69 (inconclusive)",
  reportLine:
    "fixed-N: −100.0 ±35.4 Elo @ 1000 nodes, 100 games, LLR −1.69 (inconclusive; SPRT unterminated)",
  regime: "openings-v1 · 1000 nodes/move · 100 games · fixed-N",
  decision: "inconclusive" as "h0" | "h1" | "inconclusive",
};
