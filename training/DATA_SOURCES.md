# Training data provenance — Engine Phase 2

This file is a **launch blocker** for any learned-eval exhibit. The owner signed off
on these sources when instructing the agent to proceed with Gates B–E (2026-08-28).

## Phase 2a (bootstrap)

| Source | What | License | Notes |
| --- | --- | --- | --- |
| [Lichess evaluations dump](https://database.lichess.org/#evals) | Stockfish cloud evals (FEN, depth, knodes, cp/mate, PV) | **CC0 1.0** | Primary. Streamed from `https://database.lichess.org/lichess_db_eval.jsonl.zst` (dump last-modified 2026-08-02, 21 681 515 630 bytes compressed). Hugging Face mirror: `Lichess/chess-position-evaluations` (also CC0). ~400M positions; we filter down to 10–30M usable (floor 5M). |
| Lichess game dumps | Optional sampling of quiet positions | **CC0 1.0** | Only if we need extra FENs; labels still come from evals, not game results. |

No Stockfish network weights are copied. Labels are public evals, not GPL'd parameters.

**Run receipt:** `training/data/provenance.json` (gitignored pack; counts are copied here after ingest).

| Cut | Value |
| --- | --- |
| Stream | `lichess_db_eval.jsonl.zst` 2026-08-02 |
| Min depth | 8 |
| Label convention | White POV centipawns; STM WDL = sigmoid(±cp / 410) |
| Quiet | no EP, not in check, first PV move not a capture |
| Early | ply &lt; 10 when clocks exist; else 32-piece + KQkq |

## Filters (see `filter.py`)

1. Dedupe by normalized FEN (drop move clocks).
2. Drop ply &lt; 10 (FEN full-move number). Lichess eval FENs usually omit clocks; then drop 32-piece positions that still have KQkq.
3. Clamp cp to ±1500; drop mate-only rows for the regression head (optional mate bucket later).
4. Quiet pass: no EP; not in check; first PV ply is not a capture. (The TypeScript `isQuietPosition` qsearch cut is the engine's own debug filter — it is **not** used to label training data, so the net is not PeSTO-shaped by construction.)
5. Convert White-POV cp → STM WDL via `sigmoid(stm_cp / 410)` for the loss.

## Phase 2b (later)

Self-play labels from this engine at a deeper node cap. Measured against the 2a net by the match harness. Not started.

## Net ids

`nnue-<data>-<arch>-<date>` e.g. `nnue-lichess-cc0-768x2x256-32-1-2026-08-28`.
The same id is the weights filename stem, the match-report field, and the site copy.
