#!/usr/bin/env python3
"""Fail if a patent numeral's anchor sits on empty paper.

Stdin: JSON array of {fig, src, mark, fromX, fromY}. Coords are percent 0–100.
An anchor passes when the darkest luma in a 6px neighborhood is ≤ 170.
"""
import json
import sys
from PIL import Image

RADIUS = 6
THRESH = 170


def luma(p):
    r, g, b = p[:3]
    return 0.299 * r + 0.587 * g + 0.114 * b


def darkest(im, fx, fy):
    w, h = im.size
    x = int(fx / 100.0 * (w - 1))
    y = int(fy / 100.0 * (h - 1))
    m = 255.0
    for yy in range(max(0, y - RADIUS), min(h, y + RADIUS + 1)):
        for xx in range(max(0, x - RADIUS), min(w, x + RADIUS + 1)):
            m = min(m, luma(im.getpixel((xx, yy))))
    return m


fails = []
cache = {}
for row in json.load(sys.stdin):
    src = row["src"]
    im = cache.get(src)
    if im is None:
        im = Image.open(src).convert("RGB")
        cache[src] = im
    L = darkest(im, row["fromX"], row["fromY"])
    if L > THRESH:
        fails.append(
            f"FIG.{row['fig']} {row['mark']} luma={L:.0f} at ({row['fromX']},{row['fromY']})"
        )
if fails:
    print("\n".join(fails), file=sys.stderr)
    sys.exit(1)
