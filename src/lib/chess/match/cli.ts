#!/usr/bin/env npx tsx
/**
 * Node match runner. No browser.
 *   npx tsx src/lib/chess/match/cli.ts --a handcrafted --b handcrafted --nodes 500 --suite mini
 *   npx tsx src/lib/chess/match/cli.ts --a learned --b handcrafted --weights public/engine/nnue-….bin --jobs 4
 */
import { mkdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import type { EvalMode } from "@/lib/chess/engine";
import { decodeNnue } from "@/lib/chess/nnue/format";
import { loadNnueWasm } from "@/lib/chess/nnue/wasm";
import type { NnueNet } from "@/lib/chess/nnue/types";
import { mergeReports, runMatch, continueMatch, type MatchReport } from "./runner";

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

function loadNetBytes(bytes: Uint8Array): NnueNet {
  return decodeNnue(bytes);
}

function parseShard(s: string): { index: number; count: number } | undefined {
  const m = /^(\d+)\/(\d+)$/.exec(s);
  if (!m) return undefined;
  return { index: Number(m[1]), count: Number(m[2]) };
}

const weightsPath = arg("--weights", "");
const netBytes = weightsPath ? new Uint8Array(readFileSync(resolve(weightsPath))) : null;
const net = netBytes ? loadNetBytes(netBytes) : null;
const aMode = asMode(arg("--a", arg("--white", "handcrafted")));
const bMode = asMode(arg("--b", arg("--black", "handcrafted")));
if ((aMode === "learned" || bMode === "learned") && !net) {
  throw new Error("learned eval requires --weights <opn2.bin>");
}

const jobs = Number(arg("--jobs", "1"));
const shard = parseShard(arg("--shard", ""));
const continuePath = arg("--continue", "");
const maxGames = Number(arg("--max-games", "2000"));
const cfg = {
  a: { evalMode: aMode, net: aMode === "learned" ? net : null },
  b: { evalMode: bMode, net: bMode === "learned" ? net : null },
  nodes: Number(arg("--nodes", "50000")),
  suite: arg("--suite", "v1"),
  maxPly: Number(arg("--max-ply", "160")),
  sprtStop: hasFlag("--sprt-stop") && jobs <= 1 && !shard,
  shardIndex: shard?.index,
  shardCount: shard?.count,
  maxGames,
};

function writeReport(report: MatchReport) {
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
}

function runShard(index: number, count: number, outFile: string): Promise<void> {
  const args = process.argv.slice(2).filter((a, i, all) => {
    const prev = all[i - 1];
    if (a === "--jobs" || prev === "--jobs") return false;
    if (a === "--shard" || prev === "--shard") return false;
    if (a === "--out" || prev === "--out") return false;
    return true;
  });
  args.push("--shard", `${index}/${count}`, "--out", outFile);
  return new Promise((resolveP, reject) => {
    const child = spawn("npx", ["tsx", "src/lib/chess/match/cli.ts", ...args], {
      stdio: ["ignore", "pipe", "inherit"],
      cwd: process.cwd(),
    });
    child.on("exit", (code) => {
      if (code === 0) resolveP();
      else reject(new Error(`shard ${index}/${count} exited ${code}`));
    });
  });
}

async function main() {
  if (continuePath && jobs > 1) {
    throw new Error("--continue cannot run under --jobs");
  }
  if (jobs > 1 && !shard) {
    const dir = mkdtempSync(join(tmpdir(), "match-"));
    try {
      await Promise.all(
        Array.from({ length: jobs }, (_, i) => runShard(i, jobs, join(dir, `${i}.json`))),
      );
      const parts: MatchReport[] = Array.from({ length: jobs }, (_, i) =>
        JSON.parse(readFileSync(join(dir, `${i}.json`), "utf8")) as MatchReport,
      );
      writeReport(mergeReports(parts));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
    return;
  }
  if (net && netBytes) {
    try {
      const wasm = readFileSync(resolve("public/engine/nnue.wasm"));
      await loadNnueWasm(wasm, netBytes);
    } catch {
      process.stderr.write("match: wasm nnue unavailable, using JS forward pass\n");
    }
  }
  if (continuePath) {
    const prior = JSON.parse(readFileSync(resolve(continuePath), "utf8")) as MatchReport;
    if (prior.a !== aMode || prior.b !== bMode || prior.nodes !== cfg.nodes) {
      throw new Error("continue file does not match --a/--b/--nodes");
    }
    writeReport(continueMatch(cfg, prior));
    return;
  }
  writeReport(runMatch(cfg));
}

void main();
