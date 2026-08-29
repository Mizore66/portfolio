/** Phase 2 exhibits. LEARNED is the playing eval; PeSTO remains a comparison toggle. */

export const PHASE2_EXHIBITS = true;
export const PHASE2_DEFAULT_EVAL = "learned" as const;
export const PHASE2_NET_ID = "nnue-lichess-cc0-768x2x256-32-1-2026-08-29";
export const PHASE2_WEIGHTS_URL = `/engine/${PHASE2_NET_ID}.bin`;

/**
 * From matches/gate-c-v1-50000.json.
 * Fixed-N at 50 000 nodes/move — SPRT unterminated (LLR −2.33 vs ±2.94).
 * Gate A at the same cap was 0.0 Elo. Deltas are rigorous; the 2200 is an anchor.
 */
export const PHASE2_MATCH = {
  netId: PHASE2_NET_ID,
  suiteId: "openings-v1",
  nodes: 50_000,
  games: 100,
  wdl: { w: 1, d: 59, l: 40 },
  elo: -143.1,
  eloErr: 40.5,
  llr: -2.33,
  sprtLine: "sprt: -143.1 ±40.5 Elo, 100 games, LLR -2.33 (inconclusive)",
  reportLine:
    "fixed-N: −143.1 ±40.5 Elo @ 50000 nodes, 100 games, LLR −2.33 (inconclusive; SPRT unterminated)",
  regime: "openings-v1 · 50000 nodes/move · 100 games · fixed-N",
  decision: "inconclusive" as "h0" | "h1" | "inconclusive",
};
