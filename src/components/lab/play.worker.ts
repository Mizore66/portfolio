/// <reference lib="webworker" />
/**
 * The Lab's opponent (motion.md §12): the kept engine at the match's budget, 50,000 nodes a move, with either
 * evaluator. The learned net (410 KB) and its WebAssembly are fetched only on the first "load", when the visitor
 * presses Start. Scores are White's, in centipawns.
 */
import { playPly, searchMove, startPos, type EvalMode } from "@/lib/chess/engine";
import { loadNnue } from "@/lib/chess/nnue/load";
import { encodeNnue } from "@/lib/chess/nnue/format";
import { loadNnueWasm } from "@/lib/chess/nnue/wasm";
import { PHASE2_WEIGHTS_URL } from "@/lib/chess/phase2";
import type { NnueNet } from "@/lib/chess/nnue/types";
import type { Ply } from "@/lib/opening/types";

export type PlayIn =
  | { type: "load"; id: number }
  | { type: "think"; id: number; plies: Ply[]; mode: EvalMode };
export type PlayOut =
  | { type: "loaded"; id: number; ok: boolean }
  | { type: "thought"; id: number; best: Ply | null; san: string | null; cp: number; mode: EvalMode };

const NODES = 50_000;
let net: NnueNet | null = null;

self.onmessage = async (e: MessageEvent<PlayIn>) => {
  const m = e.data;
  if (m.type === "load") {
    try {
      net ??= await loadNnue(PHASE2_WEIGHTS_URL);
      const wasm = await fetch("/engine/nnue.wasm").then((r) => r.arrayBuffer());
      await loadNnueWasm(wasm, encodeNnue(net));
      self.postMessage({ type: "loaded", id: m.id, ok: true } satisfies PlayOut);
    } catch { self.postMessage({ type: "loaded", id: m.id, ok: !!net } satisfies PlayOut); }
    return;
  }
  const mode: EvalMode = m.mode === "learned" && net ? "learned" : "handcrafted";
  const pos = startPos(); // replayed from the start, so castling rights and en passant are exact
  for (const p of m.plies) playPly(pos, p);
  const r = searchMove(pos, { nodes: NODES, evalMode: mode, net: mode === "learned" ? net : null });
  self.postMessage({ type: "thought", id: m.id, best: r.best, san: r.pv[0] ?? null, cp: r.score, mode } satisfies PlayOut);
};
