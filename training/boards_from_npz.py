#!/usr/bin/env python3
"""Dump hold-out boards from an ingest .npz for the PeSTO mimicry guard.

Binary stdout: magic b"BD12", little-endian u32 count, then count records of
64 int8 occupancies + 1 int8 STM (±1). Reconstruction uses STM-perspective
768-feature indices (same as training/board.py).
"""
from __future__ import annotations

import argparse
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np

from board import board_from_features


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("npz")
    p.add_argument("--limit", type=int, default=0, help="cap positions (0 = all)")
    args = p.parse_args()
    pack = np.load(args.npz, allow_pickle=False)
    n = int(len(pack["stm"]))
    if args.limit and args.limit < n:
        n = args.limit
    sys.stdout.buffer.write(b"BD12")
    sys.stdout.buffer.write(struct.pack("<I", n))
    stm_f = pack["stm_f"]
    n_stm = pack["n_stm"]
    stm = pack["stm"]
    for i in range(n):
        k = int(n_stm[i])
        feats = [int(x) for x in stm_f[i, :k]]
        side = int(stm[i])
        board = board_from_features(feats, side)
        sys.stdout.buffer.write(bytes((b & 0xFF) for b in board))
        sys.stdout.buffer.write(struct.pack("b", side))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
