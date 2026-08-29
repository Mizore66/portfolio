#!/usr/bin/env npx tsx
/**
 * Hold-out mimicry guard: Pearson r of integer NNUE vs PeSTO (both White POV).
 *
 *   npx tsx training/holdout-pesto.ts public/engine/<id>.bin
 *   npx tsx training/holdout-pesto.ts public/engine/<id>.bin --holdout training/data-d12/holdout.npz
 *
 * r vs PeSTO must not approach 1.0 — a net that copies the handcrafted eval
 * cannot beat it. Not CI (hold-out packs are gitignored).
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { configureEngine, evaluateHandcrafted, startPos, type EnginePos } from "@/lib/chess/engine";
import { refreshAcc } from "@/lib/chess/nnue/accumulator";
import { decodeNnue } from "@/lib/chess/nnue/format";
import { evaluateNnue } from "@/lib/chess/nnue/infer";
import type { NnueNet } from "@/lib/chess/nnue/types";

function arg(flag: string, fallback = ""): string {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  let mx = 0;
  let my = 0;
  for (let i = 0; i < n; i++) {
    mx += x[i];
    my += y[i];
  }
  mx /= n;
  my /= n;
  let num = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  const den = Math.sqrt(vx * vy);
  return den > 0 ? num / den : 0;
}

function posFromBoard(board: Int8Array, side: 1 | -1): EnginePos {
  return { board, side, castle: 0, ep: -1 };
}

function scorePair(net: NnueNet, pos: EnginePos): { pesto: number; nnue: number } {
  pos.net = net;
  pos.acc = refreshAcc(pos.board, net);
  return { pesto: evaluateHandcrafted(pos), nnue: evaluateNnue(net, pos.acc, pos.side) };
}

function loadBoards(npz: string, limit: number): Array<{ board: Int8Array; side: 1 | -1 }> {
  const helper = join(process.cwd(), "training/boards_from_npz.py");
  const args = [helper, npz];
  if (limit > 0) args.push("--limit", String(limit));
  const result = spawnSync("python3", args, { encoding: null, maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`boards_from_npz.py exited ${result.status}: ${result.stderr?.toString() ?? ""}`);
  }
  const buf = Buffer.from(result.stdout);
  if (buf.length < 8 || buf.subarray(0, 4).toString("latin1") !== "BD12") {
    throw new Error("boards_from_npz.py: bad magic");
  }
  const n = buf.readUInt32LE(4);
  const rec = 65;
  const need = 8 + n * rec;
  if (buf.length < need) throw new Error(`boards_from_npz.py: short dump ${buf.length} < ${need}`);
  const out: Array<{ board: Int8Array; side: 1 | -1 }> = [];
  for (let i = 0; i < n; i++) {
    const off = 8 + i * rec;
    const board = new Int8Array(buf.buffer, buf.byteOffset + off, 64).slice();
    const side = buf.readInt8(off + 64) as 1 | -1;
    out.push({ board, side });
  }
  return out;
}

const path = process.argv[2];
if (!path || path.startsWith("--")) throw new Error("usage: holdout-pesto.ts <opn2.bin> [--holdout train.npz] [--limit N]");
const net = decodeNnue(new Uint8Array(readFileSync(path)));
configureEngine({ evalMode: "learned", net });

const start = startPos();
const startPair = scorePair(net, start);
process.stdout.write(`net ${net.id}\nstart PeSTO ${startPair.pesto}  NNUE ${startPair.nnue}\n`);

const holdout = arg("--holdout");
if (holdout) {
  const limit = Number(arg("--limit", "0")) || 0;
  const rows = loadBoards(holdout, limit);
  const pesto: number[] = [];
  const nnue: number[] = [];
  for (const row of rows) {
    const pair = scorePair(net, posFromBoard(row.board, row.side));
    pesto.push(pair.pesto);
    nnue.push(pair.nnue);
  }
  const r = pearson(nnue, pesto);
  let mae = 0;
  for (let i = 0; i < pesto.length; i++) mae += Math.abs(nnue[i] - pesto[i]);
  mae /= Math.max(pesto.length, 1);
  process.stdout.write(`positions ${pesto.length}\nr_pesto ${r.toFixed(4)}\nmae_pesto ${mae.toFixed(1)}\n`);
  if (r >= 0.95) {
    process.stderr.write("holdout-pesto: r vs PeSTO ≥ 0.95 — mimicry gate failed\n");
    configureEngine({ evalMode: "handcrafted", net: null });
    process.exit(2);
  }
}

configureEngine({ evalMode: "handcrafted", net: null });
