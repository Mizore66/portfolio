"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Ply } from "@/lib/opening/types";

/** A position the front-page board can show: minimal data, serialised from the server. */
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

export function FrontGame({
  stops,
  initial,
  children,
}: {
  stops: Record<string, BoardStop>;
  initial: string;
  children: React.ReactNode;
}) {
  const [nodeId, setNodeId] = useState(initial);
  const value = useMemo<Ctx>(
    () => ({ stop: stops[nodeId] ?? stops[initial], select: (id) => stops[id] && setNodeId(id) }),
    [stops, nodeId, initial],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useFrontGame(): Ctx {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useFrontGame outside FrontGame");
  return ctx;
}
