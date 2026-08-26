"use client";

import { useEffect, useState } from "react";
import { clonePos, fromPieces, search, type SearchInfo } from "@/lib/chess/engine";
import { positionAfter } from "@/lib/chess/replay";
import { lastPly, sideToMove } from "@/lib/opening/tree";
import type { Ply } from "@/lib/opening/types";

export function useEngineSearch(selectedId: string, plies: Ply[]) {
  const [info, setInfo] = useState<SearchInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t0 = performance.now();
    let nodes = 0;

    async function run() {
      await Promise.resolve();
      try {
        const pos = fromPieces(positionAfter(plies), sideToMove(selectedId), lastPly(selectedId));
        for (let depth = 1; depth <= 4 && !cancelled; depth++) {
          const result = search(clonePos(pos), depth);
          if (cancelled) return;
          nodes += result.nodes;
          const ms = Math.max(1, performance.now() - t0);
          const thinking = depth < 4 && ms < 160;
          setInfo({
            depth,
            nodes,
            nps: Math.round((nodes / ms) * 1000),
            evalCp: result.score,
            pv: result.pv,
            thinking,
          });
          if (!thinking) break;
          await new Promise((r) => window.setTimeout(r, 0));
        }
      } catch {
        if (!cancelled) setInfo(null);
      }
      if (!cancelled) {
        setInfo((prev) => (prev ? { ...prev, thinking: false } : prev));
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedId, plies]);

  return info;
}

export function GlassEngine({ info }: { info: SearchInfo | null }) {
  const evalLabel = info
    ? `${info.evalCp >= 0 ? "+" : ""}${(info.evalCp / 100).toFixed(2)}`
    : "…";

  return (
    <section
      className="mx-4 mt-3 border border-ink px-3 py-2"
      data-testid="glass-engine"
      aria-live="polite"
      aria-label="Live engine search"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
          Engine
        </p>
        <p className="font-mono text-[12px] text-score-red" data-testid="engine-eval">
          {evalLabel}
        </p>
      </div>
      <p className="mt-1 truncate font-mono text-[13px] text-book-blue" data-testid="engine-pv">
        {info?.pv.length ? info.pv.join(" ") : "…"}
      </p>
      <p className="mt-0.5 font-mono text-[10px] text-faded">
        {info
          ? `d${info.depth} · ${info.nps.toLocaleString()} n/s${info.thinking ? " · …" : ""}`
          : "searching"}
      </p>
    </section>
  );
}
