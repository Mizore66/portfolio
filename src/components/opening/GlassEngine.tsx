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
import { GLIDE_MS } from "@/lib/opening/motion";
import type { Color } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

const MAX_DEPTH = 11;
const THINK_MS = 560;

export function useEngineSearch(plies: Ply[], side: Color) {
  const [info, setInfo] = useState<SearchInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t0 = performance.now();
    let nodes = 0;
    const last = plies[plies.length - 1] ?? null;

    async function run() {
      await new Promise((r) => window.setTimeout(r, GLIDE_MS));
      if (cancelled) return;
      try {
        const pos = fromPieces(positionAfter(plies), side, last);
        prepareSearch();
        for (let depth = 1; depth <= MAX_DEPTH && !cancelled; depth++) {
          const remain = THINK_MS - (performance.now() - t0 - GLIDE_MS);
          if (depth > 1 && remain < 12) break;
          const result = search(clonePos(pos), depth, { timeMs: Math.max(remain, 16) });
          if (cancelled) return;
          if (result.timedOut && result.pv.length === 0) break;
          nodes += result.nodes;
          const ms = Math.max(1, performance.now() - t0 - GLIDE_MS);
          const thinking = !result.timedOut && depth < MAX_DEPTH && ms < THINK_MS - 12;
          setInfo({
            depth: result.depth,
            nodes,
            nps: Math.round((nodes / ms) * 1000),
            evalCp: result.score,
            pv: result.pv,
            best: result.best,
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
  }, [plies, side]);

  return info;
}

export function GlassEngine({
  info,
  side,
  moveNumber,
  lampshade,
}: {
  info: SearchInfo | null;
  side: "w" | "b";
  moveNumber: number;
  lampshade?: string | null;
}) {
  return (
    <section
      className="box-inset border-2 border-ink"
      data-testid="glass-engine"
      aria-live="polite"
      aria-label="Live engine search"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
        Engine · 2200
      </p>
      <p className="mt-1 truncate font-mono text-[13px] text-book-blue" data-testid="engine-pv">
        {info?.pv.length ? numberPv(info.pv, side, moveNumber) : "…"}
      </p>
      <p className="mt-1 font-mono text-[10px] text-faded">
        {info
          ? `d${info.depth} · ${info.nps.toLocaleString()} n/s${info.thinking ? " · …" : ""}`
          : "searching"}
      </p>
      {lampshade ? (
        <p data-testid="engine-lampshade" className="mt-2 font-display text-[13px] italic text-ink">
          {lampshade}
        </p>
      ) : null}
    </section>
  );
}
