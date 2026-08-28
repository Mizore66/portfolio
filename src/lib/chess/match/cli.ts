#!/usr/bin/env npx tsx
/**
 * Node match runner. No browser.
 *   npx tsx src/lib/chess/match/cli.ts --a handcrafted --b handcrafted --nodes 500 --suite mini
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { EvalMode } from "@/lib/chess/engine";
import { runMatch } from "./runner";

function arg(flag: string, fallback: string): string {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function asMode(s: string): EvalMode {
  if (s === "learned" || s === "handcrafted") return s;
  throw new Error(`eval mode must be handcrafted|learned, got ${s}`);
}

const cfg = {
  a: { evalMode: asMode(arg("--a", arg("--white", "handcrafted"))) },
  b: { evalMode: asMode(arg("--b", arg("--black", "handcrafted"))) },
  nodes: Number(arg("--nodes", "50000")),
  suite: arg("--suite", "v1"),
  maxPly: Number(arg("--max-ply", "160")),
};

const report = runMatch(cfg);
const out = arg("--out", "");
if (out) {
  const path = resolve(out);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
}
process.stdout.write(`${report.sprtLine}\n`);
process.stdout.write(`suite ${report.suiteId}  ${report.games.length} games  ${report.elapsedMs}ms\n`);
