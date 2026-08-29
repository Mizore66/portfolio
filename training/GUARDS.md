# §9 guards

Diagnostics that must exist before treating a self-play number as an exhibit.

| Guard | Where | What a failure means |
| --- | --- | --- |
| Hold-out r vs Stockfish | `training/HOLDOUT.md`, `public/engine/*.json` | Label noise or a dead net |
| Float vs int8 forward | `evaluateNnue` vs `evaluateNnueFloat` in `guards.test.ts` | Scale / QAT bug (a −100 can hide here) |
| Incremental accumulator == full refresh | `guards.test.ts` + `nnue.test.ts` | Make/unmake drift |
| Ten-position material order | `guards.test.ts` | Learned eval cannot rank KQ > KR > KN > K |
| Gate A calibration @ 1k | `matches/gate-a-v1-1000.json` | Harness bias (colour, adjudication) at the same node cap as Gate C |
| Gate A calibration @ 50k | `matches/gate-a-v1-50000.json` | Calibration does not transfer across regimes. A 1k sanity run does not license a 50k rematch. |

## Retrain gates (this pass)

Data gate ingest is on disk (`training/PROVENANCE-d12.json`). Gate A @ 50k printed `sprt: +0.0 ±0.0 Elo, 100 games, LLR -0.06 (inconclusive)` — fifty 1–1 pairs. Train the 256-wide net (`nnue-lichess-cc0-768x2x256-32-1-2026-08-29`), then the progress gate, then Gate C rematch. WASM is harness infrastructure, not Elo. Do not rematch the v1 128 at 50k. PeSTO stays the playing eval until Gate C prints.

### Data gate

- `min_depth ≥ 12`
- 20–30M positions **post-filter**
- 2–4 epochs
- Train **and** test the **256-wide** net
- Artifact names must match end-to-end (netId, filename, match JSON, glass-case copy). The 128/256 mix-up cost a round; do not repeat it.

### Progress gate

Hold-out MSE must improve materially over the v1 net **and** the §9 mimicry guard must run:

- correlation vs labels should rise
- correlation vs PeSTO must **not** approach 1.0 — a net that learns to imitate the handcrafted eval will never beat it

### Then, and only then

1. Gate A sanity at 50k (handcrafted vs handcrafted, even 200 games). Required before any 50k rematch publishes a number.
2. Rematch to the SPRT bound or a fixed-2000 sample at the standard regime.
3. WASM / Node-native inference is approved **strictly as harness infrastructure** so that wall-clock is tractable. It is not Elo.

If the retrained 256-wide net still loses at the standard regime, print it. A terminated, calibrated, standard-regime loss with error bars is a legitimate exhibit. The current −100 was unpublished because it was none of those three things, not because it was negative.
