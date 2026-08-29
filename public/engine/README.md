# Trained nets

The site lazy-loads **one** OPN2 file when LEARNED is on. Inference can run in `public/engine/nnue.wasm` (same integer forward pass as `evaluateNnue`).

| id | hold-out r vs SF | bytes | role |
| --- | --- | --- | --- |
| `nnue-lichess-cc0-768x2x256-32-1-2026-08-29` | 0.64 | 410 331 | **playing** — 20M, min_depth 12, 3 epochs. r vs PeSTO 0.70 |
| `nnue-lichess-cc0-768x2x128-32-1-2026-08-28` | 0.31 | 205 275 | v1; 1k Gate C opponent |
| `nnue-lichess-cc0-768x2x256-32-1-2026-08-28` | 0.50 | 410 331 | v1 256 comparison; not loaded |
| `nnue.wasm` | — | ~6 KB | integer forward pass (Rust → wasm32) |

Rebuild: `npm run nnue:wasm`.

Playing net: Lichess evals CC0, 20M quiet + 40k hold-out, min_depth 12. See `training/HOLDOUT.md`. PeSTO stays the default eval until Gate C @ 50k prints.

Published 1k column (the v1 128, not this file): `fixed-N: −100.0 ±35.4 Elo @ 1000 nodes, 100 games, LLR −1.69 (inconclusive)`.
