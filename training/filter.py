#!/usr/bin/env python3
"""Filter labeled chess positions for NNUE training.

Reads JSONL objects {fen, cp, ply?, mate?} from stdin or --input.
Writes JSONL {fen, cp, wdl, ply} to stdout.

Does not download data. Provenance lives in DATA_SOURCES.md.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from typing import Any

CLAMP = 1500
MIN_PLY = 10
CP_SCALE = 410.0


def normalize_fen(fen: str) -> str:
    parts = fen.strip().split()
    if len(parts) >= 4:
        return " ".join(parts[:4])
    return fen.strip()


def ply_of(row: dict[str, Any]) -> int:
    if "ply" in row and row["ply"] is not None:
        return int(row["ply"])
    fen = row.get("fen") or ""
    parts = fen.split()
    if len(parts) >= 6:
        full = int(parts[5])
        stm = 0 if parts[1] == "w" else 1
        return max(0, (full - 1) * 2 + stm)
    return 99


def wdl_from_cp(cp: int) -> float:
    x = max(-CLAMP, min(CLAMP, cp)) / CP_SCALE
    return 1.0 / (1.0 + math.exp(-x))


def keep(row: dict[str, Any], seen: set[str]) -> dict[str, Any] | None:
    if row.get("mate") not in (None, 0, "null"):
        return None
    cp = row.get("cp")
    if cp is None:
        return None
    cp = int(cp)
    cp = max(-CLAMP, min(CLAMP, cp))
    ply = ply_of(row)
    if ply < MIN_PLY:
        return None
    fen = normalize_fen(str(row["fen"]))
    parts = fen.split()
    if len(parts) >= 4 and parts[3] not in ("-", ""):
        return None
    key = hashlib.sha1(fen.encode()).hexdigest()
    if key in seen:
        return None
    seen.add(key)
    return {"fen": fen, "cp": cp, "wdl": round(wdl_from_cp(cp), 6), "ply": ply}


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", "-i", help="JSONL file (default stdin)")
    args = p.parse_args()
    inf = open(args.input, encoding="utf-8") if args.input else sys.stdin
    seen: set[str] = set()
    kept = 0
    read = 0
    try:
        for line in inf:
            line = line.strip()
            if not line:
                continue
            read += 1
            row = json.loads(line)
            out = keep(row, seen)
            if out:
                sys.stdout.write(json.dumps(out) + "\n")
                kept += 1
    finally:
        if inf is not sys.stdin:
            inf.close()
    sys.stderr.write(f"filter: read {read} kept {kept}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
