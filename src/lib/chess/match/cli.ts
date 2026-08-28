#!/usr/bin/env npx tsx
/**
 * Node match runner. No browser.
 *   npx tsx src/lib/chess/match/cli.ts --a handcrafted --b handcrafted --nodes 500 --suite mini
 *   npx tsx src/lib/chess/match/cli.ts --a learned --b handcrafted --weights public/engine/nnue-….bin
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { EvalMode } from "@/lib/chess/engine";
import { decodeNnue } from "@/lib/chess/nnue/format";
import type { NnueNet } from "@/lib/chess/nnue/types";
import { runMatch } from "./runner";

function arg(flag: string, fallback: string): string {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function asMode(s: string): EvalMode {
  if (s === "learned" || s === "handcrafted") return s;
  throw new Error(`eval mode must be handcrafted|learned, got ${s}`);
}

function loadNet(path: string): NnueNet {
  const bytes = new Uint8Array(readFileSync(path));
  return decodeNnue(bytes);
}

const weightsPath = arg("--weights", "");
const net = weightsPath ? loadNet(resolve(weightsPath)) : null;
const aMode = asMode(arg("--a", arg("--white", "handcrafted")));
const bMode = asMode(arg("--b", arg("--black", "handcrafted")));
if ((aMode === "learned" || bMode === "learned") && !net) {
  throw new Error("learned eval requires --weights <opn2.bin>");
}

const cfg = {
  a: { evalMode: aMode, net: aMode === "learned" ? net : null },
  b: { evalMode: bMode, net: bMode === "learned" ? net : null },
  nodes: Number(arg("--nodes", "50000")),
  suite: arg("--suite", "v1"),
  maxPly: Number(arg("--max-ply", "160")),
  sprtStop: hasFlag("--sprt-stop"),
};

const report = runMatch(cfg);
const out = arg("--out", "");
if (out) {
  const path = resolve(out);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
}
process.stdout.write(`${report.sprtLine}\n`);
process.stdout.write(
  `suite ${report.suiteId}  ${report.games.length} games  ${report.elapsedMs}ms  net ${report.netId ?? "none"}\n`,
);
