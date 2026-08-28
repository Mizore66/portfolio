# Trained nets

`public/engine/*.bin` is the OPN2 file the site lazy-loads. Metadata from the
train run that produced the current net:

| Field | Value |
| --- | --- |
| id | `nnue-lichess-cc0-768x2x256-32-1-2026-08-28` |
| data | Lichess evals CC0, 6 000 000 train / 40 000 holdout |
| hold-out vs Stockfish labels | r = 0.50, WDL MSE 0.018, MAE 179cp |
| bytes | 410 331 (~134 KB gzip) |

Do not replace this file without a new `sprt:` line from the match harness.
