# Hold-out correlation

Receipts from the two OPN2 exports, copied from `public/engine/*.json`.
These are the §9 guard the site can still run without the 6M `.npz` packs (gitignored).

| id | arch | positions (trainer log) | epochs | hold-out r vs SF | MAE (cp) | bytes | role |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `nnue-lichess-cc0-768x2x128-32-1-2026-08-28` | 768×2×128-32-1 | 3 000 000 | 2 | **0.31** | 191 | 205 275 | v1 playing net — 1k Gate C opponent |
| `nnue-lichess-cc0-768x2x256-32-1-2026-08-28` | 768×2×256-32-1 | 6 000 000 | 3 | **0.50** | 179 | 410 331 | v1 256 comparison; not loaded |
| `nnue-lichess-cc0-768x2x256-32-1-2026-08-29` | 768×2×256-32-1 | 20 000 000 | 3 | **0.64** | 168 | 410 331 | **playing** — depth-12 retrain; 50k Gate C pending |

v1 ingest: 6 040 000 quiet CC0 rows (`training/PROVENANCE.json`: min_depth 8). The 128 that lost Gate C at 1k was a 3M slice, two epochs, depth-8 labels.

Retrain ingest: 20 040 000 quiet rows (`training/PROVENANCE-d12.json`: min_depth 12). Progress gate passed: r vs SF 0.64 beats both v1 nets; r vs PeSTO **0.70** on the 40k hold-out (must not approach 1.0).

Quantization parity, incremental-vs-full accumulator, and the ten-position material suite live in `src/lib/chess/nnue/guards.test.ts`.

Mimicry vs PeSTO (White-POV Pearson on reconstructed hold-out boards):

```bash
npx tsx training/holdout-pesto.ts public/engine/<id>.bin --holdout training/data-d12/holdout.npz
```

r vs PeSTO must not approach 1.0. The 2026-08-29 net scored **0.7026** on the full 40k depth-12 hold-out (MAE 89 cp). The v1 256 scored r ≈ 0.48 on a 500-position smoke of the same pack.
