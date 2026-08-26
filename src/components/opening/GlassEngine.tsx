"use client";

import { useEffect, useState } from "react";
import {
  clonePos,
  fromPieces,
  numberPv,
  prepareSearch,
  search,
  type SearchInfo,
} from "@/lib/chess/engine";
import { positionAfter } from "@/lib/chess/replay";
import { lastPly, sideToMove } from "@/lib/opening/tree";
import type { Ply } from "@/lib/opening/types";

const MAX_DEPTH = 10;
const THINK_MS = 420;

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
        prepareSearch();
        for (let depth = 1; depth <= MAX_DEPTH && !cancelled; depth++) {
          const remain = THINK_MS - (performance.now() - t0);
          if (depth > 1 && remain < 12) break;
          const result = search(clonePos(pos), depth, { timeMs: Math.max(remain, 16) });
          if (cancelled) return;
          nodes += result.nodes;
          const ms = Math.max(1, performance.now() - t0);
          const thinking = depth < MAX_DEPTH && ms < THINK_MS - 12;
          setInfo({
            depth: result.depth,
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

export function GlassEngine({
  info,
  plyCount,
}: {
  info: SearchInfo | null;
  plyCount: number;
}) {
  return (
    <section
      className="mx-3 mt-2 border border-ink px-3 py-1.5"
      data-testid="glass-engine"
      aria-live="polite"
      aria-label="Live engine search"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
        Engine · 2200
      </p>
      <p className="mt-0.5 truncate font-mono text-[13px] text-book-blue" data-testid="engine-pv">
        {info?.pv.length ? numberPv(info.pv, plyCount) : "…"}
      </p>
      <p className="mt-0.5 font-mono text-[10px] text-faded">
        {info
          ? `d${info.depth} · ${info.nps.toLocaleString()} n/s${info.thinking ? " · …" : ""}`
          : "searching"}
      </p>
    </section>
  );
}
