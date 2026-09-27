"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { enginePlies } from "@/lib/board/position";
import { boardStore, useBoard } from "@/lib/board/store";
import type { Ply } from "@/lib/opening/types";

/** A position the board can show: minimal data, serialised from the server. */
export type BoardStop = {
  nodeId: string;
  /** Engine plies from the start. */
  plies: Ply[];
  /** "10…Bg4" */
  move: string;
  title: string;
  /** Who or what the move stands for, e.g. "FaultLine". */
  chapter: string;
};

type Ctx = { stop: BoardStop; select: (nodeId: string) => void };

const GameContext = createContext<Ctx | null>(null);

/**
 * The page's view of the shared board store (lib/board/store.ts). The move
 * lives in the store so the 2D board, every 3D view, the chart and the URL
 * agree, across client navigations too. On arrival a page starts at its
 * `initial` move, unless the visitor is coming back from a project, in which
 * case the board plays that move backwards ("takeback", brief §4).
 */
export function FrontGame({ stops, initial, children }: { stops: Record<string, BoardStop>; initial: string; children: React.ReactNode }) {
  const nodeId = useBoard((s) => s.nodeId);
  const data = useBoard((s) => s.data);

  useEffect(() => {
    const s = boardStore().getState();
    const back = s.takeback && s.data?.nodes[s.takeback]?.parent;
    if (back) s.setNode(back, "takeback");
    else s.setNode(initial, "init");
  }, [initial]);

  const value = useMemo<Ctx>(() => {
    let stop: BoardStop | undefined = stops[nodeId];
    if (!stop && data?.nodes[nodeId]) {
      const n = data.nodes[nodeId];
      stop = { nodeId, plies: enginePlies(data, nodeId), move: n.move, title: n.title, chapter: n.chapter };
    }
    return { stop: stop ?? stops[initial], select: (id) => boardStore().getState().setNode(id, "user") };
  }, [stops, nodeId, data, initial]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useFrontGame(): Ctx {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useFrontGame outside FrontGame");
  return ctx;
}
