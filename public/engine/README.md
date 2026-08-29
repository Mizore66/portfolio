# Trained nets

The site lazy-loads **one** OPN2 file when LEARNED is on. Inference can run in `public/engine/nnue.wasm` (same integer forward pass as `evaluateNnue`).

| id | hold-out r vs SF | bytes | role |
| --- | --- | --- | --- |
| `nnue-lichess-cc0-768x2x128-32-1-2026-08-28` | 0.31 | 205 275 | playing net until the depth-12 256 retrain lands |
| `nnue-lichess-cc0-768x2x256-32-1-2026-08-28` | 0.50 | 410 331 | v1 256 comparison; not loaded by the paper |
| `nnue.wasm` | — | ~6 KB | integer forward pass (Rust → wasm32) |

Rebuild: `npm run nnue:wasm`.

Both v1 nets trained on Lichess evals CC0 (ingest 6M quiet + 40k holdout, min_depth 8). A depth-12 20M retrain of the 256-wide net is in progress. See `training/HOLDOUT.md`.

Do not replace the playing file without a new `fixed-N:` or `sprt:` line.

Match (openings-v1, **1000** nodes/move, 100 games, **fixed-N**, SPRT unterminated): `fixed-N: −100.0 ±35.4 Elo @ 1000 nodes, 100 games, LLR −1.69 (inconclusive)`.
