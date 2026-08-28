# Engine Phase 2 training

Post-launch. The site never waits on this.

1. Owner approves `DATA_SOURCES.md`.
2. Stream a dump into `filter.py` (dedupe, ply, clamp, WDL).
3. Quiet-filter with the TypeScript engine (`isQuietPosition`) before training.
4. `train.py` is the PyTorch contract (MSE in WDL space, QAT preferred).
5. Export `OPN2` weights; load only through `decodeNnue` — mismatched headers throw.
6. Measure with the match harness. No measurement, no merge.

Architecture ceiling: 768 → 2×256 (or 2×128) → 32 → 1. No HalfKP, no Leela.
