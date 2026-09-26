"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { BoardData } from "@/lib/board/position";
import { boardStore, useBoard } from "@/lib/board/store";

const BoardCanvas = dynamic(() => import("@/components/board3d/BoardCanvas"), { ssr: false });

type Nav = Navigator & { connection?: { saveData?: boolean } };

/** The 3D board is decoration over content that is already complete, so it loads only when it can help. */
function capable(): boolean {
  if ((navigator as Nav).connection?.saveData) return false;
  if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Seeds the shared board store with the game tree and loads the 3D chunk
 * after the page is interactive and idle, and only once a board box is on
 * screen (brief §7). Until then every box shows its printed diagram.
 */
export function BoardRuntime({ data }: { data: BoardData }) {
  const [load, setLoad] = useState(false);
  const boxes = useBoard((s) => s.boxes);

  useEffect(() => {
    boardStore().getState().setData(data);
  }, [data]);

  const boxCount = Object.keys(boxes).length;
  useEffect(() => {
    if (load || !boxCount || !capable()) return;
    let cancelled = false;
    const els = Object.values(boardStore().getState().boxes).map((b) => b.el);
    const idle = (fn: () => void) => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(fn, { timeout: 2500 });
      else setTimeout(fn, 1200);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const go = () => !cancelled && setLoad(true);
        if (document.readyState === "complete") idle(go);
        else window.addEventListener("load", () => idle(go), { once: true });
      },
      { rootMargin: "200px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [boxCount, load]);

  return load ? <BoardCanvas /> : null;
}
