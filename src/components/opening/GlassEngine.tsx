"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { EvalMode, SearchInfo } from "@/lib/chess/engine";
import { numberPv } from "@/lib/chess/notation";
import type { NnueNet } from "@/lib/chess/nnue/types";
import { PHASE2_DEFAULT_EVAL, PHASE2_EXHIBITS, PHASE2_WEIGHTS_URL } from "@/lib/chess/phase2";
import { positionAfter } from "@/lib/chess/replay";
import { SHOW_DEPTHS, visibleEngineLine, type BookLine } from "@/lib/chess/engine-view";
import { searchSliceMs, type SearchEvent, type SearchJob } from "@/lib/chess/search-job";
import { BROADSHEET } from "@/content/opening";
import { GLIDE_MS, depthPaintMs } from "@/lib/opening/motion";
import type { Color } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

/** One module worker for both PeSTO and the learned net. Recreate only after a crash. */
let sharedSearchWorker: Worker | null = null;
let searchJobSeq = 0;
let workerInbox: ((event: MessageEvent<SearchEvent>) => void) | null = null;
let workerOnError: (() => void) | null = null;

function dropSearchWorker() {
  sharedSearchWorker?.terminate();
  sharedSearchWorker = null;
  workerInbox = null;
  workerOnError = null;
}

function acquireSearchWorker(): Worker | null {
  if (sharedSearchWorker) return sharedSearchWorker;
  if (typeof Worker === "undefined") return null;
  try {
    const worker = new Worker(new URL("../../lib/chess/search.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<SearchEvent>) => workerInbox?.(event);
    worker.onerror = () => {
      workerOnError?.();
      dropSearchWorker();
    };
    sharedSearchWorker = worker;
    return worker;
  } catch {
    return null;
  }
}

const MAX_DEPTH = 11;
const SEARCH_BUDGET_MS = 900;
/** Wall time for one iterative depth. d5 at the flagship is ~260ms on this VM. */
const SEARCH_SLICE_MS = 400;

function afterPaint(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms));
  });
}

function whenIdle(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => resolve(), { timeout: timeoutMs });
      return;
    }
    window.setTimeout(resolve, 0);
  });
}

export function useNnueWeights(wanted: boolean) {
  const [net, setNet] = useState<NnueNet | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!wanted || !PHASE2_EXHIBITS) return;
    if (net) return;
    let cancelled = false;
    setStatus("loading");
    void import("@/lib/chess/nnue/load")
      .then(({ loadNnue }) => loadNnue(PHASE2_WEIGHTS_URL))
      .then((loaded) => {
        if (cancelled) return;
        setNet(loaded);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [wanted, net]);

  return { net, status };
}

export function useEngineSearch(
  plies: Ply[],
  side: Color,
  evalMode: EvalMode = PHASE2_DEFAULT_EVAL,
  net: NnueNet | null = null,
) {
  const [info, setInfo] = useState<SearchInfo | null>(null);
  const [down, setDown] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const last = plies[plies.length - 1] ?? null;
    const mode: EvalMode = evalMode === "learned" && net ? "learned" : "handcrafted";
    const glideFirst = started.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dwell = depthPaintMs(reduced);
    const jobId = ++searchJobSeq;

    async function runOnMain() {
      await afterPaint(glideFirst ? GLIDE_MS : 0);
      if (cancelled) return;
      setDown(false);
      try {
        const { fromPieces, prepareSearch, search, clonePos } = await import("@/lib/chess/engine");
        if (cancelled) return;
        const pos = fromPieces(positionAfter(plies), side, last);
        prepareSearch();
        const tSearch = performance.now();
        let nodes = 0;
        for (let depth = 1; depth <= MAX_DEPTH && !cancelled; depth++) {
          const spent = performance.now() - tSearch;
          if (depth > SHOW_DEPTHS && spent > SEARCH_BUDGET_MS) break;
          const result = search(clonePos(pos), depth, {
            timeMs: searchSliceMs(depth, spent, SHOW_DEPTHS, SEARCH_BUDGET_MS, SEARCH_SLICE_MS),
            evalMode: mode,
            net,
          });
          if (cancelled) return;
          if (result.timedOut && result.pv.length === 0 && depth > 1) break;
          nodes += result.nodes;
          const ms = Math.max(1, performance.now() - tSearch);
          const more =
            depth < SHOW_DEPTHS ||
            (!result.timedOut && depth < MAX_DEPTH && spent < SEARCH_BUDGET_MS - 12);
          setInfo({
            depth: result.depth,
            nodes,
            nps: Math.round((nodes / ms) * 1000),
            evalCp: result.score,
            pv: result.pv,
            best: result.best,
            thinking: more,
            evalMode: mode,
          });
          await afterPaint(dwell);
          if (cancelled) return;
          if (!more) break;
        }
      } catch {
        if (!cancelled) {
          setInfo(null);
          setDown(true);
        }
      }
      if (!cancelled) {
        setInfo((prev) => (prev ? { ...prev, thinking: false } : prev));
      }
    }

    async function runInWorker() {
      await afterPaint(glideFirst ? GLIDE_MS : 0);
      if (!glideFirst) await whenIdle(1800);
      if (cancelled) return;
      started.current = true;
      setDown(false);
      const worker = acquireSearchWorker();
      if (!worker) {
        await runOnMain();
        return;
      }
      workerInbox = (event: MessageEvent<SearchEvent>) => {
        if (cancelled) return;
        const data = event.data;
        if (data.jobId !== jobId) return;
        if (data.type === "info") {
          setInfo({
            depth: data.depth,
            nodes: data.nodes,
            nps: data.nps,
            evalCp: data.evalCp,
            pv: data.pv,
            best: data.best,
            thinking: data.thinking,
            evalMode: data.evalMode,
          });
          return;
        }
        if (data.type === "done") {
          setInfo((prev) => (prev ? { ...prev, thinking: false } : prev));
          return;
        }
        if (data.type === "error") {
          setInfo(null);
          setDown(true);
        }
      };
      workerOnError = () => {
        if (!cancelled) {
          setInfo(null);
          setDown(true);
        }
      };
      const job: SearchJob = {
        type: "search",
        jobId,
        plies,
        side,
        last,
        evalMode: mode,
        net: mode === "learned" ? net : null,
        maxDepth: MAX_DEPTH,
        sliceMs: SEARCH_SLICE_MS,
        showDepths: SHOW_DEPTHS,
        budgetMs: SEARCH_BUDGET_MS,
        dwellMs: dwell,
      };
      if (cancelled) return;
      try {
        worker.postMessage(job);
      } catch {
        dropSearchWorker();
        await runOnMain();
      }
    }

    void runInWorker();

    return () => {
      cancelled = true;
      sharedSearchWorker?.postMessage({ type: "cancel", jobId });
    };
  }, [plies, side, evalMode, net]);

  return { info, down };
}

