# Engine Phase 2 training

Post-launch. The site never waits on this.

```bash
pip3 install -r training/requirements.txt
# Gate B — stream the CC0 dump until the floor (writes training/data/*.npz)
python3 training/ingest.py --keep 20000000 --min-depth 12 --out training/data
# Gate C — QAT from epoch 2, export OPN2 (256-wide)
python3 training/train.py \
  --data training/data/train.npz \
  --holdout training/data/holdout.npz \
  --arch 768x2x256-32-1 \
  --epochs 3 \
  --out public/engine/nnue-lichess-cc0-768x2x256-32-1-2026-08-29.bin
```

1. Owner approves `DATA_SOURCES.md`.
2. `ingest.py` streams `lichess_db_eval.jsonl.zst` into `filter.py` (dedupe, ply, clamp, WDL, quiet).
3. Quiet means no-check / no-EP / PV is not a capture — **not** PeSTO qsearch.
4. `train.py` is the PyTorch trainer (MSE in WDL space, QAT from epoch 2).
5. Export `OPN2` weights; load only through `decodeNnue` — mismatched headers throw.
6. Measure with the match harness. No measurement, no merge.
7. Hold-out r, float-vs-int parity, accumulator incremental==full, and the material sanity suite: `training/HOLDOUT.md`, `training/GUARDS.md`, `src/lib/chess/nnue/guards.test.ts`.

Architecture ceiling: 768 → 2×256 (or 2×128) → 32 → 1. No HalfKP, no Leela.

v1 paper loaded the **128** net; the 2026-08-28 256 file is a comparison artifact. The 2026-08-29 256 is the playing net (`PHASE2_NET_ID`). This net's Gate C SPRT terminated h0 at 128 games. A new net is only an exhibit after Gate A at the same node cap.

Mimicry guard (not CI; needs the gitignored pack):

```bash
npx tsx training/holdout-pesto.ts public/engine/nnue-lichess-cc0-768x2x256-32-1-2026-08-29.bin \
  --holdout training/data-d12/holdout.npz
```
