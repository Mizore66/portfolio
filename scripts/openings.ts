/**
 * Play's openings (the owner, 2026-10-01/02): Lichess's list of named openings (content/openings, CC0), each line's
 * moves turned into squares and its final position scored as Play scores a position, at 50,000 nodes by each
 * evaluator. Writes public/engine/openings.json:
 *   [eco, name, "e2e4 c7c5 …", learnedCp, learnedBest, handcraftedCp, handcraftedBest]
 * scores in centipawns from White's view, the best moves in SAN for the side to move.
 *
 *   npx tsx scripts/openings.ts            all of it, one process a core
 *   npx tsx scripts/openings.ts --shard 3/10 --out /tmp/x.json    one share (what the processes run)
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { cpus, tmpdir } from "node:os";
import { join } from "node:path";
import { legalPlies, playPly, sanOf, searchMove, startPos, type EvalMode } from "@/lib/chess/engine";
import { decodeNnue } from "@/lib/chess/nnue/format";
import { loadNnueWasm } from "@/lib/chess/nnue/wasm";
import { PHASE2_NET_ID } from "@/lib/chess/phase2";
import type { Ply } from "@/lib/opening/types";

const NODES = 50_000;
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : ""; };
const bare = (san: string) => san.replace(/[+#?!]/g, "");

/** a line's SAN moves as squares, or null if a move is not legal (or promotes to anything but a queen) */
function plies(pgn: string): Ply[] | null {
  const pos = startPos(), out: Ply[] = [];
  for (const tok of pgn.split(/\s+/)) {
    if (!tok || /^\d+\.+$/.test(tok)) continue;
    if (tok.includes("=") && !tok.includes("=Q")) return null;
    const p = legalPlies(pos).find((q) => bare(sanOf(pos, q)) === bare(tok));
    if (!p) return null;
    playPly(pos, p); out.push(p);
  }
  return out;
}

type Row = [string, string, string, number, string, number, string];

function lines(): { eco: string; name: string; pgn: string }[] {
  const out: { eco: string; name: string; pgn: string }[] = [];
  for (const f of "abcde") for (const l of readFileSync(`content/openings/${f}.tsv`, "utf8").split("\n").slice(1)) {
    const [eco, name, pgn] = l.split("\t"); if (eco && name && pgn) out.push({ eco, name, pgn });
  }
  return out;
}

async function share(index: number, count: number): Promise<Row[]> {
  const bytes = new Uint8Array(readFileSync(`public/engine/${PHASE2_NET_ID}.bin`)), net = decodeNnue(bytes);
  await loadNnueWasm(readFileSync("public/engine/nnue.wasm"), bytes); // the browser's forward pass (equal to the JS one)
  const rows: Row[] = [];
  lines().forEach((o, i) => {
    if (i % count !== index) return;
    const ps = plies(o.pgn);
    if (!ps) { process.stderr.write(`skipped: ${o.eco} ${o.name}\n`); return; }
    const score = (mode: EvalMode) => {
      const pos = startPos(); for (const p of ps) playPly(pos, p); // replayed from the start, as Play's worker does
      const r = searchMove(pos, { nodes: NODES, evalMode: mode, net: mode === "learned" ? net : null });
      return [r.score, r.pv[0] ?? ""] as const;
    };
    const [lc, lb] = score("learned"), [hc, hb] = score("handcrafted");
    rows.push([o.eco, o.name, ps.map((p) => p.from + p.to).join(" "), lc, lb, hc, hb]);
  });
  return rows;
}

const write = (rows: Row[]) => {
  rows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]) || a[2].length - b[2].length);
  writeFileSync("public/engine/openings.json", "[" + rows.map((r) => JSON.stringify(r)).join(",\n") + "]\n");
  return rows.length;
};

async function main() {
  const sh = arg("--shard");
  if (sh) {
    const [i, n] = sh.split("/").map(Number);
    writeFileSync(arg("--out"), JSON.stringify(await share(i, n)));
    return;
  }
  const n = Math.max(1, cpus().length - 2), dir = mkdtempSync(join(tmpdir(), "openings-")), t0 = Date.now();
  await Promise.all(Array.from({ length: n }, (_, i) => new Promise<void>((res, rej) => {
    const c = spawn("npx", ["tsx", "scripts/openings.ts", "--shard", `${i}/${n}`, "--out", join(dir, `${i}.json`)], { stdio: ["ignore", "inherit", "inherit"] });
    c.on("exit", (code) => (code === 0 ? res() : rej(new Error(`share ${i} exited ${code}`))));
  })));
  const order = new Map(lines().map((o, i) => [o.eco + "\t" + o.name + "\t" + o.pgn, i]));
  const rows = Array.from({ length: n }, (_, i) => JSON.parse(readFileSync(join(dir, `${i}.json`), "utf8")) as Row[]).flat();
  rmSync(dir, { recursive: true });
  console.log(`${write(rows)} of ${order.size} openings, ${n} processes, ${Math.round((Date.now() - t0) / 1000)} s`);
}
void main();
