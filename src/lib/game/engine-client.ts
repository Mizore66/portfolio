"use client";

import type { EvalMode } from "@/lib/chess/engine";
import type { NnueNet } from "@/lib/chess/nnue/types";
import { PHASE2_WEIGHTS_URL } from "@/lib/chess/phase2";
import type { Color } from "@/lib/chess/replay";
import type { SearchEvent, SearchJob } from "@/lib/chess/search-job";
import type { Ply } from "@/lib/opening/types";

/**
 * Client for the vendored search worker. Nothing here runs until the visitor starts the engine
 * (brief §4.6): the worker, the weights and the WASM are all created on demand.
 */

let worker: Worker | null = null;
let seq = 0;
const listeners = new Map<number, (e: SearchEvent) => void>();

function acquire(): Worker | null {
  if (worker) return worker;
  if (typeof Worker === "undefined") return null;
  try {
    const w = new Worker(new URL("../chess/search.worker.ts", import.meta.url), { type: "module" });
    w.onmessage = (event: MessageEvent<SearchEvent>) => listeners.get(event.data.jobId)?.(event.data);
    w.onerror = () => {
      for (const [id, fn] of listeners) fn({ type: "error", jobId: id });
      listeners.clear();
      w.terminate();
      worker = null;
    };
    worker = w;
    return w;
  } catch {
    return null;
  }
}

export type SearchRequest = {
  /** Replay plies from the start position (castling as king + rook). */
  plies: Ply[];
  side: Color;
  mode: EvalMode;
  net: NnueNet | null;
};

/** Iterative deepening, capped so a search always ends: nothing on this site runs forever. */
const LIMITS = { maxDepth: 12, sliceMs: 1600, showDepths: 6, budgetMs: 1500, dwellMs: 0 };

/** Starts a search; returns a cancel function. Events stop after cancel. */
export function startSearch(req: SearchRequest, onEvent: (e: SearchEvent) => void): () => void {
  const w = acquire();
  const jobId = ++seq;
  if (!w) {
    queueMicrotask(() => onEvent({ type: "error", jobId }));
    return () => {};
  }
  listeners.set(jobId, (e) => {
    onEvent(e);
    if (e.type !== "info") listeners.delete(jobId);
  });
  const job: SearchJob = {
    type: "search",
    jobId,
    plies: req.plies,
    side: req.side,
    last: req.plies[req.plies.length - 1] ?? null,
    evalMode: req.mode,
    net: req.mode === "learned" ? req.net : null,
    ...LIMITS,
  };
  w.postMessage(job);
  return () => {
    if (!listeners.has(jobId)) return;
    listeners.delete(jobId);
    w.postMessage({ type: "cancel", jobId });
  };
}

let netPromise: Promise<NnueNet> | null = null;

/** Fetched once, only when Learned is chosen. */
export function loadLearnedNet(): Promise<NnueNet> {
  netPromise ??= import("@/lib/chess/nnue/load").then(({ loadNnue }) => loadNnue(PHASE2_WEIGHTS_URL));
  netPromise.catch(() => {
    netPromise = null;
  });
  return netPromise;
}
