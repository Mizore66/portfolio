# Trained nets

The site lazy-loads **one** OPN2 file, the 2×128 net, when the LEARNED toggle is used.

| id | hold-out r vs SF | bytes | role |
| --- | --- | --- | --- |
| `nnue-lichess-cc0-768x2x128-32-1-2026-08-28` | 0.31 | 205 275 | **shipped** — n/s closer to the 25% budget |
| `nnue-lichess-cc0-768x2x256-32-1-2026-08-28` | 0.50 | 410 331 | kept for comparison; not loaded by the paper |

Both trained on  Lichess evals CC0 (6M quiet positions, 40k holdout). Do not replace the shipped file without a new `sprt:` line.

Match (openings-v1, 1000 nodes/move, 100 games): `sprt: -100.0 ±35.4 Elo, 100 games, LLR -1.69 (inconclusive)`.
