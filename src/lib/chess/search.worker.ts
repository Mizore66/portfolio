/// <reference lib="webworker" />

import { clonePos, fromPieces, prepareSearch, search, type EvalMode } from "@/lib/chess/engine";
import { positionAfter } from "@/lib/chess/replay";
import { encodeNnue } from "@/lib/chess/nnue/format";
import type { NnueNet } from "@/lib/chess/nnue/types";
import { loadNnueWasm } from "@/lib/chess/nnue/wasm";
import type { SearchCancel, SearchEvent, SearchJob } from "@/lib/chess/search-job";

let activeId = -1;
let cachedNet: NnueNet | null = null;
let wasmNetId: string | null = null;

async function ensureWasm(net: NnueNet | null) {
  if (!net || wasmNetId === net.id) return;
  try {
    const wasm = await fetch("/engine/nnue.wasm").then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.arrayBuffer();
    });
    await loadNnueWasm(wasm, encodeNnue(net));
    wasmNetId = net.id;
  } catch {
    wasmNetId = null;
  }
}

function netFor(job: SearchJob): NnueNet | null {
  if (job.net) {
    cachedNet = job.net;
    return job.net;
  }
  if (job.evalMode === "learned") return cachedNet;
  return null;
}

self.onmessage = async (event: MessageEvent<SearchJob | SearchCancel>) => {
  const msg = event.data;
  if (msg.type === "cancel") {
    if (activeId === msg.jobId) activeId = -1;
    return;
  }
  const job = msg;
  activeId = job.jobId;
  try {
    const net = netFor(job);
    await ensureWasm(net);
    const mode: EvalMode = job.evalMode === "learned" && net ? "learned" : "handcrafted";
    const pos = fromPieces(positionAfter(job.plies), job.side, job.last);
    prepareSearch();
    const tSearch = performance.now();
    let nodes = 0;
    for (let depth = 1; depth <= job.maxDepth; depth++) {
      if (activeId !== job.jobId) return;
      const spent = performance.now() - tSearch;
      if (depth > job.showDepths && spent > job.budgetMs) break;
      const remain = Math.max(job.budgetMs - spent, 16);
      const result = search(clonePos(pos), depth, {
        timeMs: Math.min(remain, job.sliceMs),
        evalMode: mode,
        net,
      });
      if (activeId !== job.jobId) return;
      if (result.timedOut && result.pv.length === 0 && depth > 1) break;
      nodes += result.nodes;
      const ms = Math.max(1, performance.now() - tSearch);
      const more =
        depth < job.showDepths ||
        (!result.timedOut && depth < job.maxDepth && spent < job.budgetMs - 12);
      const payload: SearchEvent = {
        type: "info",
        jobId: job.jobId,
        depth: result.depth,
        nodes,
        nps: Math.round((nodes / ms) * 1000),
        evalCp: result.score,
        pv: result.pv,
        best: result.best,
        thinking: more,
        evalMode: mode,
      };
      self.postMessage(payload);
      if (!more) break;
      if (job.dwellMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, job.dwellMs));
      }
    }
    if (activeId === job.jobId) {
      self.postMessage({ type: "done", jobId: job.jobId } satisfies SearchEvent);
    }
  } catch {
    if (activeId === job.jobId) {
      self.postMessage({ type: "error", jobId: job.jobId } satisfies SearchEvent);
    }
  }
};
