import type { EvalMode } from "@/lib/chess/engine";
import type { NnueNet } from "@/lib/chess/nnue/types";
import type { Color } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

export type SearchJob = {
  type?: "search";
  jobId: number;
  plies: Ply[];
  side: Color;
  last: Ply | null;
  evalMode: EvalMode;
  /** Structured-cloned OPN2 weights. Required when evalMode is learned. */
  net: NnueNet | null;
  maxDepth: number;
  sliceMs: number;
  showDepths: number;
  budgetMs: number;
  dwellMs: number;
};

/** Depths the glass must paint get a full slice even after the race budget. */
export function searchSliceMs(
  depth: number,
  spent: number,
  showDepths: number,
  budgetMs: number,
  sliceMs: number,
): number {
  if (depth <= showDepths) return sliceMs;
  return Math.min(sliceMs, Math.max(budgetMs - spent, 16));
}

export type SearchCancel = {
  type: "cancel";
  jobId: number;
};

export type SearchEvent =
  | {
      type: "info";
      jobId: number;
      depth: number;
      nodes: number;
      nps: number;
      evalCp: number;
      pv: string[];
      best: Ply | null;
      thinking: boolean;
      evalMode: EvalMode;
    }
  | { type: "done"; jobId: number }
  | { type: "error"; jobId: number };