export const GlassEngine = memo(function GlassEngine({
  info,
  book,
  side,
  moveNumber,
  lampshade,
  evalMode,
  onEvalMode,
  weightsStatus,
  down,
}: {
  info: SearchInfo | null;
  book?: BookLine | null;
  side: "w" | "b";
  moveNumber: number;
  lampshade: string;
  evalMode?: EvalMode;
  onEvalMode?: (mode: EvalMode) => void;
  weightsStatus?: "idle" | "loading" | "ready" | "error";
  down?: boolean;
}) {
  const line = visibleEngineLine(book ?? null, info);
  const mode = evalMode ?? PHASE2_DEFAULT_EVAL;
  const usingLearned = info?.evalMode === "learned";
  const pvText = line.pv.length ? numberPv(line.pv, side, moveNumber) : "…";
  const settling = !down && (line.settling || (!info && PHASE2_EXHIBITS));
  const settled = Boolean(!down && info && !info.thinking && !line.settling);
  const announcement = down
    ? BROADSHEET.engineDown
    : weightsStatus === "error"
      ? BROADSHEET.weightsError
      : settled
        ? "Engine settled."
        : "";

  return (
    <section
      className="box-inset border-2 border-ink overflow-hidden"
      data-testid="glass-engine"
      data-eval-mode={usingLearned ? "learned" : "handcrafted"}
      data-engine-down={down ? "true" : undefined}
      aria-live="off"
      aria-label="Live engine search"
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true" data-testid="engine-announce">
        {announcement}
      </p>
      <div className="engine-readout" data-testid="engine-readout">
        <p
          className="font-mono text-[12px] uppercase leading-snug tracking-[0.12em] text-faded"
          data-testid="engine-badge"
          title={PHASE2_EXHIBITS ? BROADSHEET.engineBadge : "Engine · 2200"}
        >
          {PHASE2_EXHIBITS ? BROADSHEET.engineBadge : "Engine · 2200"}
        </p>
        {PHASE2_EXHIBITS && onEvalMode ? (
          <div className="eval-toggle mt-2 flex gap-0" data-testid="eval-toggle" role="group" aria-label="Evaluation">
            <button
              type="button"
              data-testid="eval-handcrafted"
              aria-pressed={mode === "handcrafted"}
              onClick={() => onEvalMode("handcrafted")}
              className="hit-target border border-ink px-3 font-mono text-[12px] uppercase tracking-widest"
            >
              Handcrafted
            </button>
            <button
              type="button"
              data-testid="eval-learned"
              aria-pressed={mode === "learned"}
              onClick={() => onEvalMode("learned")}
              className="hit-target border border-ink border-l-0 px-3 font-mono text-[12px] uppercase tracking-widest"
            >
              Learned
            </button>
          </div>
        ) : null}
        <p
          className={cn(
            "mt-2 truncate font-mono text-[12px] tabular-nums",
            line.settling ? "text-faded" : "text-book-blue",
          )}
          data-testid="engine-pv"
          data-settling={line.settling ? "true" : "false"}
        >
          {pvText}
        </p>
        <p
          className="mt-2 min-h-4 font-mono text-[12px] text-faded"
          data-testid="engine-settling"
        >
          {down ? "\u00a0" : line.settling || !info ? BROADSHEET.settling : "\u00a0"}
        </p>
        <p
          className="mt-2 font-mono text-[12px] text-faded tabular-nums"
          data-testid="engine-depth"
          data-depth={info?.depth ?? 0}
          data-nps={info?.nps ?? 0}
          data-thinking={info?.thinking ? "true" : "false"}
          data-settling={line.settling ? "true" : "false"}
        >
          {info
            ? `d${info.depth} · ${info.nps.toLocaleString()} n/s${info.thinking ? " · …" : ""}`
            : down
              ? "—"
              : settling
                ? BROADSHEET.settling
                : BROADSHEET.searching}
        </p>
      </div>
      {down ? (
        <p
          className="mt-2 font-display text-[14px] italic leading-snug text-score-red"
          data-testid="engine-down"
        >
          {BROADSHEET.engineDown}
        </p>
      ) : null}
      {PHASE2_EXHIBITS && mode === "learned" && weightsStatus !== "ready" ? (
        <p className="mt-2 font-mono text-[12px] text-score-red" data-testid="weights-pending">
          {weightsStatus === "error" ? BROADSHEET.weightsError : BROADSHEET.weightsPending}
        </p>
      ) : null}
      <p
        data-testid="engine-lampshade"
        className="engine-lampshade mt-2 font-display text-[12px] leading-snug italic text-ink"
      >
        {lampshade}
      </p>
    </section>
  );
});
