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
import { SHOW_DEPTHS, visibleEngineLine, type BookLine } from "@/lib/chess/engine-view";
import { BROADSHEET } from "@/content/opening";
import { GLIDE_MS, depthPaintMs } from "@/lib/opening/motion";
import type { Color } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

const MAX_DEPTH = 11;
const SEARCH_BUDGET_MS = 900;

function afterPaint(ms: number): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (ms <= 0) {
          resolve();
          return;
        }
        window.setTimeout(resolve, ms);
      });
    });
  });
}

export function useEngineSearch(plies: Ply[], side: Color) {
  const [info, setInfo] = useState<SearchInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const last = plies[plies.length - 1] ?? null;

    async function run() {
      await new Promise((r) => window.setTimeout(r, GLIDE_MS));
      if (cancelled) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dwell = depthPaintMs(reduced);
      try {
        const pos = fromPieces(positionAfter(plies), side, last);
        prepareSearch();
        const tSearch = performance.now();
        let nodes = 0;
        for (let depth = 1; depth <= MAX_DEPTH && !cancelled; depth++) {
          const spent = performance.now() - tSearch;
          if (depth > SHOW_DEPTHS && spent > SEARCH_BUDGET_MS) break;
          const remain = Math.max(SEARCH_BUDGET_MS - spent, 16);
          const result = search(clonePos(pos), depth, { timeMs: remain });
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
          });
          await afterPaint(dwell);
          if (cancelled) return;
          if (!more) break;
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
  book,
  side,
  moveNumber,
  lampshade,
}: {
  info: SearchInfo | null;
  book?: BookLine | null;
  side: "w" | "b";
  moveNumber: number;
  lampshade: string;
}) {
  const line = visibleEngineLine(book ?? null, info);
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
        {line.pv.length ? numberPv(line.pv, side, moveNumber) : "…"}
      </p>
      <p
        className="mt-1 font-mono text-[10px] text-faded"
        data-testid="engine-depth"
        data-depth={info?.depth ?? 0}
        data-thinking={info?.thinking ? "true" : "false"}
      >
        {info
          ? `d${info.depth} · ${info.nps.toLocaleString()} n/s${info.thinking ? " · …" : ""}`
          : BROADSHEET.searching}
      </p>
      <p
        data-testid="engine-lampshade"
        className="engine-lampshade mt-2 font-display text-[13px] leading-snug italic text-ink"
      >
        {lampshade}
      </p>
    </section>
  );
}
