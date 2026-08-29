#!/usr/bin/env python3
"""Stream Lichess evals into a packed training set.

Official dump (CC0): https://database.lichess.org/lichess_db_eval.jsonl.zst
Stops at --keep unique quiet positions (floor 5M). Writes numpy packs plus a
small JSONL sample and provenance JSON that DATA_SOURCES.md cites.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import zstandard as zstd

from board import features, parse_fen
from filter import MIN_DEPTH, keep

LICHESS_EVALS_ZST = "https://database.lichess.org/lichess_db_eval.jsonl.zst"


def open_zst_stream(url_or_path: str):
    if url_or_path == "-":
        raw = sys.stdin.buffer
        proc = None
    elif url_or_path.startswith("http://") or url_or_path.startswith("https://"):
        proc = subprocess.Popen(
            ["curl", "-L", "--fail", "--retry", "5", "--retry-delay", "4", url_or_path],
            stdout=subprocess.PIPE,
            stderr=sys.stderr,
        )
        raw = proc.stdout
        if raw is None:
            raise SystemExit("curl produced no stdout")
    else:
        proc = None
        raw = open(url_or_path, "rb")
    dctx = zstd.ZstdDecompressor()
    reader = dctx.stream_reader(raw)
    return reader, proc, raw


def save_split(path: Path, idx: np.ndarray, arrays: dict[str, np.ndarray]) -> None:
    np.savez(path, **{k: v[idx] for k, v in arrays.items()})


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--url", default=LICHESS_EVALS_ZST)
    p.add_argument("--input", help="local .jsonl.zst (overrides --url)")
    p.add_argument("--keep", type=int, default=6_000_000)
    p.add_argument("--min-depth", type=int, default=MIN_DEPTH)
    p.add_argument("--out", default="training/data")
    p.add_argument("--holdout", type=int, default=40_000)
    args = p.parse_args()
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    cap = args.keep + args.holdout
    stm_f = np.zeros((cap, 32), dtype=np.uint16)
    nstm_f = np.zeros((cap, 32), dtype=np.uint16)
    n_stm = np.zeros(cap, dtype=np.uint8)
    n_nstm = np.zeros(cap, dtype=np.uint8)
    wdl = np.zeros(cap, dtype=np.float32)
    cp = np.zeros(cap, dtype=np.int16)
    stm_a = np.zeros(cap, dtype=np.int8)

    src = args.input or args.url
    reader, proc, raw = open_zst_stream(src)
    seen: set[int] = set()
    kept = 0
    read = 0
    white_cp = 0.0
    black_cp = 0.0
    white_n = 0
    black_n = 0
    t0 = time.time()
    buf = b""
    sample_path = out_dir / "sample.jsonl"
    sample_f = open(sample_path, "w", encoding="utf-8")

    def consume_line(line: str) -> None:
        nonlocal kept, read, white_cp, black_cp, white_n, black_n
        line = line.strip()
        if not line:
            return
        read += 1
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            return
        out = keep(row, seen, quiet=True, min_depth=args.min_depth)
        if out is None or kept >= cap:
            return
        board, side, _, _ = parse_fen(out["fen"])
        fs = features(board, side)
        fn = features(board, -side)
        i = kept
        n_stm[i] = min(len(fs), 32)
        n_nstm[i] = min(len(fn), 32)
        stm_f[i, : n_stm[i]] = fs[:32]
        nstm_f[i, : n_nstm[i]] = fn[:32]
        wdl[i] = out["wdl"]
        cp[i] = out["cp"]
        stm_a[i] = out["stm"]
        kept += 1
        if kept <= 200:
            sample_f.write(json.dumps(out) + "\n")
        if out["stm"] == 1:
            white_cp += out["cp"]
            white_n += 1
        else:
            black_cp += out["cp"]
            black_n += 1
        if kept % 50_000 == 0:
            dt = max(time.time() - t0, 1e-6)
            sys.stderr.write(f"ingest: read {read:,} kept {kept:,} ({kept / dt:.0f}/s)\n")
            sys.stderr.flush()

    try:
        while kept < cap:
            chunk = reader.read(1 << 20)
            if not chunk:
                break
            buf += chunk
            while True:
                nl = buf.find(b"\n")
                if nl < 0:
                    break
                consume_line(buf[:nl].decode("utf-8", "replace"))
                buf = buf[nl + 1 :]
                if kept >= cap:
                    break
        if kept < cap and buf:
            consume_line(buf.decode("utf-8", "replace"))
    finally:
        sample_f.close()
        try:
            reader.close()
        except Exception:
            pass
        if proc is not None:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except Exception:
                proc.kill()
        if raw is not None and src != "-" and not src.startswith("http"):
            try:
                raw.close()
            except Exception:
                pass

    dt = time.time() - t0
    rng = np.random.default_rng(0)
    perm = rng.permutation(kept)
    hold_n = min(args.holdout, max(0, kept // 20), kept)
    arrays = {
        "stm_f": stm_f[:kept],
        "nstm_f": nstm_f[:kept],
        "n_stm": n_stm[:kept],
        "n_nstm": n_nstm[:kept],
        "wdl": wdl[:kept],
        "cp": cp[:kept],
        "stm": stm_a[:kept],
    }
    save_split(out_dir / "holdout.npz", perm[:hold_n], arrays)
    save_split(out_dir / "train.npz", perm[hold_n:], arrays)
    prov = {
        "source": "https://database.lichess.org/#evals",
        "url": LICHESS_EVALS_ZST,
        "license": "CC0-1.0",
        "fetched": time.strftime("%Y-%m-%d"),
        "read": read,
        "kept": kept,
        "train": int(kept - hold_n),
        "holdout": int(hold_n),
        "seconds": round(dt, 1),
        "min_depth": args.min_depth,
        "white_mean_cp": (white_cp / white_n) if white_n else None,
        "black_mean_cp": (black_cp / black_n) if black_n else None,
        "cp_convention": "white_pov",
        "filters": [
            "dedupe 4-field FEN",
            "drop ply<10 (fullmove when present; else 32-piece KQkq proxy)",
            "drop EP",
            "drop in-check",
            "drop PV-capture (first UCI hits occupied/EP)",
            "drop mate",
            "clamp ±1500cp",
            "WDL = sigmoid(stm_cp/410) with stm_cp from White-POV labels",
        ],
    }
    (out_dir / "provenance.json").write_text(json.dumps(prov, indent=2) + "\n")
    sys.stderr.write(json.dumps(prov, indent=2) + "\n")
    if kept < 5_000_000:
        sys.stderr.write(f"ingest: WARNING kept {kept:,} below the 5M floor\n")
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
