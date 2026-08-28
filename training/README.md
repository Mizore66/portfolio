# Engine Phase 2 training

Post-launch. The site never waits on this.

```bash
pip3 install -r training/requirements.txt
# Gate B — stream the CC0 dump until the floor (writes training/data/*.npz)
python3 training/ingest.py --keep 6000000 --out training/data
# Gate C — QAT, export OPN2
python3 training/train.py \
  --data training/data/train.npz \
  --holdout training/data/holdout.npz \
  --out public/engine/nnue-lichess-cc0-768x2x256-32-1-2026-08-28.bin
```

1. Owner approves `DATA_SOURCES.md`.
2. `ingest.py` streams `lichess_db_eval.jsonl.zst` into `filter.py` (dedupe, ply, clamp, WDL, quiet).
3. Quiet means no-check / no-EP / PV is not a capture — **not** PeSTO qsearch.
4. `train.py` is the PyTorch trainer (MSE in WDL space, QAT from epoch 2).
5. Export `OPN2` weights; load only through `decodeNnue` — mismatched headers throw.
6. Measure with the match harness. No measurement, no merge.

Architecture ceiling: 768 → 2×256 (or 2×128) → 32 → 1. No HalfKP, no Leela.
