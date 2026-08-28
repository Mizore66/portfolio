"""Phase 2 training — PyTorch, MSE in WDL-sigmoid space.

Not run in CI. The owner already knows this stack; this file is the contract:

- Batch 8–16k, AdamW, a few epochs.
- QAT preferred; PTQ if QAT stalls.
- Export via the TS encoder in src/lib/chess/nnue/format.ts (magic OPN2).
- Net id: nnue-<data>-<arch>-<date>
- Hold-out: report correlation of net vs PeSTO on a quiet sample so we can
  see PeSTO-mimicry if the labels are weak.

Do not import this from the site bundle.
"""

from __future__ import annotations

import argparse


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--data", required=True, help="filtered JSONL from filter.py")
    p.add_argument("--arch", default="768x2x256-32-1")
    p.add_argument("--out", required=True, help="weights path")
    args = p.parse_args()
    raise SystemExit(
        f"train.py is a contract, not a trainer yet. data={args.data} arch={args.arch} out={args.out}"
    )


if __name__ == "__main__":
    raise SystemExit(main())
