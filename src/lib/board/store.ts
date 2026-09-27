"use client";

import { createStore, useStore } from "zustand";
import type { Ply } from "@/lib/opening/types";
import type { BoardData } from "./position";

/**
 * One store for the board (brief §7): the 2D board, every 3D view, the eval
 * chart and the URL all read the current move from here. The move is a
 * `GameNode.id`, not an index, because the career tree has side lines.
 */

/** How a view frames the board. See CameraRig for the numbers. */
export type Framing = "hero" | "pane" | "raking" | "diagram";

/** What a view shows: the shared current move, or one fixed move. */
export type Binding = { kind: "current" } | { kind: "fixed"; nodeId: string };

export type BoardBox = {
  id: string;
  el: HTMLElement;
  framing: Framing;
  binding: Binding;
  /** Plays the career from the starting position once per session. */
  opening?: boolean;
};

export type Arrow = { from: string; to: string; weight: number; strong?: boolean };

/** What the engine is looking at and thinking, mirrored from AnalysisBoard (the engine itself is untouched). */
export type EngineLine = { plies: Ply[]; pv: Ply[]; evalCp: number | null; depth: number; searching: boolean };

export type BoardState = {
  /** The game tree, reduced (lib/board/data.ts). Set once by BoardRuntime. */
  data: BoardData | null;
  /** The move the shared boards show. */
  nodeId: string;
  /** Where the last change came from, so URL sync and animation can react differently. */
  source: "init" | "user" | "scroll" | "url" | "takeback";
  /** A project or role under the pointer or keyboard focus: candidate arrows fan out from its parent. */
  focusNode: string | null;
  boxes: Record<string, BoardBox>;
  /** Boxes whose 3D view has drawn its first frame; their printed diagram can fade. */
  ready: Record<string, true>;
  /** Whether the 3D module is loaded and running. */
  live: boolean;
  /** The engine's latest line, once "Start engine" has been pressed. */
  engine: EngineLine | null;
  /** The engine view: the board redrawn as characters while the engine searches. */
  engineView: boolean;
  /** Set when the visitor opens a project: on the next board, that move plays backwards. */
  takeback: string | null;
  /** A move to play out again from its parent position (opening a project, brief §4). */
  replay: { nodeId: string; key: number } | null;
  setData: (data: BoardData) => void;
  setNode: (nodeId: string, source?: BoardState["source"]) => void;
  setFocus: (nodeId: string | null) => void;
  register: (box: BoardBox) => void;
  unregister: (id: string) => void;
  markReady: (id: string) => void;
  setLive: (live: boolean) => void;
  setEngine: (line: EngineLine | null) => void;
  setEngineView: (on: boolean) => void;
  setTakeback: (nodeId: string | null) => void;
  /** Plays `nodeId`'s move from its parent position and makes it the current move. */
  playMove: (nodeId: string) => void;
};

export function createBoardStore(initial: string) {
  return createStore<BoardState>()((set) => ({
    data: null,
    nodeId: initial,
    source: "init",
    focusNode: null,
    boxes: {},
    ready: {},
    live: false,
    engine: null,
    engineView: false,
    takeback: null,
    replay: null,
    setData: (data) => set((s) => (s.data ? s : { data })),
    setNode: (nodeId, source = "user") => set((s) => (s.nodeId === nodeId ? s : { nodeId, source })),
    setFocus: (focusNode) => set({ focusNode }),
    register: (box) => set((s) => ({ boxes: { ...s.boxes, [box.id]: box } })),
    unregister: (id) =>
      set((s) => {
        const boxes = { ...s.boxes };
        const ready = { ...s.ready };
        delete boxes[id];
        delete ready[id];
        return { boxes, ready };
      }),
    markReady: (id) => set((s) => (s.ready[id] ? s : { ready: { ...s.ready, [id]: true } })),
    setLive: (live) => set({ live }),
    setEngine: (engine) => set({ engine }),
    setEngineView: (engineView) => set({ engineView }),
    setTakeback: (takeback) => set({ takeback }),
    playMove: (nodeId) => set({ replay: { nodeId, key: Date.now() }, nodeId, source: "user", focusNode: null }),
  }));
}

export type BoardStore = ReturnType<typeof createBoardStore>;

/**
 * The single store for the whole site. It lives outside React so the lazy 3D
 * chunk, the layout and every page share it across client navigations.
 */
let singleton: BoardStore | null = null;

export function boardStore(initial = "faultline"): BoardStore {
  if (!singleton) singleton = createBoardStore(initial);
  return singleton;
}

export function useBoard<T>(selector: (s: BoardState) => T): T {
  return useStore(boardStore(), selector);
}
