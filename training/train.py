#!/usr/bin/env python3
"""Train the Phase 2 net: 768 → 2×acc → CReLU → 32 → CReLU → 1.

MSE in STM WDL-sigmoid space. Fake-quant (STE) so the export matches
evaluateNnue in src/lib/chess/nnue/infer.ts.

  acc = ftB + sum_features ftW[feat]          # int16 after quant
  hidden[i] = l1B[i] + sum crelu(acc) * l1W   # crelu clip 0..127
  out = l2B + sum crelu(hidden/QA) * l2W
  cp_stm = out * scale / (QA * QB)

Not imported by the site bundle.
"""
from __future__ import annotations

import argparse
import json
import os
import struct
import sys
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

QA = 255
QB = 64
CRELU_MAX = 127
SCALE = 400
INPUT = 768
HIDDEN = 32


def fake_quant(x: torch.Tensor, lo: float, hi: float) -> torch.Tensor:
    y = x.round().clamp(lo, hi)
    return x + (y - x).detach()


def load_pack(path: Path) -> dict[str, np.ndarray]:
    pack = np.load(path, allow_pickle=False)
    return {k: pack[k] for k in pack.files}


class Nnue(nn.Module):
    def __init__(self, acc: int = 256):
        super().__init__()
        self.acc = acc
        self.ft = nn.Embedding(INPUT, acc)
        self.ft_bias = nn.Parameter(torch.zeros(acc))
        self.l1 = nn.Linear(2 * acc, HIDDEN, bias=True)
        self.l2 = nn.Linear(HIDDEN, 1, bias=True)
        nn.init.normal_(self.ft.weight, 0.0, 8.0)
        nn.init.uniform_(self.l1.weight, -0.4, 0.4)
        nn.init.zeros_(self.l1.bias)
        nn.init.uniform_(self.l2.weight, -0.4, 0.4)
        nn.init.zeros_(self.l2.bias)

    def forward(self, feat_stm, feat_nstm, mask_stm, mask_nstm, quant: bool) -> torch.Tensor:
        ft_w, ft_b = self.ft.weight, self.ft_bias
        l1_w, l1_b = self.l1.weight, self.l1.bias
        l2_w, l2_b = self.l2.weight, self.l2.bias
        if quant:
            ft_w = fake_quant(ft_w, -32767, 32767)
            ft_b = fake_quant(ft_b, -32767, 32767)
            l1_w = fake_quant(l1_w, -127, 127)
            l1_b = fake_quant(l1_b, -32768, 32767)
            l2_w = fake_quant(l2_w, -127, 127)
            l2_b = fake_quant(l2_b, -32768, 32767)
        acc_s = (ft_w[feat_stm] * mask_stm.unsqueeze(-1)).sum(dim=1) + ft_b
        acc_n = (ft_w[feat_nstm] * mask_nstm.unsqueeze(-1)).sum(dim=1) + ft_b
        h = torch.cat([acc_s.clamp(0, CRELU_MAX), acc_n.clamp(0, CRELU_MAX)], dim=1)
        hidden = F.linear(h, l1_w, l1_b)
        h2 = (hidden / QA).trunc().clamp(0, CRELU_MAX)
        out = F.linear(h2, l2_w, l2_b).squeeze(-1)
        return out * (SCALE / (QA * QB))


def encode_nnue(path: Path, net: Nnue, net_id: str) -> None:
    acc = net.acc
    ft_w = net.ft.weight.detach().round().clamp(-32767, 32767).to(torch.int16).cpu().numpy()
    ft_b = net.ft_bias.detach().round().clamp(-32767, 32767).to(torch.int16).cpu().numpy()
    l1_w = net.l1.weight.detach().round().clamp(-127, 127).to(torch.int8).cpu().numpy()
    l1_b = net.l1.bias.detach().round().clamp(-2_147_483_648, 2_147_483_647).to(torch.int32).cpu().numpy()
    l2_w = net.l2.weight.detach().round().clamp(-127, 127).to(torch.int8).cpu().numpy().reshape(-1)
    l2_b = net.l2.bias.detach().round().clamp(-2_147_483_648, 2_147_483_647).to(torch.int32).cpu().numpy()
    id_bytes = net_id.encode("utf-8")
    buf = bytearray()
    buf += b"OPN2"
    buf += struct.pack("<H", 1)
    buf += bytes([1 if acc == 256 else 2])
    buf += struct.pack("<i", SCALE)
    buf += struct.pack("<H", len(id_bytes))
    buf += id_bytes
    buf += np.ascontiguousarray(ft_w, dtype="<i2").tobytes(order="C")
    buf += np.ascontiguousarray(ft_b, dtype="<i2").tobytes(order="C")
    buf += np.ascontiguousarray(l1_w, dtype="<i1").tobytes(order="C")
    buf += np.ascontiguousarray(l1_b, dtype="<i4").tobytes(order="C")
    buf += np.ascontiguousarray(l2_w, dtype="<i1").tobytes(order="C")
    buf += np.ascontiguousarray(l2_b, dtype="<i4").tobytes(order="C")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(buf)


