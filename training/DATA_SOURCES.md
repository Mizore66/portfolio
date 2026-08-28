# Training data provenance — Engine Phase 2

This file is a **launch blocker** for any learned-eval exhibit. Do not train or ship
weights until the owner signs off on the sources below.

## Phase 2a (bootstrap)

| Source | What | License | Notes |
| --- | --- | --- | --- |
| [Lichess evaluations dump](https://database.lichess.org/#evals) | Stockfish cloud evals (FEN, depth, knodes, cp/mate, PV) | **CC0 1.0** | Primary. Hugging Face mirror: `Lichess/chess-position-evaluations` (also CC0). ~400M positions; we filter down to 10–30M usable (floor 5M). |
| Lichess game dumps | Optional sampling of quiet positions | **CC0 1.0** | Only if we need extra FENs; labels still come from evals, not game results. |

No Stockfish network weights are copied. Labels are public evals, not GPL'd parameters.

## Filters (see `filter.py`)

1. Dedupe by normalized FEN (drop move clocks).
2. Drop ply &lt; 10 (FEN full-move number).
3. Clamp cp to ±1500; drop mate-only rows for the regression head (optional mate bucket later).
4. Quiet pass: no EP-available rows in the Python cut; the TypeScript engine then keeps positions whose qsearch stays within 40cp of the static eval (`isQuietPosition`).
5. Convert cp → WDL via `sigmoid(cp / 410)` for the loss.

## Phase 2b (later)

Self-play labels from this engine at a deeper node cap. Measured against the 2a net by the match harness. Not started.

## Net ids

`nnue-<data>-<arch>-<date>` e.g. `nnue-lichess-cc0-768x2x256-32-1-2026-09-01`.
The same id is the weights filename stem, the match-report field, and the site copy.
