# Hold-out correlation

Receipts from the two OPN2 exports, copied from `public/engine/*.json`.
These are the §9 guard the site can still run without the 6M `.npz` packs (gitignored).

| id | arch | positions (trainer log) | epochs | hold-out r vs SF | MAE (cp) | bytes | role |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `nnue-lichess-cc0-768x2x128-32-1-2026-08-28` | 768×2×128-32-1 | 3 000 000 | 2 | **0.31** | 191 | 205 275 | **shipped** — Gate C opponent |
| `nnue-lichess-cc0-768x2x256-32-1-2026-08-28` | 768×2×256-32-1 | 6 000 000 | 3 | **0.50** | 179 | 410 331 | comparison only; not loaded |

Ingest kept 6 040 000 quiet CC0 rows (`training/PROVENANCE.json`: min_depth 8, ply≥10, ±1500cp, WDL sigmoid). The 128 net that lost Gate C was trained on a 3M slice, two epochs, depth-8 labels. r = 0.31 is a weak fit; losing to PeSTO at 1 000 nodes is the expected outcome, not a mystery.

The 256 file is a better fit (r = 0.50) and is **not** the net on the paper. Naming the 256 in a training commit and then matching the 128 is an identity mismatch — this table is the correction.

Quantization parity, incremental-vs-full accumulator, and the ten-position material suite live in `src/lib/chess/nnue/guards.test.ts`.