def batch_tensors(pack: dict[str, np.ndarray], idx: np.ndarray):
    feat_s = torch.from_numpy(pack["stm_f"][idx].astype(np.int64, copy=False))
    feat_n = torch.from_numpy(pack["nstm_f"][idx].astype(np.int64, copy=False))
    n_s = torch.from_numpy(pack["n_stm"][idx].astype(np.int64, copy=False))
    n_n = torch.from_numpy(pack["n_nstm"][idx].astype(np.int64, copy=False))
    ar = torch.arange(32)
    mask_s = (ar.unsqueeze(0) < n_s.unsqueeze(1)).float()
    mask_n = (ar.unsqueeze(0) < n_n.unsqueeze(1)).float()
    wdl = torch.from_numpy(pack["wdl"][idx].astype(np.float32, copy=False))
    cp = torch.from_numpy(pack["cp"][idx].astype(np.float32, copy=False))
    stm = torch.from_numpy(pack["stm"][idx].astype(np.float32, copy=False))
    return feat_s, feat_n, mask_s, mask_n, wdl, cp, stm


@torch.no_grad()
def holdout_metrics(net: Nnue, pack: dict[str, np.ndarray], quant: bool, batch: int) -> dict:
    net.eval()
    n = len(pack["wdl"])
    losses = []
    preds = []
    tgts = []
    for start in range(0, n, batch):
        idx = np.arange(start, min(start + batch, n))
        feat_s, feat_n, mask_s, mask_n, wdl, cp, stm = batch_tensors(pack, idx)
        pred_cp = net(feat_s, feat_n, mask_s, mask_n, quant=quant)
        pred_wdl = torch.sigmoid(pred_cp / 410.0)
        losses.append(float(F.mse_loss(pred_wdl, wdl)))
        stm_cp = torch.where(stm > 0, cp, -cp)
        preds.append(pred_cp)
        tgts.append(stm_cp)
    pred = torch.cat(preds)
    tgt = torch.cat(tgts)
    vx = pred - pred.mean()
    vy = tgt - tgt.mean()
    denom = float(vx.norm() * vy.norm())
    corr = float((vx @ vy) / denom) if denom > 0 else 0.0
    return {
        "mse": float(np.mean(losses)),
        "corr_sf": corr,
        "mae_cp": float((pred - tgt).abs().mean()),
    }


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--data", required=True, help="train.npz from ingest.py")
    p.add_argument("--holdout", default="", help="holdout.npz from ingest.py")
    p.add_argument("--arch", default="768x2x256-32-1")
    p.add_argument("--out", required=True, help="OPN2 weights path")
    p.add_argument("--epochs", type=int, default=3)
    p.add_argument("--batch", type=int, default=8192)
    p.add_argument("--lr", type=float, default=1.5e-3)
    p.add_argument("--seed", type=int, default=0)
    args = p.parse_args()

    acc = 128 if "128" in args.arch else 256
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    net = Nnue(acc=acc)
    train = load_pack(Path(args.data))
    hold = load_pack(Path(args.holdout)) if args.holdout and Path(args.holdout).exists() else None
    n = len(train["wdl"])
    opt = torch.optim.AdamW(net.parameters(), lr=args.lr, weight_decay=1e-4)
    date = time.strftime("%Y-%m-%d")
    net_id = f"nnue-lichess-cc0-{args.arch}-{date}"
    steps_per = n // args.batch
    sys.stderr.write(f"train: {n:,} positions  acc={acc}  steps/epoch={steps_per}  id={net_id}\n")

    rng = np.random.default_rng(args.seed)
    for epoch in range(args.epochs):
        net.train()
        quant = epoch >= 1
        t0 = time.time()
        running = 0.0
        steps = 0
        order = rng.permutation(n)
        for start in range(0, n - args.batch + 1, args.batch):
            idx = order[start : start + args.batch]
            feat_s, feat_n, mask_s, mask_n, wdl, _cp, _stm = batch_tensors(train, idx)
            pred_cp = net(feat_s, feat_n, mask_s, mask_n, quant=quant)
            pred_wdl = torch.sigmoid(pred_cp / 410.0)
            loss = F.mse_loss(pred_wdl, wdl)
            opt.zero_grad(set_to_none=True)
            loss.backward()
            nn.utils.clip_grad_norm_(net.parameters(), 5.0)
            opt.step()
            running += float(loss.item())
            steps += 1
            if steps % 50 == 0:
                sys.stderr.write(
                    f"  epoch {epoch + 1} step {steps}/{steps_per} loss {running / steps:.5f}\n"
                )
                sys.stderr.flush()
        metrics: dict = {
            "epoch": epoch + 1,
            "train_mse": running / max(steps, 1),
            "seconds": round(time.time() - t0, 1),
            "qat": quant,
        }
        if hold is not None:
            metrics.update(holdout_metrics(net, hold, quant=True, batch=args.batch))
        sys.stderr.write("train: " + json.dumps(metrics) + "\n")
        sys.stderr.flush()

    out = Path(args.out)
    encode_nnue(out, net, net_id)
    meta = {
        "id": net_id,
        "arch": args.arch,
        "scale": SCALE,
        "positions": n,
        "epochs": args.epochs,
        "bytes": out.stat().st_size,
    }
    if hold is not None:
        meta.update(holdout_metrics(net, hold, quant=True, batch=args.batch))
    out.with_suffix(".json").write_text(json.dumps(meta, indent=2) + "\n")
    sys.stderr.write(f"train: wrote {out} ({out.stat().st_size} bytes) {meta}\n")
    print(net_id)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
