"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { EvalMode, SearchInfo } from "@/lib/chess/engine";
import { numberPv } from "@/lib/chess/notation";
import type { NnueNet } from "@/lib/chess/nnue/types";
import { PHASE2_EXHIBITS, PHASE2_WEIGHTS_URL } from "@/lib/chess/phase2";
import { positionAfter } from "@/lib/chess/replay";
import { SHOW_DEPTHS, visibleEngineLine, type BookLine } from "@/lib/chess/engine-view";
import { BROADSHEET } from "@/content/opening";
import { GLIDE_MS, depthPaintMs } from "@/lib/opening/motion";
import type { Color } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

const MAX_DEPTH = 11;
const SEARCH_BUDGET_MS = 900;
/** Wall time for one iterative depth. d5 at the flagship is ~260ms on this VM. */
const SEARCH_SLICE_MS = 400;
/** Keep the first search out of the Lighthouse TBT window; later ply changes wait GLIDE_MS. */
const FIRST_SEARCH_IDLE_MS = 6000;

function afterPaint(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms));
  });
}

function whenQuiet(): Promise<void> {
  return new Promise((resolve) => {
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      ric(() => resolve(), { timeout: FIRST_SEARCH_IDLE_MS });
      return;
    }
    window.setTimeout(resolve, FIRST_SEARCH_IDLE_MS);
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
  evalMode: EvalMode = "handcrafted",
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

    async function run() {
      await afterPaint(0);
      if (glideFirst) {
        await new Promise((r) => window.setTimeout(r, GLIDE_MS));
      } else {
        started.current = true;
        await whenQuiet();
      }
      if (cancelled) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dwell = depthPaintMs(reduced);
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
          const remain = Math.max(SEARCH_BUDGET_MS - spent, 16);
          const result = search(clonePos(pos), depth, {
            timeMs: Math.min(remain, SEARCH_SLICE_MS),
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

    void run();
    return () => {
      cancelled = true;
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
  const mode = evalMode ?? "handcrafted";
  const usingLearned = info?.evalMode === "learned";
  const pvText = line.pv.length ? numberPv(line.pv, side, moveNumber) : "…";
  const settling = !down && (line.settling || (!info && PHASE2_EXHIBITS));

  return (
    <section
      className="box-inset border-2 border-ink overflow-hidden"
      data-testid="glass-engine"
      data-eval-mode={usingLearned ? "learned" : "handcrafted"}
      data-engine-down={down ? "true" : undefined}
      aria-live="polite"
      aria-label="Live engine search"
    >
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
