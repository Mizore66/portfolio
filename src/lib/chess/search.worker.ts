/// <reference lib="webworker" />

import { clonePos, fromPieces, prepareSearch, search, type EvalMode } from "@/lib/chess/engine";
import { positionAfter } from "@/lib/chess/replay";
import type { Color } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

export type SearchJob = {
  plies: Ply[];
  side: Color;
  last: Ply | null;
  evalMode: EvalMode;
  maxDepth: number;
  sliceMs: number;
  showDepths: number;
  budgetMs: number;
  dwellMs: number;
};

export type SearchEvent =
  | {
      type: "info";
      depth: number;
      nodes: number;
      nps: number;
      evalCp: number;
      pv: string[];
      best: Ply | null;
      thinking: boolean;
      evalMode: EvalMode;
    }
  | { type: "done" }
  | { type: "error" };

self.onmessage = async (event: MessageEvent<SearchJob>) => {
  const job = event.data;
  try {
    const pos = fromPieces(positionAfter(job.plies), job.side, job.last);
    prepareSearch();
    const tSearch = performance.now();
    let nodes = 0;
    for (let depth = 1; depth <= job.maxDepth; depth++) {
      const spent = performance.now() - tSearch;
      if (depth > job.showDepths && spent > job.budgetMs) break;
      const remain = Math.max(job.budgetMs - spent, 16);
      const result = search(clonePos(pos), depth, {
        timeMs: Math.min(remain, job.sliceMs),
        evalMode: job.evalMode,
      });
      if (result.timedOut && result.pv.length === 0 && depth > 1) break;
      nodes += result.nodes;
      const ms = Math.max(1, performance.now() - tSearch);
      const more =
        depth < job.showDepths ||
        (!result.timedOut && depth < job.maxDepth && spent < job.budgetMs - 12);
      const payload: SearchEvent = {
        type: "info",
        depth: result.depth,
        nodes,
        nps: Math.round((nodes / ms) * 1000),
        evalCp: result.score,
        pv: result.pv,
        best: result.best,
        thinking: more,
        evalMode: job.evalMode,
      };
      self.postMessage(payload);
      if (!more) break;
      if (job.dwellMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, job.dwellMs));
      }
    }
    self.postMessage({ type: "done" } satisfies SearchEvent);
  } catch {
    self.postMessage({ type: "error" } satisfies SearchEvent);
  }
};
