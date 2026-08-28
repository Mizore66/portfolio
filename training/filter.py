#!/usr/bin/env python3
"""Filter labeled chess positions for NNUE training.

Reads JSONL objects {fen, cp, ply?, mate?} from stdin or --input.
Also accepts a Lichess evals dump row {fen, evals:[{depth, pvs:[{cp, line}]}]}
or the Hugging Face flat row {fen, cp, mate, depth, line}.

Writes JSONL {fen, cp, wdl, ply, depth?} to stdout.

Does not download data. Provenance lives in DATA_SOURCES.md.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import sys
from typing import Any

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from board import in_check, is_early_opening, parse_fen, uci_is_capture

CLAMP = 1500
MIN_PLY = 10
CP_SCALE = 410.0
MIN_DEPTH = 8


def normalize_fen(fen: str) -> str:
    parts = fen.strip().split()
    if len(parts) >= 4:
        return " ".join(parts[:4])
    return fen.strip()


def ply_of(row: dict[str, Any]) -> int | None:
    if "ply" in row and row["ply"] is not None:
        return int(row["ply"])
    fen = row.get("fen") or ""
    parts = fen.split()
    if len(parts) >= 6:
        full = int(parts[5])
        stm = 0 if parts[1] == "w" else 1
        return max(0, (full - 1) * 2 + stm)
    return None


def wdl_from_cp(cp: int) -> float:
    x = max(-CLAMP, min(CLAMP, cp)) / CP_SCALE
    return 1.0 / (1.0 + math.exp(-x))


def flatten_lichess(row: dict[str, Any]) -> dict[str, Any] | None:
    """Collapse a dump/HF row to {fen, cp, mate?, ply?, depth?, line?}."""
    if "evals" in row:
        evals = row.get("evals") or []
        if not evals:
            return None
        best = max(evals, key=lambda e: int(e.get("depth") or 0))
        pvs = best.get("pvs") or []
        if not pvs:
            return None
        pv = pvs[0]
        return {
            "fen": row.get("fen"),
            "cp": pv.get("cp"),
            "mate": pv.get("mate"),
            "ply": row.get("ply"),
            "depth": best.get("depth"),
            "line": pv.get("line") or "",
        }
    return row


def keep(row: dict[str, Any], seen: set[str], quiet: bool = True, min_depth: int = 0) -> dict[str, Any] | None:
    flat = flatten_lichess(row)
    if not flat:
        return None
    if flat.get("mate") not in (None, 0, "null"):
        return None
    cp = flat.get("cp")
    if cp is None:
        return None
    depth = int(flat.get("depth") or 0)
    if min_depth and depth and depth < min_depth:
        return None
    fen = normalize_fen(str(flat["fen"]))
    try:
        board, stm, castle, ep = parse_fen(fen)
    except (KeyError, IndexError, ValueError):
        return None
    ply = ply_of(flat)
    if is_early_opening(board, castle, ply):
        return None
    if ep >= 0:
        return None
    if quiet:
        if in_check(board, stm):
            return None
        line = str(flat.get("line") or "").split()
        if line and uci_is_capture(board, ep, line[0]):
            return None
    key = hashlib.sha1(fen.encode()).hexdigest()
    if key in seen:
        return None
    seen.add(key)
    cp = max(-CLAMP, min(CLAMP, int(cp)))
    # Lichess dump cp is White's POV (eval bar). Train STM-relative WDL.
    stm_cp = cp if stm == 1 else -cp
    out: dict[str, Any] = {
        "fen": fen,
        "cp": cp,
        "wdl": round(wdl_from_cp(stm_cp), 6),
        "ply": ply if ply is not None else 99,
        "stm": stm,
    }
    if depth:
        out["depth"] = depth
    return out


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", "-i", help="JSONL file (default stdin)")
    p.add_argument("--no-quiet", action="store_true", help="skip check/capture cuts")
    p.add_argument("--min-depth", type=int, default=0)
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
            out = keep(row, seen, quiet=not args.no_quiet, min_depth=args.min_depth)
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
